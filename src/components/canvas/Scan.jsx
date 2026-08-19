'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  MeshPhongMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from 'three'

const GRAIN_CAP = 60000 // dense enough for a small panel; the meshes carry up to 500k verts
const FADE = 0.16 // how much of the burst is spent dissolving the surface

/**
 * A sample of the mesh's vertices, each with the direction it scatters in.
 * This is what the scan looked like before it was surfaced, so the burst puts
 * it back to a point cloud rather than shattering it into debris.
 *
 * Vertices are taken on a stride rather than wholesale: these meshes run to
 * half a million points, and drawing every one of them as a sprite costs far
 * more than the grain field is worth.
 */
function buildGrains(root) {
  root.updateMatrixWorld(true)

  const chunks = []
  let available = 0
  root.traverse((child) => {
    if (!child.isMesh) return
    const { position, uv } = child.geometry.attributes
    if (!position) return
    chunks.push({ position, uv, matrix: child.matrixWorld })
    available += position.count
  })
  if (!available) return null

  const stride = Math.max(1, Math.ceil(available / GRAIN_CAP))
  const total = Math.ceil(available / stride)

  const positions = new Float32Array(total * 3)
  const uvs = new Float32Array(total * 2)
  const dirs = new Float32Array(total * 3)
  const seeds = new Float32Array(total)

  const v = new Vector3()
  const centre = new Vector3()
  let i = 0
  let seen = 0

  for (const chunk of chunks) {
    for (let k = 0; k < chunk.position.count; k++, seen++) {
      if (seen % stride || i >= total) continue
      v.fromBufferAttribute(chunk.position, k).applyMatrix4(chunk.matrix)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      centre.add(v)
      if (chunk.uv) {
        uvs[i * 2] = chunk.uv.getX(k)
        uvs[i * 2 + 1] = chunk.uv.getY(k)
      }
      seeds[i] = Math.random()
      i++
    }
  }

  const count = i
  centre.divideScalar(count || 1)

  // Scatter outward from the centre, roughened so grains do not travel in
  // tidy radial lines.
  for (let k = 0; k < count; k++) {
    v.set(positions[k * 3] - centre.x, positions[k * 3 + 1] - centre.y, positions[k * 3 + 2] - centre.z)
    if (v.lengthSq() < 1e-12) v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
    v.normalize()
    v.x += (Math.random() - 0.5) * 0.85
    v.y += (Math.random() - 0.5) * 0.85 + 0.18
    v.z += (Math.random() - 0.5) * 0.85
    v.normalize()
    dirs[k * 3] = v.x
    dirs[k * 3 + 1] = v.y
    dirs[k * 3 + 2] = v.z
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions.subarray(0, count * 3), 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs.subarray(0, count * 2), 2))
  geometry.setAttribute('aDir', new BufferAttribute(dirs.subarray(0, count * 3), 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seeds.subarray(0, count), 1))
  return geometry
}

const vertexShader = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSeed;
  uniform float uBurst;
  uniform float uSpan;
  uniform float uSize;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float travel = uBurst * uSpan * (0.05 + aSeed * 0.55);
    vec4 mv = modelViewMatrix * vec4(position + aDir * travel, 1.0);
    // Clamped: an unclamped sprite fills the screen as you zoom in, and the
    // fill cost goes up with the square of its size.
    gl_PointSize = clamp(uSize * (300.0 / max(0.001, -mv.z)), 1.0, 3.5);
    gl_Position = projectionMatrix * mv;
  }
`

// Opaque on purpose. Blending 80k sprites is the expensive part, and the
// grains sit exactly on the surface they replace, so nothing needs to fade.
const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  varying vec2 vUv;

  void main() {
    gl_FragColor = texture2D(uMap, vUv);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/**
 * One RealityScan export: an OBJ, its MTL, and the diffuse/normal pair, all
 * under /public/<name>/. Each scan comes out at its own arbitrary scale and
 * origin, so the mesh is measured and normalised here, then sized against the
 * tighter side of the viewport.
 */
export function Scan({ name, fill = 0.74, burst = false, ...props }) {
  const materials = useLoader(MTLLoader, `/${name}/${name}.mtl`)
  const obj = useLoader(OBJLoader, `/${name}/${name}.obj`)
  const diffuseMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_diffuse.jpg`)
  const normalMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_normal.jpg`)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const surface = useRef(null)
  const progress = useRef(0)

  useEffect(() => {
    materials?.preload()
    diffuseMap.colorSpace = SRGBColorSpace
  }, [materials, diffuseMap])

  const { model, offset, unit, span } = useMemo(() => {
    const clone = obj.clone()
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material =
          materials.materials[child.name] || new MeshPhongMaterial({ map: diffuseMap, normalMap })
      }
    })

    const box = new Box3().setFromObject(clone)
    const extent = box.getSize(new Vector3())
    const centre = box.getCenter(new Vector3())
    const longest = Math.max(extent.x, extent.y, extent.z)

    return {
      model: clone,
      offset: Number.isFinite(centre.x) ? [-centre.x, -centre.y, -centre.z] : [0, 0, 0],
      unit: Number.isFinite(longest) && longest > 0 ? 1 / longest : 1,
      span: Number.isFinite(longest) && longest > 0 ? longest : 1,
    }
  }, [obj, materials, diffuseMap, normalMap])

  // Built on the first click, not on load: most visitors never scatter it, and
  // the buffers are wasted memory until they do.
  const [grains, setGrains] = useState(null)
  useEffect(() => {
    setGrains(null)
  }, [model])
  useEffect(() => {
    if (burst) setGrains((existing) => existing ?? buildGrains(model))
  }, [burst, model])

  const grainMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: diffuseMap },
          uBurst: { value: 0 },
          uSpan: { value: span },
          uSize: { value: 1.6 },
        },
        vertexShader,
        fragmentShader,
      }),
    [diffuseMap, span],
  )

  useEffect(() => () => grainMaterial.dispose(), [grainMaterial])
  useEffect(() => () => grains?.dispose(), [grains])

  useFrame((_, delta) => {
    const target = burst ? 1 : 0
    if (progress.current === target) return

    const step = Math.min(1, delta * (burst ? 2.4 : 3.4))
    progress.current += (target - progress.current) * step
    if (Math.abs(target - progress.current) < 0.002) progress.current = target

    const t = progress.current
    grainMaterial.uniforms.uBurst.value = t * t * (3 - 2 * t)

    // The surface fades out over the first sliver of the burst, while the
    // grains are still sitting exactly where its vertices were.
    const dissolve = Math.min(1, t / FADE)
    if (surface.current) {
      surface.current.visible = dissolve < 1
      surface.current.traverse((child) => {
        if (!child.isMesh) return
        child.material.transparent = dissolve > 0 && dissolve < 1
        child.material.opacity = 1 - dissolve
      })
    }
  })

  // useThree().viewport reports the whole canvas, not this View's scissored box,
  // so derive the visible extent from the camera and the View's own size.
  const distance = camera.position.length() || 6
  const visibleHeight = 2 * distance * Math.tan(((camera.fov || 40) * Math.PI) / 360)
  const visibleWidth = visibleHeight * (size.width / size.height)
  const scale = Math.min(visibleWidth, visibleHeight) * fill * unit

  return (
    <group scale={scale} {...props}>
      <group ref={surface} position={offset}>
        <primitive object={model} />
      </group>
      {grains && <points geometry={grains} material={grainMaterial} position={offset} />}
    </group>
  )
}
