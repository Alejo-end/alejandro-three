'use client'

import dynamic from 'next/dynamic'
import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

export default function Page() {
  return (
    <ExhibitPage
      title={'Snowman'}
      meta={[
        ['Found', 'Karhupuisto, Helsinki'],
        ['Captured', "New Year's Eve"],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 105 MB'],
      ]}
      lead={'Built by strangers in the park and scanned before it went. Snow is close to the worst possible subject for photogrammetry — white, soft, and featureless — so the surface is guesswork in places. The capture outlived the snowman by a few days.'}
      note='Drag to turn it · scroll to zoom · two fingers to pan'
    >
      <ScanViewer>
        <Scan name='Snowman' />
      </ScanViewer>
    </ExhibitPage>
  )
}
