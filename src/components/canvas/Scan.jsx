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
  Plane,
  Raycaster,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three'

const GRAIN_CAP = 70000

/**
 * How each object comes apart. The scan is the same technique every time; what
 * it is decides how it should behave when you disturb it, so a snowman sags,
 * a bin spills, and a record sleeve shears into bands.
 */
const SCATTER = {
  // Geese: everything goes up and outward, the way birds leave a plinth.
  lift: (out, local, span, v) => v.set(out.x * 0.45, 1.15 + Math.random() * 0.5, out.z * 0.45),
  // Litter bin: tips outward and drops.
  spill: (out, local, span, v) => v.set(out.x * 1.25, -0.75 - Math.random() * 0.5, out.z * 1.25),
  // Snow: barely leaves, mostly sags.
  melt: (out, local, span, v) => v.set(out.x * 0.55, -1.3 - Math.random() * 0.3, out.z * 0.55),
  // Record sleeve: slips sideways in horizontal bands, like a mistracked scan.
  shear: (out, local, span, v) => {
    const band = Math.floor((local.y / span + 0.5) * 11)
    v.set(band % 2 ? 1.4 : -1.4, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.35)
  },
  // Paper label: ripples off the surface along its length.
  peel: (out, local, span, v) => {
    const wave = Math.sin((local.z / span) * 11)
    v.set(out.x * 0.3, 0.75 + wave * 0.6, out.z * 0.3)
  },
}

/**
 * A sample of the mesh's vertices, each carrying the direction it scatters in.
 * Vertices are taken on a stride: these meshes run to half a million points and
 * drawing every one of them as a sprite costs more than the field is worth.
 */
function buildGrains(root, mode, span) {
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
  const capacity = Math.ceil(available / stride)

  const positions = new Float32Array(capacity * 3)
  const uvs = new Float32Array(capacity * 2)
  const dirs = new Float32Array(capacity * 3)
  const seeds = new Float32Array(capacity)

  const v = new Vector3()
  const centre = new Vector3()
  let count = 0
  let seen = 0

  for (const chunk of chunks) {
    for (let k = 0; k < chunk.position.count; k++, seen++) {
      if (seen % stride || count >= capacity) continue
      v.fromBufferAttribute(chunk.position, k).applyMatrix4(chunk.matrix)
      positions[count * 3] = v.x
      positions[count * 3 + 1] = v.y
      positions[count * 3 + 2] = v.z
      centre.add(v)
      if (chunk.uv) {
        uvs[count * 2] = chunk.uv.getX(k)
        uvs[count * 2 + 1] = chunk.uv.getY(k)
      }
      seeds[count] = Math.random()
      count++
    }
  }
  if (!count) return null
  centre.divideScalar(count)

  const scatter = SCATTER[mode] || SCATTER.lift
  const out = new Vector3()
  const local = new Vector3()

  for (let k = 0; k < count; k++) {
    local.set(positions[k * 3], positions[k * 3 + 1], positions[k * 3 + 2])
    out.copy(local).sub(centre)
    if (out.lengthSq() < 1e-12) out.set(Math.random() - 0.5, 0, Math.random() - 0.5)
    out.normalize()

    scatter(out, local.clone().sub(centre), span, v)
    v.x += (Math.random() - 0.5) * 0.45
    v.y += (Math.random() - 0.5) * 0.45
    v.z += (Math.random() - 0.5) * 0.45
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

// Only grains near the pointer are disturbed, and only those are drawn. A grain
// at rest collapses to zero size, so the surface is never speckled with dots
// sitting on top of it.
const vertexShader = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSeed;
  uniform vec3 uPointer;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uSpan;
  uniform float uSize;
  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    vUv = uv;

    float reach = 1.0 - smoothstep(uRadius * 0.12, uRadius, distance(position, uPointer));
    float influence = reach * uStrength;

    vec3 p = position + aDir * influence * uSpan * (0.06 + aSeed * 0.5);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    vAlpha = influence;
    gl_PointSize = influence < 0.015 ? 0.0 : clamp(uSize * (300.0 / max(0.001, -mv.z)), 1.0, 3.5);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    if (vAlpha < 0.02) discard;
    vec4 texel = texture2D(uMap, vUv);
    gl_FragColor = vec4(texel.rgb, vAlpha);
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
export function Scan({ name, mode = 'lift', pointer, fill = 0.74, ...props }) {
  const materials = useLoader(MTLLoader, `/${name}/${name}.mtl`)
  const obj = useLoader(OBJLoader, `/${name}/${name}.obj`)
  const diffuseMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_diffuse.jpg`)
  const normalMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_normal.jpg`)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const grainNode = useRef(null)

  useEffect(() => {
    materials?.preload()
    diffuseMap.colorSpace = SRGBColorSpace
    diffuseMap.needsUpdate = true
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
    const safe = Number.isFinite(longest) && longest > 0 ? longest : 1

    return {
      model: clone,
      offset: Number.isFinite(centre.x) ? [-centre.x, -centre.y, -centre.z] : [0, 0, 0],
      unit: 1 / safe,
      span: safe,
    }
  }, [obj, materials, diffuseMap, normalMap])

  const grains = useMemo(() => buildGrains(model, mode, span), [model, mode, span])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: diffuseMap },
          uPointer: { value: new Vector3(0, 0, 0) },
          uRadius: { value: span * 0.3 },
          uStrength: { value: 0 },
          uSpan: { value: span },
          uSize: { value: 1.7 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [diffuseMap, span],
  )

  useEffect(() => () => material.dispose(), [material])
  useEffect(() => () => grains?.dispose(), [grains])

  const rig = useMemo(
    () => ({
      ray: new Raycaster(),
      plane: new Plane(),
      normal: new Vector3(),
      origin: new Vector3(),
      hit: new Vector3(),
      ndc: new Vector2(),
      settled: new Vector3(),
    }),
    [],
  )

  useFrame((_, delta) => {
    const node = grainNode.current
    if (!node || !pointer) return

    const { active, x, y } = pointer.current
    const step = Math.min(1, delta * 6)
    material.uniforms.uStrength.value += ((active ? 1 : 0) - material.uniforms.uStrength.value) * step

    if (active) {
      // Where the cursor lands on a plane through the object, facing the camera.
      rig.ndc.set(x, y)
      rig.ray.setFromCamera(rig.ndc, camera)
      camera.getWorldDirection(rig.normal)
      node.getWorldPosition(rig.origin)
      rig.plane.setFromNormalAndCoplanarPoint(rig.normal.negate(), rig.origin)
      if (rig.ray.ray.intersectPlane(rig.plane, rig.hit)) {
        node.worldToLocal(rig.hit)
        rig.settled.lerp(rig.hit, Math.min(1, delta * 14))
        material.uniforms.uPointer.value.copy(rig.settled)
      }
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
      <group position={offset}>
        <primitive object={model} />
      </group>
      {grains && <points ref={grainNode} geometry={grains} material={material} position={offset} />}
    </group>
  )
}
