'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const STEP = 2 // sample every Nth pixel
const CUTOFF = 0.94 // luminance above this is backdrop left over from the render
const SPAN = 4.4 // world size of the cloud along its longest axis
const DEPTH = 1.1 // how far dark pixels push back
const FILL = 0.58 // how much of the frame the cloud takes: legible object, not wallpaper

/**
 * Rebuilds one of the scan thumbnails as a point cloud, straight from its own
 * pixels: luminance becomes depth, so the object lifts off its backdrop.
 * A capture, captured again — and it costs a PNG instead of a 100MB mesh.
 */
function useImagePoints(src) {
  const [cloud, setCloud] = useState(null)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      if (cancelled) return
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx.drawImage(img, 0, 0)
      const { data } = ctx.getImageData(0, 0, img.width, img.height)

      // Pass one: keep the object's pixels and learn how much room it takes.
      const kept = []
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (let y = 0; y < img.height; y += STEP) {
        for (let x = 0; x < img.width; x += STEP) {
          const i = (y * img.width + x) * 4
          if (data[i + 3] < 24) continue
          const r = data[i] / 255
          const g = data[i + 1] / 255
          const b = data[i + 2] / 255
          const lum = 0.299 * r + 0.587 * g + 0.114 * b
          if (lum > CUTOFF) continue

          kept.push(x, y, r, g, b, lum)
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }

      if (!kept.length) return

      // Pass two: place the points against the object's own bounds, not the
      // image's, so an object shot small in frame still fills the viewport.
      const boxW = Math.max(1, maxX - minX)
      const boxH = Math.max(1, maxY - minY)
      const unit = SPAN / Math.max(boxW, boxH)
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2

      const count = kept.length / 6
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)
      const color = new THREE.Color()

      for (let k = 0, p = 0; k < kept.length; k += 6, p += 3) {
        positions[p] = (kept[k] - cx) * unit
        positions[p + 1] = -(kept[k + 1] - cy) * unit
        positions[p + 2] = (0.5 - kept[k + 5]) * DEPTH
        // Pull the sampled colour toward the page's ink so it reads on gray.
        color.setRGB(kept[k + 2], kept[k + 3], kept[k + 4]).multiplyScalar(0.72)
        colors[p] = color.r
        colors[p + 1] = color.g
        colors[p + 2] = color.b
      }

      setCloud({ positions, colors, width: boxW * unit, height: boxH * unit })
    }

    return () => {
      cancelled = true
    }
  }, [src])

  return cloud
}

export function PointScan({ src, ...props }) {
  const group = useRef(null)
  const material = useRef(null)
  const cloud = useImagePoints(src)
  const { viewport } = useThree()
  const fade = useRef(0)

  const geometry = useMemo(() => {
    if (!cloud) return null
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(cloud.positions, 3))
    g.setAttribute('color', new THREE.BufferAttribute(cloud.colors, 3))
    return g
  }, [cloud])

  useEffect(() => {
    fade.current = 0
    return () => geometry?.dispose()
  }, [geometry])

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()

    // Slow drift plus a light pointer parallax: enough to feel grabbable.
    group.current.rotation.y = Math.sin(t * 0.16) * 0.32 + state.pointer.x * 0.28
    group.current.rotation.x = Math.sin(t * 0.11) * 0.09 - state.pointer.y * 0.14
    group.current.position.y = Math.sin(t * 0.28) * 0.04

    if (material.current) {
      fade.current = Math.min(1, fade.current + delta * 2)
      material.current.opacity = fade.current
    }
  })

  if (!geometry) return null

  const scale = Math.min(viewport.width / cloud.width, viewport.height / cloud.height) * FILL

  return (
    <group ref={group} scale={scale} {...props}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={material}
          size={0.011}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
