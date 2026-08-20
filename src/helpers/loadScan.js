import { BufferAttribute, BufferGeometry, DefaultLoadingManager, Sphere, Vector3 } from 'three'

const MAGIC = 0x4e414353 // 'SCAN'

/**
 * Reads a packed scan (see scripts/pack-scans.mjs). The buffers are handed to
 * the GPU exactly as they arrive: positions and UVs are normalised u16, so the
 * mesh's own scale and offset put the geometry back at its real size and there
 * is nothing to decode on the main thread.
 */
export async function loadScan(url, signal) {
  // Announced to three's default manager so drei's useProgress reports this
  // fetch alongside the texture, and the page's readout stays truthful.
  DefaultLoadingManager.itemStart(url)
  let buffer
  try {
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`)
    buffer = await response.arrayBuffer()
  } catch (error) {
    DefaultLoadingManager.itemError(url)
    throw error
  } finally {
    DefaultLoadingManager.itemEnd(url)
  }

  const head = new DataView(buffer)
  if (head.getUint32(0, true) !== MAGIC) throw new Error(`${url} is not a packed scan`)

  const headerLength = head.getUint32(4, true)
  const header = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 8, headerLength)))
  const { count, indexCount, min, size } = header

  let at = 8 + headerLength
  const positions = new Uint16Array(buffer, at, count * 3)
  at += positions.byteLength
  const uvs = new Uint16Array(buffer, at, count * 2)
  at += uvs.byteLength
  const indices = new Uint32Array(buffer, at, indexCount)

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
