'use client'

import dynamic from 'next/dynamic'
import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

export default function Page() {
  return (
    <ExhibitPage
      title={'Erz Bräu label'}
      meta={[
        ['Found', 'Gaming, Austria'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 24 MB'],
      ]}
      lead={'A beer label peeled off a bottle and flattened out. Thin, creased and barely there as geometry — which makes the creases the only thing holding the reconstruction together.'}
      note='Drag to turn it · scroll to zoom · two fingers to pan'
    >
      <ScanViewer>
        <Scan name='Erzbrau' />
      </ScanViewer>
    </ExhibitPage>
  )
}
