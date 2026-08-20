'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useRef } from 'react'

const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Rig = dynamic(() => import('@/components/View').then((mod) => mod.Rig), { ssr: false })
const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

/**
 * A bounded viewport for one scanned mesh. The box is deliberately small: the
 * renderer only draws the scissored region, so a modest panel costs a fraction
 * of a full-window canvas. No lights are set up — these captures carry their
 * own baked lighting and are drawn unlit.
 *
 * The scatter follows the cursor and there is no mode to switch on. Grains lift
 * off wherever you point and settle back behind you, so the surface is only
 * ever disturbed where you are touching it.
 */
export function ScanViewer({ name, mode, rotation }) {
  const box = useRef(null)
  // A ref, not state: this updates on every pointer move and must not re-render.
  const pointer = useRef({ active: false, x: 0, y: 0 })

  useEffect(() => {
    // Listening on the window rather than the panel: OrbitControls captures the
    // pointer while you drag, which stops element handlers firing and would
    // otherwise freeze or reset the scatter mid-rotation.
    const onMove = (event) => {
      const node = box.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      pointer.current.active = x >= 0 && x <= 1 && y >= 0 && y <= 1
      pointer.current.x = x * 2 - 1
      pointer.current.y = -(y * 2) + 1
    }
    const onLeave = () => {
      pointer.current.active = false
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointercancel', onLeave)
    document.addEventListener('pointerleave', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointercancel', onLeave)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <figure className='m-0'>
      <div ref={box} className='relative h-[48vh] max-h-[28rem] min-h-[16rem] w-full touch-none'>
        <View orbit className='absolute inset-0'>
          <Suspense fallback={null}>
            <Scan name={name} mode={mode} rotation={rotation} pointer={pointer} />
            <Rig position={[3.2, 2.5, 4.4]} />
          </Suspense>
        </View>
      </div>

      <figcaption className='t-label mt-4 border-t border-rule pt-3 text-muted'>
        Move across it to disturb the surface · drag to rotate
      </figcaption>
    </figure>
  )
}
