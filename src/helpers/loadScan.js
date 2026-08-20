import { BufferAttribute, BufferGeometry, DefaultLoadingManager, Sphere, Vector3 } from 'three'

const MAGIC = 0x4e414353 // 'SCAN'

/** A typed-array view needs its offset aligned to its element size. Version 1
    wrote the u32 index buffer last, which lands unaligned whenever the vertex
    count is odd, so those files need one copy to be readable at all. */
function view(Type, buffer, byteOffset, length) {
  const width = Type.BYTES_PER_ELEMENT
  if (byteOffset % width === 0) return new Type(buffer, byteOffset, length)
  return new Type(buffer.slice(byteOffset, byteOffset + length * width))
}

/**
 * Reads a packed scan (see scripts/pack-scans.mjs). The buffers are handed to
 * the GPU exactly as they arrive: positions and UVs are normalised u16, so the
 * mesh's own scale and offset put the geometry back at its real size and there
 * is nothing to decode on the main thread.
 */
export async function loadScan(url, signal) {
  // Announced to three's default manager so anything watching load progress
  // sees this fetch alongside the texture.
  DefaultLoadingManager.itemStart(url)
  let buffer
  try {
    const response = await fetch(url, { signal, cache: 'no-cache' })
    if (!response.ok) throw new Error(`${url} returned ${response.status}`)
    buffer = await response.arrayBuffer()
  } catch (error) {
    DefaultLoadingManager.itemError(url)
    DefaultLoadingManager.itemEnd(url)
    throw error
  }
  DefaultLoadingManager.itemEnd(url)

  const head = new DataView(buffer)
  if (head.getUint32(0, true) !== MAGIC) {
    throw new Error(`${url} is not a packed scan — re-run scripts/pack-scans.mjs`)
  }

  const headerLength = head.getUint32(4, true)
  // Version 1 padded the header with NUL bytes, which JSON.parse rejects.
  const raw = new TextDecoder().decode(new Uint8Array(buffer, 8, headerLength)).replace(/\0+$/, '').trim()
  const { version = 1, count, indexCount, min, size } = JSON.parse(raw)

  let at = 8 + headerLength
  let indices
  let positions
  let uvs

  if (version >= 2) {
    // Indices first, so every view that follows stays aligned for any count.
    indices = view(Uint32Array, buffer, at, indexCount)
    at += indexCount * 4
    positions = view(Uint16Array, buffer, at, count * 3)
    at += count * 6
    uvs = view(Uint16Array, buffer, at, count * 2)
  } else {
    positions = view(Uint16Array, buffer, at, count * 3)
    at += count * 6
    uvs = view(Uint16Array, buffer, at, count * 2)
    at += count * 4
    indices = view(Uint32Array, buffer, at, indexCount)
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3, true))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2, true))
  geometry.setIndex(new BufferAttribute(indices, 1))

  // Quantised positions span the unit cube, so the bounds are known without
  // walking the buffer. Setting them by hand skips a pass over half a million
  // vertices and stops three doing it lazily on the first raycast.
  geometry.boundingSphere = new Sphere(new Vector3(0.5, 0.5, 0.5), Math.sqrt(3) / 2)

  return { geometry, offset: min, size, count, triangles: indexCount / 3 }
}
