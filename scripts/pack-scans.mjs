/**
 * Packs a RealityScan export into something a browser can open quickly.
 *
 * The originals are hostile to the web: a 120 MB ASCII OBJ has to be parsed a
 * character at a time on the main thread, and a pair of 8192px maps costs half
 * a gigabyte of GPU memory once decoded. This writes an indexed, quantised
 * binary mesh (read as typed-array views, no parsing) and one right-sized
 * albedo. Photogrammetry bakes its lighting into that albedo, so the normal
 * map and the vertex normals are both dropped: nothing re-lights these.
 *
 * Sources live in assets/ so they are versioned but never deployed.
 *
 *   node --max-old-space-size=6144 scripts/pack-scans.mjs
 */
import { createReadStream } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline'

const SCANS = ['Afx', 'Erzbrau', 'Trash_Can', 'Snowman', 'Lintulahdenaukio']
const MAGIC = 0x4e414353 // 'SCAN'

async function readObj(path) {
  const px = []
  const uv = []
  const corners = [] // v/vt pairs, three per triangle
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity })

  for await (const line of rl) {
    if (line.charCodeAt(0) === 118) {
      // 'v ' or 'vt '
      if (line.charCodeAt(1) === 32) {
        const p = line.split(/\s+/)
        px.push(+p[1], +p[2], +p[3])
      } else if (line.charCodeAt(1) === 116) {
        const p = line.split(/\s+/)
        uv.push(+p[1], +p[2])
      }
    } else if (line.charCodeAt(0) === 102 && line.charCodeAt(1) === 32) {
      const parts = line.split(/\s+/)
      const face = []
      for (let i = 1; i < parts.length; i++) {
        if (!parts[i]) continue
        const bits = parts[i].split('/')
        face.push([+bits[0] - 1, bits[1] ? +bits[1] - 1 : -1])
      }
      // Fan-triangulate anything with more than three corners.
      for (let i = 2; i < face.length; i++) corners.push(face[0], face[i - 1], face[i])
    }
  }
  return { px, uv, corners }
}

function pack({ px, uv, corners }) {
  // Unique (position, uv) pairs become the vertex buffer.
  const uvCount = uv.length / 2 || 1
  const lookup = new Map()
  const posOut = []
  const uvOut = []
  const indices = new Uint32Array(corners.length)

  for (let i = 0; i < corners.length; i++) {
    const [vi, ti] = corners[i]
    const key = vi * (uvCount + 1) + (ti + 1)
    let index = lookup.get(key)
    if (index === undefined) {
      index = posOut.length / 3
      lookup.set(key, index)
      posOut.push(px[vi * 3], px[vi * 3 + 1], px[vi * 3 + 2])
      uvOut.push(ti >= 0 ? uv[ti * 2] : 0, ti >= 0 ? uv[ti * 2 + 1] : 0)
    }
    indices[i] = index
  }

  const count = posOut.length / 3
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < count; i++) {
    for (let a = 0; a < 3; a++) {
      const v = posOut[i * 3 + a]
      if (v < min[a]) min[a] = v
      if (v > max[a]) max[a] = v
    }
  }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]].map((s) => s || 1)

  // Quantised to normalised u16: three reads these straight off the GPU, so the
  // mesh's own scale and offset put it back where it belongs. No dequantising.
  const qPos = new Uint16Array(count * 3)
  const qUv = new Uint16Array(count * 2)
  for (let i = 0; i < count; i++) {
    for (let a = 0; a < 3; a++) {
      qPos[i * 3 + a] = Math.round(((posOut[i * 3 + a] - min[a]) / size[a]) * 65535)
    }
    qUv[i * 2] = Math.round(Math.min(1, Math.max(0, uvOut[i * 2])) * 65535)
    qUv[i * 2 + 1] = Math.round(Math.min(1, Math.max(0, uvOut[i * 2 + 1])) * 65535)
  }

  return { count, min, size, qPos, qUv, indices }
}

function encode({ count, min, size, qPos, qUv, indices }) {
  // Padded with spaces, not zeros: the reader decodes the whole padded span and
  // JSON.parse tolerates trailing whitespace but not trailing NULs.
  let json = JSON.stringify({ version: 2, count, indexCount: indices.length, min, size })
  while (json.length % 4) json += ' '
  const header = Buffer.from(json, 'utf8')

  // Indices go first. They are the only 4-byte-wide buffer, so putting them
  // immediately after the 4-aligned header keeps every view aligned no matter
  // whether the vertex count is odd or even.
  const out = Buffer.alloc(8 + header.length + indices.byteLength + qPos.byteLength + qUv.byteLength)

  let at = 0
  out.writeUInt32LE(MAGIC, at); at += 4
  out.writeUInt32LE(header.length, at); at += 4
  header.copy(out, at); at += header.length
  Buffer.from(indices.buffer, indices.byteOffset, indices.byteLength).copy(out, at); at += indices.byteLength
  Buffer.from(qPos.buffer, qPos.byteOffset, qPos.byteLength).copy(out, at); at += qPos.byteLength
  Buffer.from(qUv.buffer, qUv.byteOffset, qUv.byteLength).copy(out, at)
  return out
}

for (const name of SCANS) {
  const started = Date.now()
  const raw = await readObj(`assets/${name}/${name}.obj`)
  const packed = pack(raw)
  const bytes = encode(packed)
  await mkdir(`public/scans/${name}`, { recursive: true })
  await writeFile(`public/scans/${name}/mesh.bin`, bytes)
  console.log(
    `${name.padEnd(18)} ${(packed.count / 1000).toFixed(0)}k verts  ` +
      `${(packed.indices.length / 3000).toFixed(0)}k tris  ` +
      `${(bytes.length / 1048576).toFixed(1)} MB  ${((Date.now() - started) / 1000).toFixed(0)}s`,
  )
}
