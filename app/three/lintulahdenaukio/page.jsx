'use client'

import dynamic from 'next/dynamic'
import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

export default function Page() {
  return (
    <ExhibitPage
      title={'Goose sculpture'}
      meta={[
        ['Found', 'Lintulahdenaukio, Helsinki'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 120 MB'],
      ]}
      lead={'Seven bronze geese standing on a slab of pavement. Photographed from every angle a person can reach without stepping into the road, which is why the far side of the plinth is a little thin.'}
      note='Drag to turn it · scroll to zoom · two fingers to pan'
    >
      <ScanViewer>
        <Scan name='Lintulahdenaukio' />
      </ScanViewer>
    </ExhibitPage>
  )
}
