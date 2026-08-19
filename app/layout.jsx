import localFont from 'next/font/local'
import { Layout } from '@/components/dom/Layout'
import '@/global.css'

// Self-hosted so the build never depends on Google Fonts being reachable.
const archivo = localFont({
  src: [
    { path: '../public/fonts/archivo-latin.woff2', weight: '100 900', style: 'normal' },
    { path: '../public/fonts/archivo-latin-ext.woff2', weight: '100 900', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-archivo',
})

const martianMono = localFont({
  src: [
    { path: '../public/fonts/martianmono-latin.woff2', weight: '100 800', style: 'normal' },
    { path: '../public/fonts/martianmono-latin-ext.woff2', weight: '100 800', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata = {
  metadataBase: new URL('https://alejandro-three.vercel.app'),
  title: 'alejandro? — captures, patches and live code',
  description:
    'Objects scanned off the street in Helsinki, Max/MSP patches running in the browser through RNBO, and Hydra live-coding scripts you can open and rewrite.',
  keywords: ['photogrammetry', 'RealityScan', 'three.js', 'Max/MSP', 'RNBO', 'p5.js', 'Hydra', 'live coding'],
  authors: [{ name: 'Alejandro' }],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32' },
      { url: '/icons/favicon-16x16.png', sizes: '16x16' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'alejandro?',
    title: 'alejandro? — captures, patches and live code',
    description:
      'Objects scanned off the street in Helsinki, Max/MSP patches running in the browser through RNBO, and Hydra live-coding scripts you can open and rewrite.',
    images: ['/icons/share.png'],
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport = {
  themeColor: '#d7d9d1',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${archivo.variable} ${martianMono.variable} antialiased`}>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
