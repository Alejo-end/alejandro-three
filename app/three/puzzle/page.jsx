'use client'

import { ArrowBigLeftIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const CodeBoxEmbed = () => {
    return (
        <iframe src="https://codesandbox.io/embed/96y44k?view=editor+%2B+preview&module=%2Fsrc%2FApp.js"
            style={{ width: '100%', height: '500px', border: 0, borderRadius: '4px', overflow: 'hidden' }}
            title="Puzzle Cube"
            allow="accelerometer; gyroscope; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        ></iframe>
    );
};


export default function Page() {
    return (
        <>
            <div className='mx-auto flex w-full flex-col flex-wrap items-center md:flex-row  lg:w-4/5'>
                <Link href='/' className='cursor-pointer'>
                    <ArrowBigLeftIcon className='size-8 cursor-pointer' />
                </Link>
                <div className='flex w-full flex-col items-start justify-center p-12 text-center md:w-2/5 md:text-left'>
                    <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>a puzzle cube.</h2>
                    <p className='mb-2 text-gray-600'>Interlocking pieces, each built from unit cubes.</p>
                    <p className='mb-2 text-gray-600'>The editor is live — change the code and the preview rebuilds.</p>
                </div>
            </div>

            <CodeBoxEmbed />
        </>
    )
}
