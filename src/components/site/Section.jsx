import { ArrowUpRight } from 'lucide-react'
import { CordRuns, CordStub, Inlet } from './Cords'
import { Piece } from './Piece'

/** One object in the patch: an inlet on the rail, a header, and its pieces. */
export function Section({ section, carries }) {
  const { id, cord, cordLabel, title, count, lead, items, link } = section

  return (
    <section aria-labelledby={`${id}-title`} className='relative pb-24 pt-2 md:pl-rail'>
      <CordRuns carries={carries} terminates={cord} />
      <Inlet cord={cord} />

      <header className='border-t-[1.5px] border-ink pt-4'>
        <div className='t-mono mb-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 uppercase tracking-[0.14em] text-muted'>
          <span className='flex items-center gap-4 text-ink'>
            <CordStub cord={cord} />
            {cordLabel}
          </span>
          <span>{count}</span>
        </div>

        <h2 id={`${id}-title`} className='t-heading text-[2.6rem] sm:text-[3.4rem]'>
          {title}
        </h2>
        <p className='t-body mt-4 text-muted'>{lead}</p>

        {link && (
          <a
            href={link.href}
            className='t-mono mt-5 inline-flex items-center gap-1.5 uppercase tracking-[0.14em] text-ink underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-audio'
          >
            {link.label}
            <ArrowUpRight aria-hidden size={13} strokeWidth={2.5} />
          </a>
        )}
      </header>

      <ul className='mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3'>
        {items.map((item) => (
          <Piece key={item.slug} item={item} />
        ))}
      </ul>
    </section>
  )
}
