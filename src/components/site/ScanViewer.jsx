'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/View').then((mod) => mod.Common), { ssr: false })

/**
 * The viewport a scanned mesh hangs in. The mesh sizes itself (see Scan); the
 * camera sits three-quarters on and slightly above, which is the one angle that
 * reads for all of these — upright objects, a ground slab, and flat plates
 * alike — instead of a rotation guessed per model.
 */
export function ScanViewer({ children }) {
  return (
    <View orbit className='absolute inset-0'>
      <Suspense fallback={null}>
        {children}
        <Common position={[3.2, 2.5, 4.4]} />
      </Suspense>
    </View>
  )
}
