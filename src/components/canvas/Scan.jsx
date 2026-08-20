'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  MeshBasicMaterial,
  Plane,
  Raycaster,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
} from 'three'
import { loadScan } from '@/helpers/loadScan'

const GRAIN_CAP = 60000

/**
 * How each object comes apart. The capture technique is the same every time;
 * what the thing *is* decides how it should behave when you disturb it, so a
 * snowman sags, a bin spills, and a record sleeve shears into bands.
 */
const SCATTER = {
  lift: (out, local, v) => v.set(out.x * 0.45, 1.15 + Math.random() * 0.5, out.z * 0.45),
  spill: (out, local, v) => v.set(out.x * 1.25, -0.75 - Math.random() * 0.5, out.z * 1.25),
  melt: (out, local, v) => v.set(out.x * 0.55, -1.3 - Math.random() * 0.3, out.z * 0.55),
  shear: (out, local, v) =>
    v.set(
      Math.floor((local.y + 0.5) * 11) % 2 ? 1.4 : -1.4,
      (Math.random() - 0.5) * 0.15,
      (Math.random() - 0.5) * 0.35,
    ),
  peel: (out, local, v) => v.set(out.x * 0.3, 0.75 + Math.sin(local.z * 11) * 0.6, out.z * 0.3),
}

/**
 * A strided sample of the mesh's own vertices, each carrying the direction it
 * scatters in. Positions stay in the quantised 0..1 space the mesh lives in, so
 * the grains share its transform.
 */
function buildGrains(geometry, mode) {
  const source = geometry.getAttribute('position')
  const sourceUv = geometry.getAttribute('uv')
  const available = source.count
  const stride = Math.max(1, Math.ceil(available / GRAIN_CAP))
  const count = Math.ceil(available / stride)

  const positions = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  const dirs = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  for (let k = 0, i = 0; i < count; k += stride, i++) {
    positions[i * 3] = source.getX(k)
    positions[i * 3 + 1] = source.getY(k)
    positions[i * 3 + 2] = source.getZ(k)
    uvs[i * 2] = sourceUv.getX(k)
    uvs[i * 2 + 1] = sourceUv.getY(k)
    seeds[i] = Math.random()
  }

  const scatter = SCATTER[mode] || SCATTER.lift
  const out = new Vector3()
  const local = new Vector3()
  const dir = new Vector3()

  for (let i = 0; i < count; i++) {
    // The mesh occupies the unit cube, so its centre is always (0.5, 0.5, 0.5).
    local.set(positions[i * 3] - 0.5, positions[i * 3 + 1] - 0.5, positions[i * 3 + 2] - 0.5)
    out.copy(local)
    if (out.lengthSq() < 1e-12) out.set(Math.random() - 0.5, 0, Math.random() - 0.5)
    out.normalize()

    scatter(out, local, dir)
    dir.x += (Math.random() - 0.5) * 0.45
    dir.y += (Math.random() - 0.5) * 0.45
    dir.z += (Math.random() - 0.5) * 0.45
    dir.normalize()

    dirs[i * 3] = dir.x
    dirs[i * 3 + 1] = dir.y
    dirs[i * 3 + 2] = dir.z
  }

  const grains = new BufferGeometry()
  grains.setAttribute('position', new BufferAttribute(positions, 3))
  grains.setAttribute('uv', new BufferAttribute(uvs, 2))
  grains.setAttribute('aDir', new BufferAttribute(dirs, 3))
  grains.setAttribute('aSeed', new BufferAttribute(seeds, 1))
  grains.boundingSphere = geometry.boundingSphere.clone()
  return grains
}

