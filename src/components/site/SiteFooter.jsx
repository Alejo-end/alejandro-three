import { ArrowUpRight } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className='mx-auto max-w-patch px-6 pb-16 md:px-10'>
      <div className='flex flex-col gap-6 border-t-[1.5px] border-ink pt-6 sm:flex-row sm:items-end sm:justify-between'>
        <p className='t-sub text-xl'>
          alejandro<span className='text-audio'>?</span>
        </p>
        <div className='t-label flex flex-col gap-2 text-muted sm:items-end'>
          <a
            href='https://alejandro-prtfl.vercel.app/'
            className='inline-flex items-center gap-1.5 text-ink underline decoration-rule decoration-2 underline-offset-[6px] transition-colors hover:decoration-audio'
          >
            Main portfolio
            <ArrowUpRight aria-hidden size={13} strokeWidth={2.5} />
          </a>
          <p>react-three-fiber · RNBO · Hydra</p>
        </div>
      </div>
    </footer>
  )
}
