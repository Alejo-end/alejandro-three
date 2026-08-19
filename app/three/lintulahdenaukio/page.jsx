'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

export default function Page() {
  return (
    <ExhibitPage
      title={'Goose sculpture'}
      meta={[
        ['Found', 'Lintulahdenaukio, Helsinki'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 120 MB'],
      ]}
      lead={'Seven bronze geese on a slab of pavement, photographed from every side you can reach on foot. The back of the plinth is thin because there was nowhere to stand.'}
    >
      <ScanViewer name='Lintulahdenaukio' mode='lift' />
    </ExhibitPage>
  )
}