// Only grains near the pointer are disturbed, and only those are drawn: a grain
// at rest collapses to zero size, so the surface is never speckled with dots
// sitting on top of it.
const vertexShader = /* glsl */ `
  attribute vec3 aDir;
  attribute float aSeed;
  uniform vec3 uPointer;
  uniform vec3 uProportion;
  uniform float uRadius;
  uniform float uStrength;
  uniform float uSize;
  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    vUv = uv;

    // Grains live in the quantised unit cube, which the mesh then scales by its
    // real proportions. Both the reach and the travel are corrected by those
    // proportions, so a flat object scatters as far across its thin axis as a
    // tall one does across its long one.
    float reach = 1.0 - smoothstep(
      uRadius * 0.12,
      uRadius,
      length((position - uPointer) * uProportion)
    );
    float influence = reach * uStrength;

    vec3 travel = aDir / uProportion * influence * 0.2;
    vec4 mv = modelViewMatrix * vec4(position + travel, 1.0);
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
    gl_FragColor = vec4(texture2D(uMap, vUv).rgb, vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/**
 * One packed scan. Photogrammetry bakes its lighting into the albedo, so this
 * is drawn unlit: no lights, no normals, no normal map, and the capture reads
 * exactly as it was photographed.
 */
export function Scan({ name, mode = 'lift', pointer, fill = 0.74, onState, ...props }) {
  if (typeof window !== 'undefined') (window.__log ||= []).push('scan-body')
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const [scan, setScan] = useState(null)
  const frame = useRef(null)

  const map = useMemo(() => {
    const texture = new TextureLoader().load(`/scans/${name}/albedo.jpg`)
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 4
    return texture
  }, [name])

  useEffect(() => {
    const abort = new AbortController()
    let stale = false
    loadScan(`/scans/${name}/mesh.bin`, abort.signal)
      .then((result) => {
        if (stale) return
        setScan(result)
        onState?.('ready')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error(error)
        onState?.('failed')
      })
    return () => {
      stale = true
      abort.abort()
    }
  }, [name, onState])

  const surface = useMemo(() => new MeshBasicMaterial({ map }), [map])

  const grains = useMemo(() => (scan ? buildGrains(scan.geometry, mode) : null), [scan, mode])

  const grainMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: map },
          uPointer: { value: new Vector3(0.5, 0.5, 0.5) },
          uProportion: { value: new Vector3(1, 1, 1) },
          uRadius: { value: 0.34 },
          uStrength: { value: 0 },
          uSize: { value: 1.7 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [map],
  )

  // React runs every effect twice on mount in StrictMode, so the usual
  // `useEffect(() => () => thing.dispose(), [thing])` throws the texture and
  // the material away the instant they are made and the mesh renders as
  // nothing. Disposal waits a microtask and bails if we were re-mounted.
  const mounted = useRef(false)
  const live = useRef(null)
  live.current = { map, surface, grainMaterial, geometry: scan?.geometry, grains }

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const doomed = live.current
      queueMicrotask(() => {
        if (mounted.current) return
        doomed.map?.dispose()
        doomed.surface?.dispose()
        doomed.grainMaterial?.dispose()
        doomed.geometry?.dispose()
        doomed.grains?.dispose()
      })
    }
  }, [])

  const rig = useMemo(
    () => ({
      ray: new Raycaster(),
      plane: new Plane(),
      normal: new Vector3(),
      origin: new Vector3(),
      hit: new Vector3(),
      ndc: new Vector2(),
      settled: new Vector3(0.5, 0.5, 0.5),
    }),
    [],
  )

  useFrame((_, delta) => {
    const node = frame.current
    if (typeof window !== 'undefined') {
      window.__u = { frames: (window.__u?.frames || 0) + 1, node: !!node, scan: !!scan,
        active: pointer?.current?.active, ndc: pointer?.current && [pointer.current.x, pointer.current.y],
        strength: +grainMaterial.uniforms.uStrength.value.toFixed(3),
        ptr: grainMaterial.uniforms.uPointer.value.toArray().map(v => +v.toFixed(3)),
        grains: grains?.getAttribute('position')?.count ?? null }
    }
    if (!node || !pointer || !scan) return

    const longest = Math.max(scan.size[0], scan.size[1], scan.size[2])
    grainMaterial.uniforms.uProportion.value.set(
      scan.size[0] / longest,
      scan.size[1] / longest,
      scan.size[2] / longest,
    )

    const { active, x, y } = pointer.current
    const uniforms = grainMaterial.uniforms
    uniforms.uStrength.value += ((active ? 1 : 0) - uniforms.uStrength.value) * Math.min(1, delta * 6)

    if (!active) return
    rig.ndc.set(x, y)
    rig.ray.setFromCamera(rig.ndc, camera)
    camera.getWorldDirection(rig.normal)
    node.getWorldPosition(rig.origin)
    rig.plane.setFromNormalAndCoplanarPoint(rig.normal.negate(), rig.origin)
    if (rig.ray.ray.intersectPlane(rig.plane, rig.hit)) {
      node.worldToLocal(rig.hit)
      rig.settled.lerp(rig.hit, Math.min(1, delta * 14))
      uniforms.uPointer.value.copy(rig.settled)
    }
  })

  if (!scan) return null

  // useThree().viewport reports the whole canvas, not this View's scissored box,
  // so derive the visible extent from the camera and the View's own size.
  const distance = camera.position.length() || 6
  const visibleHeight = 2 * distance * Math.tan(((camera.fov || 40) * Math.PI) / 360)
  const visibleWidth = visibleHeight * (size.width / size.height)
  const longest = Math.max(scan.size[0], scan.size[1], scan.size[2])
  const scale = (Math.min(visibleWidth, visibleHeight) * fill) / longest

  // The quantised mesh spans the unit cube: scale it back to its real size and
  // shift so its centre sits on the origin.
  const centre = [-scan.size[0] / 2, -scan.size[1] / 2, -scan.size[2] / 2]

  return (
    <group scale={scale} {...props}>
      {/* The pointer is resolved against this group, not the points: it exists
          from the first frame, and its local space is the same unit cube. */}
      <group ref={frame} position={centre} scale={scan.size}>
        <mesh geometry={scan.geometry} material={surface} frustumCulled={false} />
        {grains && <points geometry={grains} material={grainMaterial} frustumCulled={false} />}
      </group>
    </group>
  )
}
