'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Carousel } from '../src/components/Carousel'
import { Card } from '../src/components/ui/card'
import { Link } from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'


const PersonStandingIcon = () => import('lucide-react').then((mod) => mod.PersonStandingIcon)
const GitCommitIcon = () => import('lucide-react').then((mod) => mod.GitCommitIcon)

const Logo = dynamic(() => import('@/components/Examples').then((mod) => mod.Logo), { ssr: false })
const View = dynamic(() => import('@/components/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 size-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  const carouselItemsThree = [
    { component: "/images/lintulahdenaukio.png", route: '/three/lintulahdenaukio' },
    { component: "/images/trash.png", route: '/three/trash' },
    { component: "/images/puzzle.png", route: '/three/puzzle' },
    { component: "/images/snowman.png", route: 'three/snowman' },
    { component: "/images/afx.png", route: '/three/afx' },
    { component: "/images/erzbrau.png", route: 'three/erzbrau' },
  ]
  const carouselItemsLiveCoding = [
    { component: "/images/hydra.png", route: 'https://hydra.ojack.xyz/?code=JTJGJTJGQWxlamFuZHJvJTNGJTBBYnBtJTIwJTNEJTIwMTIwJTBBJTBBczAuaW5pdENhbSgpJTBBczEuaW5pdFNjcmVlbigpJTBBc3JjKHMxKS5vdXQobzApJTBBc3JjKHMwKS5vdXQobzIpJTBBJTBBc3JjKG8wKS5tb2R1bGF0ZShub2lzZSgzJTJDMSklMkMlMjAwLjIpJTBBJTIwJTIwLnNoaWZ0KDAuOSUyQzAuMSUyQzAuMyklMEElMjAlMjAub3V0KG8xKSUwQXNyYyhvMCkubW9kdWxhdGUobzElMkMlMjAwLjIpLm91dChvMiklMEFzcmMobzIpLm1vZHVsYXRlKG8yJTJDJTIwMC4yKS5rYWxlaWQoNSkub3V0KG8zKSUwQXZvcm9ub2koNCUyQzAuNSUyQzAuNCklMEElMjAlMjAucGl4ZWxhdGUoMjAlMkMyMCklMEElMjAlMjAubW9kdWxhdGUobzIlMkMlMjAwLjEpJTBBJTIwJTIwLnNoaWZ0KDAuMSUyQzAuNCUyQzAuMyklMEElMjAlMjAub3V0KG8xKSUwQXJlbmRlcihvMiklMEElMEElMkYlMkZzcmMoczApLm1vZHVsYXRlKG8zKS5vdXQoKQ%3D%3D', external: true },
  ]
  const carouselItemsMaxMSP = [
    { component: "/images/audiovisualizer.png", route: 'https://alejandro-p5-rnbo.vercel.app/sketches/mouse-theremin', external: true },
    { component: "/images/ambient-generator.png", route: 'https://alejandro-p5-rnbo.vercel.app/sketches/ambient-generator', external: true },
    { component: "/images/piano.png", route: 'https://alejandro-p5-rnbo.vercel.app/sketches/piano-sketch', external: true },
  ]
  return (
    <>
      <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row  lg:w-4/5'>
        {/* jumbo */}
        <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
          <p className='w-full uppercase'>Hey there!</p>
          <h1 className='my-4 text-5xl font-bold leading-tight'>Welcome to Alejandro? Portfolio</h1>
          <p className='mb-8 text-2xl leading-normal'>A small website for hobbies, art and sound experimentation.</p>
        </div>

        <div className='w-full text-center md:w-3/5'>
          <View className='flex h-96 w-full flex-col items-center justify-center'>
            <Suspense fallback={null}>
              <Logo route='/blob' scale={0.6} position={[0, 0, 0]} />
              <Common />
            </Suspense>
          </View>
        </div>
      </div>

      <div className='mx-auto flex w-full flex-col flex-wrap items-center p-12 md:flex-row  lg:w-4/5'>

        <Card className="my-6 w-full p-6">
          <h1 className="mb-1 text-xl font-bold sm:text-3xl">Three.js + RealityScan</h1>
          <p className="mb-6 text-sm font-light sm:text-xl">A tiny collection of 3D models and experiments with Three.js and RealityScan. It may take a few seconds to load each model.</p>
          <Carousel items={carouselItemsThree} />
        </Card>


        <Card className="my-6 w-full p-6">
          <h1 className="mb-1 text-xl font-bold sm:text-3xl">MaxMSP + P5.js + RNBO</h1>
          <p className="mb-1 text-sm font-light sm:text-xl">A couple of experiments with P5.js and RNBO. MaxMSP on the web.</p>
          <a href="https://alejandro-p5-rnbo.vercel.app/" className='mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800'>Visit my p5 + rnbo sketches website <ExternalLinkIcon /></a>
          <Carousel items={carouselItemsMaxMSP} />
        </Card>

        <Card className="my-6 w-full p-6">
          <h1 className="mb-1 text-xl font-bold sm:text-3xl">Live Coding</h1>
          <p className="mb-6 text-sm font-light sm:text-xl">A couple of scripts for Hydra Video Synth. some scripts may require access to the camera or to another window with videos to work.</p>
          <Carousel items={carouselItemsLiveCoding} />
        </Card>


      </div>
      <footer className='flex w-full flex-col items-center justify-center p-12 text-center'>
        <p className='text-gray-600'>Made by<a href="https://alejandro-prtfl.vercel.app/" className='text-gray-500 hover:text-gray-800'> Alejandro?</a></p>

      </footer>
    </>
  )
}
