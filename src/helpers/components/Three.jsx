'use client'

import { r3f } from '@/helpers/global'

export const Three = ({ children }) => {
  if (typeof window !== 'undefined') (window.__log ||= []).push('tunnel-in')
  return <r3f.In>{children}</r3f.In>
}
