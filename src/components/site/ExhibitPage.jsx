'use client'

import Link from 'next/link'
import { SiteHeader } from './SiteHeader'

/** The shell every piece's page shares: capture notes beside a viewer panel. */
export function ExhibitPage({ title, meta, lead, note, children }) {
  return (
    <>
      <SiteHeader />

      <div className='mx-auto max-w-patch px-6 pb-20 md:px-10'>
        <div className='gap-12 lg:grid lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]'>
          <div className='max-w-[26rem] md:pl-rail'>
            <Link
              href='/'
              className='t-label group inline-flex items-center gap-3 text-muted transition-colors hover:text-ink'
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


            {note && <p className='t-label mt-5 text-muted'>{note}</p>}
          </div>

          <div className='relative mt-12 lg:mt-0'>
            {/* The cord that feeds this viewport, same taxonomy as the index. */}
            <span aria-hidden className='absolute right-full top-28 hidden w-12 items-center lg:flex'>
              <span data-cord='data' className='cord-tick w-full' />
            </span>
            <span aria-hidden className='nub absolute left-0 top-28 hidden h-[15px] w-[5px] -translate-y-1/2 lg:block' />
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
