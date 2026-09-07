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

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {},
}

module.exports = withBundleAnalyzer(nextConfig)
