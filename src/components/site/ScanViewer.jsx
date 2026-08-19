'use client'

import dynamic from 'next/dynamic'
import { Suspense, useCallback, useEffect, useRef, useState } from 'react'

const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/View').then((mod) => mod.Common), { ssr: false })
const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

const DRAG_SLOP = 6 // px of movement that still counts as a click, not an orbit

/**
 * A window-sized viewport for one scanned mesh. Dragging anywhere orbits it;
 * a click without a drag scatters it into the grains it was built from.
 */
export function ScanViewer({ name, rotation }) {
  const [burst, setBurst] = useState(false)
  const down = useRef(null)

  const onPointerDown = useCallback((event) => {
    // Leave the notes panel's own links alone.
    if (event.target.closest('a, button')) {
      down.current = null
      return
    }
    down.current = { x: event.clientX, y: event.clientY }
  }, [])

  const onPointerUp = useCallback((event) => {
    const start = down.current
    down.current = null
    if (!start) return
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_SLOP) return
    setBurst((on) => !on)
  }, [])

  useEffect(() => {
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [onPointerDown, onPointerUp])

  return (
    <>
      <View orbit className='pointer-events-none fixed inset-0'>
        <Suspense fallback={null}>
          <Scan name={name} rotation={rotation} burst={burst} />
          <Common position={[3.2, 2.5, 4.4]} />
        </Suspense>
      </View>

      <p
        className='t-label pointer-events-none fixed inset-x-0 bottom-6 z-10 text-center text-muted'
        aria-live='polite'
      >
        {burst ? 'Click to reassemble' : 'Click to scatter'}
      </p>
    </>
  )
}
