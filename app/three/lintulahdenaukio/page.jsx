'use client'

import { ArrowBigLeftIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Suspense } from 'react'

const Lintulahdenaukio = dynamic(() => import('@/components/canvas/Lintulahdenaukio').then((mod) => mod.Lintulahdenaukio), { ssr: false })
const View = dynamic(() => import('@/components/View').then((mod) => mod.View), {
    ssr: true,
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
    return (
        <>
            <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row  lg:w-4/5'>
                <Link href='/' className='cursor-pointer'>
                    <ArrowBigLeftIcon className='size-8 cursor-pointer' />
                </Link>
                <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
                    <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>a sculpture from Lintulahdenaukio, Helsinki.</h2>
                    <p className='mb-2 text-gray-600'>Scanned using RealityScan from UnrealEngine.</p>
                    <p className='mb-2 text-gray-600'>Drag, scroll, pinch, and rotate the canvas.</p>
                </div>
            </div>

            <View orbit className='absolute top-0 flex h-screen w-full flex-col items-center justify-center' position={[40, 40, 60]}>
                <Suspense fallback={<p>Loading...</p>}>
                    <Lintulahdenaukio />
                    <Common />
                </Suspense>
            </View>
        </>
    )
}
