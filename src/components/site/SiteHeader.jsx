import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className='mx-auto flex max-w-patch items-baseline justify-between gap-4 px-6 pb-10 pt-7 md:px-10'>
      <Link href='/' className='t-sub text-xl'>
        alejandro<span className='text-audio'>?</span>
      </Link>
      <p className='t-label text-muted'>Helsinki</p>
    </header>
  )
}
