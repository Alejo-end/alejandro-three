'use client'

import { useEffect, useMemo, useRef } from 'react'
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

const FADE = 0.18 // how much of the burst is spent dissolving the surface

/**
 * Every vertex of the mesh, kept as a loose grain with the direction it will
 * scatter in. This is what the scan looked like before it was surfaced, so the
 * burst puts it back to a point cloud rather than shattering it into debris.
 */
function buildGrains(root) {
  root.updateMatrixWorld(true)

  const chunks = []
  let total = 0
  root.traverse((child) => {
    if (!child.isMesh) return
    const { position, uv } = child.geometry.attributes
    if (!position) return
    chunks.push({ position, uv, matrix: child.matrixWorld })
    total += position.count
  })
  if (!total) return null

  const positions = new Float32Array(total * 3)
  const uvs = new Float32Array(total * 2)
  const dirs = new Float32Array(total * 3)
  const seeds = new Float32Array(total)

  const v = new Vector3()
  let i = 0
  for (const chunk of chunks) {
    for (let k = 0; k < chunk.position.count; k++, i++) {
      v.fromBufferAttribute(chunk.position, k).applyMatrix4(chunk.matrix)
      positions[i * 3] = v.x
      positions[i * 3 + 1] = v.y
      positions[i * 3 + 2] = v.z
      if (chunk.uv) {
        uvs[i * 2] = chunk.uv.getX(k)
        uvs[i * 2 + 1] = chunk.uv.getY(k)
      }
      seeds[i] = Math.random()
    }
  }

  // Scatter outward from the centre, roughened so grains do not travel in
  // tidy radial lines.
  const centre = new Vector3()
  for (let k = 0; k < total; k++) {
    centre.x += positions[k * 3]
    centre.y += positions[k * 3 + 1]
    centre.z += positions[k * 3 + 2]
  }
  centre.divideScalar(total)

  for (let k = 0; k < total; k++) {
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
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
  geometry.setAttribute('aDir', new BufferAttribute(dirs, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
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
    gl_PointSize = uSize * (300.0 / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    vec4 texel = texture2D(uMap, vUv);
    gl_FragColor = vec4(texel.rgb, uOpacity);
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
export function Scan({ name, fill = 0.7, burst = false, ...props }) {
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

  const grains = useMemo(() => buildGrains(model), [model])

  const grainMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: diffuseMap },
          uBurst: { value: 0 },
          uSpan: { value: span },
          uSize: { value: 1.7 },
          uOpacity: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [diffuseMap, span],
  )

  useEffect(() => {
    return () => {
      grains?.dispose()
      grainMaterial.dispose()
    }
  }, [grains, grainMaterial])

  useFrame((_, delta) => {
    const target = burst ? 1 : 0
    const step = Math.min(1, delta * (burst ? 2.4 : 3.4))
    progress.current += (target - progress.current) * step
    if (Math.abs(target - progress.current) < 0.001) progress.current = target

    const t = progress.current
    grainMaterial.uniforms.uBurst.value = t * t * (3 - 2 * t)
    const dissolve = Math.min(1, t / FADE)
    grainMaterial.uniforms.uOpacity.value = dissolve

    // The surface fades out over the first sliver of the burst, while the
    // grains are still sitting exactly where its vertices were.
    if (surface.current) {
      surface.current.visible = dissolve < 1
      surface.current.traverse((child) => {
        if (!child.isMesh) return
        child.material.transparent = dissolve > 0
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
