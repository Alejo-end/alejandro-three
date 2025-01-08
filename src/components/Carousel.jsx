import React from 'react';
import { Carousel as ShadcnCarousel, CarouselContent, CarouselNext, CarouselPrevious, CarouselItem } from './ui/carousel'
import { CarouselItemOverlay } from './CarouselItemOverlay';
import Image from 'next/image';

export const Carousel = ({ items }) => {
  return (
    <ShadcnCarousel className="mx-auto w-full max-w-5xl">
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem key={index} className="group relative md:basis-1/2 lg:basis-1/3">
            <Image height={500} width={500} src={item.component} alt="img" />
            {item.route && <CarouselItemOverlay route={item.route} external={item.external} />}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </ShadcnCarousel>
  );
}

