const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/**
 * No service worker. Its generated precache manifest pinned exact asset paths,
 * so moving the raw captures out of public/ left an install that could never
 * succeed, and its CacheFirst rule kept handing browsers files that no longer
 * matched the code. A portfolio gains nothing from offline caching that is
 * worth that failure mode. next-pwa was also webpack-only, which Next 16
 * builds with Turbopack will not run.
 */

const dev = process.env.NODE_ENV === 'development'

// Next inlines its bootstrap scripts, so scripts stay on 'unsafe-inline' but
// only from this origin. The puzzle page embeds its CodeSandbox editor.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  'frame-src https://codesandbox.io',
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {},
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Vercel already sends HSTS with preload on every deployment.
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

module.exports = withBundleAnalyzer(nextConfig)
