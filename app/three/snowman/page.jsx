'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'
import { ScanViewer } from '@/components/site/ScanViewer'

export default function Page() {
  return (
    <ExhibitPage
      title={'Snowman'}
      meta={[
        ['Found', 'Karhupuisto, Helsinki'],
        ['Captured', "New Year's Eve"],
        ['Method', 'RealityScan'],
        ['Mesh', '864k triangles'],
        ['Payload', '15 MB'],
      ]}
      lead={'Made by someone in Karhupuisto over New Year and scanned before it melted. Snow is a hard subject — white and featureless — so parts of the surface are approximate.'}
    >
      <ScanViewer name='Snowman' mode='melt' />
    </ExhibitPage>
  )
}
