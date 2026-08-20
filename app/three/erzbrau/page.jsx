'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

export default function Page() {
  return (
    <ExhibitPage
      title={'Erz Bräu label'}
      meta={[
        ['Found', 'Gaming, Austria'],
        ['Method', 'RealityScan'],
        ['Mesh', '172k triangles'],
        ['Payload', '3.2 MB'],
      ]}
      lead={'A beer label taken off a bottle and flattened out. There is almost no depth to it, so most of the detail is in the texture rather than the mesh.'}
    >
      <ScanViewer name='Erzbrau' mode='peel' />
    </ExhibitPage>
  )
}
