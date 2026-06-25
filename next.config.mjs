import { withPayload } from '@payloadcms/next/withPayload';
import { imageHosts } from './image-hosts.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASE_PATH || undefined,
  assetPrefix: process.env.BASE_PATH || undefined,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // iyzipay paketi resources/ klasöründe CA sertifikası içerir; Next.js
  // build'inde bu klasör tracelenmediği için runtime'da ENOENT alıyoruz.
  // External olarak işaretleyince paket node_modules'tan runtime'da
  // resolve olur, kaynak dosyaları da bulunur.
  serverExternalPackages: ['iyzipay'],
  experimental: {
    optimizeCss: true,
    reactCompiler: false,
    // Next.js 14 backward-compat (15'te root'taki ayar kullanılır)
    serverComponentsExternalPackages: ['iyzipay'],
  },
  distDir: process.env.DIST_DIR || '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: imageHosts,
  },
  async headers() {
    // RFC 8288 — AI agent keşfi için Link header'ları
    // Tek bir Link header'ı içine comma-separated multiple relations koyuyoruz
    const agentDiscoveryLink = [
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
      '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rel/skill-index"; type="application/json"',
      '</llms.txt>; rel="https://llmstxt.org/rel/llms"; type="text/plain"',
      '</pricing.md>; rel="https://schema.org/PriceSpecification"; type="text/markdown"',
      '</sitemap.xml>; rel="sitemap"; type="application/xml"',
      '</gizlilik-politikasi>; rel="privacy-policy"; type="text/html"',
      '</kullanim-kosullari>; rel="terms-of-service"; type="text/html"',
      '</iletisim>; rel="contact"; type="text/html"',
      '<https://app.sphereenglish.com/api/healthz>; rel="status"; type="application/json"',
    ].join(', ');

    return [
      {
        // Public site headers (admin paneli muaf)
        source: '/((?!admin|api).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          // AI agent discovery (RFC 8288 + RFC 9727 §3)
          { key: 'Link', value: agentDiscoveryLink },
          // Content negotiation hint — bu kaynak markdown alternatif olarak da sunulabilir
          { key: 'Vary', value: 'Accept' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Iyzico checkout script (cdn, www, cpp, static, merchant tüm subdomain'ler) + GA + Iyzico'nun yan servisleri (Hotjar)
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.iyzipay.com https://*.hotjar.com https://static.hotjar.com",
              "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.iyzipay.com https://*.hotjar.com https://static.hotjar.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.iyzipay.com https://*.hotjar.com",
              "img-src 'self' data: https:",
              "font-src 'self' data: https://fonts.gstatic.com https://*.iyzipay.com https://*.hotjar.com",
              // Iyzico ile XHR/WebSocket (Iyzico, GA, Hotjar, Sentry — Iyzico bunları kullanıyor)
              "connect-src 'self' https://app.sphereenglish.com https://www.google.com https://analytics.google.com https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://www.iyzipay.com https://*.iyzipay.com https://*.hotjar.com wss://*.hotjar.com https://*.ingest.sentry.io https://*.sentry.io",
              // Iyzico 3D Secure iframe + BKM ve banka 3DS gateway'leri için izin
              "frame-src 'self' https:",
              "child-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              // 3DS form submit Türk bankalarının her birinin kendi domain'ine yapılır — https: ile tüm HTTPS gateway'lere izin (BKM, Akbank, Garanti, İşbankası, vb.)
              "form-action 'self' https:",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'sphereenglish.com' }],
        destination: 'https://www.sphereenglish.com/:path*',
        permanent: true,
      },
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
