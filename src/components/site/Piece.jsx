import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

/**
 * One piece. Cut-out objects float straight on the page; anything that fills
 * its own frame stays a framed screen. Objects float, screens are framed.
 */
export function Piece({ item }) {
  const { title, meta, tag, image, route, external, bleed, blurb } = item

  // A piece with nowhere to go yet still belongs in the catalogue — it just
  // isn't a link.
  const Anchor = route ? (external ? 'a' : Link) : 'div'
  const anchorProps = route
    ? external
      ? { href: route, target: '_blank', rel: 'noreferrer' }
      : { href: route }
    : {}

  return (
    <li>
      <Anchor {...anchorProps} className='group block'>
        <div
          className={`relative aspect-[4/3] transition-transform duration-300 ${
            route ? 'group-hover:-translate-y-1.5 group-focus-visible:-translate-y-1.5' : ''
          } ${bleed ? 'framed overflow-hidden' : ''}`}
        >
          <Image
            src={image}
            alt=''
            fill
            sizes='(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw'
            className={bleed ? 'object-cover' : 'object-contain'}
          />
        </div>

        <div className='mt-4 flex items-baseline justify-between gap-3 border-t border-rule pt-3'>
          <h3 className='t-heading text-lg'>
            <span className='bg-gradient-to-r from-audio to-audio bg-[length:0%_0.3em] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_0.3em] group-focus-visible:bg-[length:100%_0.3em]'>
              {title}
            </span>
          </h3>
          {/* Only appears when it says something the section header doesn't. */}
          {tag && <span className='t-mono shrink-0 uppercase tracking-[0.12em] text-muted'>{tag}</span>}
          {external && route && !tag && (
            <ArrowUpRight
              aria-hidden
              size={16}
              strokeWidth={2.5}
              className='shrink-0 translate-y-0.5 text-muted transition-transform duration-300 group-hover:-translate-y-0 group-hover:translate-x-0.5 group-hover:text-ink'
            />
          )}
        </div>

        <p className='t-mono mt-2 uppercase tracking-[0.12em] text-muted'>{meta}</p>
        <p className='mt-3 text-[0.9375rem] leading-relaxed text-muted'>{blurb}</p>
      </Anchor>
    </li>
  )
}
