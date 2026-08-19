'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'
import { CordKey, Outlet } from '@/components/site/Cords'
import { Section } from '@/components/site/Section'
import { SiteHeader } from '@/components/site/SiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { geometry, sections } from '@/data/works'

const View = dynamic(() => import('@/components/View').then((mod) => mod.View), { ssr: false })
const Common = dynamic(() => import('@/components/View').then((mod) => mod.Common), { ssr: false })
const PointScan = dynamic(() => import('@/components/canvas/PointScan').then((mod) => mod.PointScan), { ssr: false })

// The hero rebuilds one of the scans below, so the switcher doubles as a
// preview of the Objects section.
const SOURCES = geometry.filter((item) => !item.bleed)

export default function Page() {
  const [source, setSource] = useState(SOURCES[0])

  return (
    <>
      <SiteHeader />

      <main className='mx-auto max-w-patch px-6 md:px-10'>
        <div className='grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:items-center lg:gap-0'>
          <div className='relative md:pl-rail'>
            <p className='t-label mb-7 text-muted'>Captures, patches, live code</p>

            <h1 className='t-display'>
              Things I scanned, patches I built, code I left running.
            </h1>

            <p className='t-body mt-7 max-w-[34rem] text-muted'>
              Photogrammetry scans of objects from Helsinki and Austria, Max patches running in the browser through
              RNBO, and Hydra scripts you can open and edit. Everything here is clickable.
            </p>

            <div className='mt-9 max-w-[34rem] border-t border-rule pt-5'>
              <CordKey />
            </div>
          </div>

          {/* The cloud bleeds left, under the type: the canvas layer sits below the content. */}
          <figure className='relative lg:-ml-[24%] lg:-mr-[4%]'>
            <View className='pointer-events-none h-[42vh] max-h-[34rem] min-h-[17rem] w-full lg:h-[32rem]'>
              <Suspense fallback={null}>
                <PointScan src={source.image} />
                <Common />
              </Suspense>
            </View>

            <figcaption className='relative mt-1 flex flex-wrap items-center justify-end gap-x-3 gap-y-2'>
              <span className='t-label text-muted'>Re-scanned</span>
              {SOURCES.map((item) => (
                <button
                  key={item.slug}
                  type='button'
                  onClick={() => setSource(item)}
                  aria-pressed={item.slug === source.slug}
                  className={`t-label underline-offset-[5px] transition-colors ${
                    item.slug === source.slug
                      ? 'text-ink underline decoration-audio decoration-2'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {item.slug}
                </button>
              ))}
            </figcaption>
          </figure>
        </div>

        <Outlet />
        {/* The rail is hidden on small screens, so the sections need their own gap. */}
        <div aria-hidden className='h-12 md:hidden' />

        {sections.map((section, index) => (
          <Section key={section.id} section={section} carries={sections.slice(index).map((s) => s.cord)} />
        ))}
      </main>

      <SiteFooter />
    </>
  )
}
