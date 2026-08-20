'use client'

import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { r3f } from '@/helpers/global'
import * as THREE from 'three'

if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => (window.__err ||= []).push(String(e.message)))
  window.addEventListener('unhandledrejection', (e) => (window.__err ||= []).push('reject: ' + String(e.reason)))
}

export default function Scene({ ...props }) {
  if (typeof window !== 'undefined') (window.__log ||= []).push('scene-body')
  // Everything defined in here will persist between route changes, only children are swapped
  return (
    <Canvas
      {...props}
      // react-three-fiber measures its container with react-use-measure, which
      // by default recomputes on scroll. Inside this fixed, pointer-transparent
      // overlay that first measurement never lands on a page short enough not
      // to scroll, so the root is never configured and nothing renders at all.
      resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
      onCreated={(state) => { (window.__log ||= []).push('canvas-created'); state.gl.toneMapping = THREE.AgXToneMapping }}
    >
      {/* @ts-ignore */}
      <r3f.Out />
      <Preload all />
    </Canvas>
  )
}
