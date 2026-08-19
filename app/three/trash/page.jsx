'use client'

import dynamic from 'next/dynamic'
import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

const Scan = dynamic(() => import('@/components/canvas/Scan').then((mod) => mod.Scan), { ssr: false })

export default function Page() {
  return (
    <ExhibitPage
      title={'Public bin'}
      meta={[
        ['Found', 'A street in Helsinki'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 26 MB'],
      ]}
      lead={'A city litter bin, scanned in full. Nobody has ever asked for a 3D model of one, which is most of the appeal — and the ribbed metal gives photogrammetry something easy to hold on to.'}
      note='Drag to turn it · scroll to zoom · two fingers to pan'
    >
      <ScanViewer>
        <Scan name='Trash_Can' />
      </ScanViewer>
    </ExhibitPage>
  )
}
