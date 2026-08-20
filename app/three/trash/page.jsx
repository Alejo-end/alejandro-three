'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

export default function Page() {
  return (
    <ExhibitPage
      title={'Public bin'}
      meta={[
        ['Found', 'A street in Helsinki'],
        ['Method', 'RealityScan'],
        ['Mesh', '163k triangles'],
        ['Payload', '3.4 MB'],
      ]}
      lead={'A street litter bin, scanned along with the pavement and the fence behind it. The ribbed metal gives photogrammetry plenty to match on.'}
    >
      <ScanViewer name='Trash_Can' mode='spill' />
    </ExhibitPage>
  )
}
