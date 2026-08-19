'use client'

import { ExhibitPage } from '@/components/site/ExhibitPage'

export default function Page() {
  return (
    <ExhibitPage
      title={'Puzzle cube'}
      meta={[
        ['Built', 'By hand, three.js'],
        ['Pieces', 'Six polycube groups'],
        ['Editor', 'CodeSandbox, live'],
      ]}
      lead={
        'Interlocking pieces built from unit cubes that fit together into one solid cube. The editor runs the real source, so changing a line rebuilds the preview.'
      }
      showProgress={false}
      note='Edit the source on the left · the preview rebuilds'
    >
      <iframe
        src='https://codesandbox.io/embed/96y44k?view=editor+%2B+preview&module=%2Fsrc%2FApp.js'
        title='Puzzle cube source and preview'
        allow='accelerometer; gyroscope; xr-spatial-tracking'
        sandbox='allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts'
        className='framed h-[32rem] w-full lg:h-[36rem]'
      />
    </ExhibitPage>
  )
}
