'use client'

import dynamic from 'next/dynamic'
import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

export default function Page() {
  return (
    <ExhibitPage
      title={'Selected Ambient Works Vol. II'}
      meta={[
        ['Found', 'A record shelf'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 28 MB'],
      ]}
      lead={'The vinyl box set, scanned at home under a desk lamp. Matte board and a debossed logo: a hard, flat, low-contrast surface that the solver had to be talked into.'}
      note='Drag to turn it · scroll to zoom · two fingers to pan'
    >
      <ScanViewer>
        {/* The box set's printed face is on -X, so turn it to the camera. */}
        <Scan name='Afx' rotation={[0, Math.PI, 0]} />
      </ScanViewer>
    </ExhibitPage>
  )
}
