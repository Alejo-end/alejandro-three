'use client'

import { useEffect, useMemo } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { Box3, MeshPhongMaterial, TextureLoader, Vector3 } from 'three'

/**
 * One RealityScan export: an OBJ, its MTL, and the diffuse/normal pair, all
 * under /public/<name>/. Each scan comes out at its own arbitrary scale and
 * origin, so the mesh is measured and normalised here, where the geometry is
 * actually in hand, and then sized against the tighter side of the viewport.
 */
export function Scan({ name, fill = 0.72, ...props }) {
  const materials = useLoader(MTLLoader, `/${name}/${name}.mtl`)
  const obj = useLoader(OBJLoader, `/${name}/${name}.obj`)
  const diffuseMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_diffuse.jpg`)
  const normalMap = useLoader(TextureLoader, `/${name}/tex_u1_v1_normal.jpg`)
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)

  useEffect(() => {
    materials?.preload()
  }, [materials])

  const { model, offset, unit } = useMemo(() => {
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
    }
  }, [obj, materials, diffuseMap, normalMap, name])

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
    </group>
  )
}
