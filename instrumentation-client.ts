/**
 * Next.js 15+ client-side instrumentation.
 *
 * Sentry init burada DEĞİL — <SentryInit /> (src/components/SentryInit.tsx)
 * dynamic import ile yapıyor. Buradaki statik `import './sentry.client.config'`
 * tüm SDK'yı ana bundle'a gömüyor ve init'i ikiye katlıyordu
 * (PageSpeed: ~100 KiB kullanılmayan JS). 2026-10-14'te kaldırıldı.
 */

export {};
