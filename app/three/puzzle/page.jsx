'use client'

import { ArrowBigLeftIcon } from 'lucide-react'
import Link from 'next/link'

const CodeBoxEmbed = () => {
    return (
        <iframe src="https://codesandbox.io/embed/96y44k?view=preview&module=%2Fsrc%2FApp.js&hidenavigation=1"
            style={{ width: '100%', height: '500px', border: '0', borderRadius: '4px', overflow: 'hidden' }}
            title="Puzzle Cube"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
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
                    <h2 className='mb-3 text-3xl font-bold leading-none text-gray-800'>
                        Puzzle Cube
                    </h2>
                    <h4 className='mb-2 text-gray-600'>
                        Based on a puzzle cube from a store in Helsinki.
                    </h4>
                    <p className='mb-2 text-gray-600'>
                        Drag, scroll, pinch, and rotate the canvas. Click to separate the pieces.
                    </p>
                </div>
            </div>

            <CodeBoxEmbed />
        </>
    );
}
