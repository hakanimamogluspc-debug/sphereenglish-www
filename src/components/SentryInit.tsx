'use client';

/**
 * Client-side Sentry init bootstrap.
 * Root layout'tan mount edilir → sayfa yüklenince sentry.client.config.ts çalıştırılır.
 * Next.js 15 app router'da `withSentryConfig` wrapper olmadan browser Sentry'yi
 * aktif eden en basit yol.
 */

import { useEffect } from 'react';

export default function SentryInit() {
  useEffect(() => {
    // Dynamic import — bundle size'ı etkilememek için ancak init'i tetikler
    import('../../sentry.client.config').catch((e) => {
      console.warn('[SentryInit] client config load failed:', e);
    });
  }, []);
  return null;
}
