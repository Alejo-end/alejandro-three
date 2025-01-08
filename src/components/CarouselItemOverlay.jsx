import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';


export const CarouselItemOverlay = ({ route, external }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-50">
            <a
                href={route}
                className="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-200"
            >
                Open

                {external ? <ExternalLinkIcon className='mx-2' size={22} /> : null}
            </a>
        </div>
    );
};

