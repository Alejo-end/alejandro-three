'use client'

import Link from 'next/link'
import { useProgress } from '@react-three/drei'
import { SiteHeader } from './SiteHeader'

/** A mesh arrives as one big file, so item counts sit at 0% for a long time.
    An indeterminate run is more honest than a percentage stuck at zero. */
function LoadReadout() {
  const { active, progress } = useProgress()
  const done = !active && progress >= 100

  return (
    <div className='mt-7 border-t border-rule pt-3'>
      <div aria-hidden className={done ? 'h-[1.5px] w-full bg-ink' : 'loading-run w-full'} />
      <p className='t-label mt-2 text-muted' role='status'>
        {done ? 'Mesh loaded' : 'Loading mesh'}
      </p>
    </div>
  )
}

/**
 * The shell every piece's page shares. The viewer fills the window and the
 * notes sit over it, so the whole page is a surface you can drag.
 */
export function ExhibitPage({ title, meta, lead, note, showProgress = true, children }) {
  return (
    <>
      {children}

      <div className='pointer-events-none relative'>
        <SiteHeader />

        <div className='mx-auto max-w-patch px-6 pb-16 md:px-10'>
          <div className='max-w-[25rem] md:pl-rail'>
            <Link
              href='/'
              className='t-label group pointer-events-auto inline-flex items-center gap-3 text-muted transition-colors hover:text-ink'
            >
              <span
                aria-hidden
                data-cord='data'
                className='cord-tick block w-8 transition-[width] duration-300 group-hover:w-11'
              />
              All work
            </Link>

            <h1 className='t-title mt-7'>{title}</h1>

            {meta?.length > 0 && (
              <dl className='t-label mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 sm:gap-x-7'>
                {meta.map(([label, value]) => (
                  <div key={label} className='contents'>
                    <dt className='text-muted'>{label}</dt>
                    <dd className='text-ink'>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {lead && <p className='t-note mt-6 text-muted'>{lead}</p>}

            {showProgress && <LoadReadout />}

            {note && <p className='t-label mt-5 text-muted'>{note}</p>}
          </div>
        </div>
      </div>
    </>
  )
}
