'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

export default function Page() {
  return (
    <ExhibitPage
      title={'Selected Ambient Works Vol. II'}
      meta={[
        ['Found', 'A record shelf'],
        ['Method', 'RealityScan'],
        ['Mesh', 'OBJ + MTL, 28 MB'],
      ]}
      lead={'The vinyl box set, scanned at home on a desk. Matte board and a debossed logo, both low in contrast.'}
    >
      <ScanViewer name='Afx' rotation={[0, Math.PI, 0]} mode='shear' />
    </ExhibitPage>
  )
}
