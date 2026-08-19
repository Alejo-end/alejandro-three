'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'

const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/View').then((mod) => mod.Common), { ssr: false })
const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

/**
 * A bounded viewport for one scanned mesh. The box is deliberately small: the
 * renderer only draws the scissored region, so a modest panel costs a fraction
 * of a full-window canvas. Pointing at it scatters the mesh into the grains it
 * was built from; moving away puts it back.
 */
export function ScanViewer({ name, rotation }) {
  const [burst, setBurst] = useState(false)

  return (
    <figure className='m-0'>
      <div
        onPointerEnter={() => setBurst(true)}
        onPointerLeave={() => setBurst(false)}
        className='relative h-[48vh] max-h-[28rem] min-h-[16rem] w-full'
      >
        <View orbit className='absolute inset-0'>
          <Suspense fallback={null}>
            <Scan name={name} rotation={rotation} burst={burst} />
            <Common position={[3.2, 2.5, 4.4]} />
          </Suspense>
        </View>
      </div>

      <figcaption className='t-label mt-4 border-t border-rule pt-3 text-muted'>
        {burst ? 'Scattered — move away to reassemble' : 'Point at it to scatter · drag to rotate'}
      </figcaption>
    </figure>
  )
}
