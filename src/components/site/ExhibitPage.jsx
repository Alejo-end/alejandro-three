'use client'

import Link from 'next/link'
import { useProgress } from '@react-three/drei'
import { SiteHeader } from './SiteHeader'

/** A mesh arrives as one big file, so item counts sit at 0% for a long time.
    Show an honest indeterminate run rather than a percentage that lies. */
function LoadReadout() {
  const { active, progress } = useProgress()
  const done = !active && progress >= 100

  return (
    <div className='mt-7 border-t border-rule pt-3'>
      <div aria-hidden className={done ? 'h-[1.5px] w-full bg-ink' : 'loading-run w-full'} />
      <p className='t-mono mt-2 uppercase tracking-[0.14em] text-muted' role='status'>
        {done ? 'Mesh loaded' : 'Loading mesh'}
      </p>
    </div>
  )
}

/**
 * The shell every piece's page shares: the same header, a panel of capture
 * notes, and a viewport beside it for whatever the piece needs rendered.
 */
export function ExhibitPage({ title, meta, lead, note, showProgress = true, children }) {
  return (
    <>
      <SiteHeader />

      <div className='mx-auto max-w-patch px-6 pb-16 md:px-10'>
        <div className='gap-10 lg:grid lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]'>
          <div className='max-w-[27rem] md:pl-rail'>
            <Link
              href='/'
              className='t-mono group inline-flex items-center gap-3 uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink'
            >
              <span
                aria-hidden
                data-cord='data'
                className='cord-tick block w-8 transition-[width] duration-300 group-hover:w-11'
              />
              Back to the patch
            </Link>

            <h1 className='t-display mt-7 text-[2.1rem] sm:text-[2.7rem]'>{title}</h1>

            {meta?.length > 0 && (
              <dl className='t-mono mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 uppercase tracking-[0.12em] sm:gap-x-7'>
                {meta.map(([label, value]) => (
                  <div key={label} className='contents'>
                    <dt className='text-muted'>{label}</dt>
                    <dd className='text-ink'>{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {lead && <p className='mt-6 text-[0.9375rem] leading-relaxed text-muted'>{lead}</p>}

            {showProgress && <LoadReadout />}

            {note && <p className='t-mono mt-5 uppercase tracking-[0.14em] text-muted'>{note}</p>}
          </div>

          <div className='relative mt-10 h-[58vh] min-h-[20rem] lg:mt-0 lg:h-[calc(100vh-11rem)]'>{children}</div>
        </div>
      </div>
    </>
  )
}
