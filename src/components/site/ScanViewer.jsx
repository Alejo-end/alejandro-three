'use client'

import dynamic from 'next/dynamic'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Scan } from '@/components/canvas/Scan'

// Only the pieces that touch the WebGL context are deferred; Scan is imported
// directly. Every extra dynamic boundary is another chunk that can go stale.
const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Rig = dynamic(() => import('@/components/View').then((mod) => mod.Rig), { ssr: false })

const STATE_TEXT = {
  loading: 'Loading mesh',
  ready: 'Move across it to disturb the surface · drag to rotate',
  failed: 'The mesh did not load — reload the page to try again',
}

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
  const [state, setState] = useState('loading')
  // A ref, not state: this updates on every pointer move and must not re-render.
  const pointer = useRef({ active: false, x: 0, y: 0 })

  // Stable, so it never re-triggers the loader effect that depends on it.
  const onState = useCallback((next) => setState(next), [])

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
            <Scan name={name} mode={mode} rotation={rotation} pointer={pointer} onState={onState} />
            <Rig position={[3.2, 2.5, 4.4]} />
          </Suspense>
        </View>
      </div>

      <div className='mt-4 border-t border-rule pt-3'>
        {state === 'loading' && <div aria-hidden className='loading-run mb-2 w-full' />}
        <figcaption className='t-label text-muted' role='status'>
          {STATE_TEXT[state]}
        </figcaption>
      </div>
    </figure>
  )
}
