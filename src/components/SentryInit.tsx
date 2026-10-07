'use client';

/**
 * Client-side Sentry init bootstrap.
 * Root layout'tan mount edilir.
 * Inline init — dynamic import yerine direkt @sentry/nextjs ile kurulum.
 * DSN NEXT_PUBLIC_SENTRY_DSN env'inden okunur (build time'da bake olur).
 */

import { useEffect } from 'react';

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    console.log('[SentryInit] mounted, DSN present:', !!dsn, dsn ? dsn.slice(0, 40) + '...' : 'EMPTY');

    if (!dsn) return;

    (async () => {
      try {
        const Sentry = await import('@sentry/nextjs');
        Sentry.init({
          dsn,
          environment: process.env.NEXT_PUBLIC_SENTRY_ENV || 'production',
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 1.0,
          sendDefaultPii: false,
          integrations: typeof (Sentry as any).replayIntegration === 'function'
            ? [(Sentry as any).replayIntegration({ maskAllText: true, blockAllMedia: true })]
            : [],
          ignoreErrors: [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            'NetworkError when attempting to fetch resource',
            'fbq is not defined',
            'gtag is not defined',
          ],
        });
        console.log('[SentryInit] ✓ Sentry.init() tamamlandı');
      } catch (e) {
        console.warn('[SentryInit] init hata:', e);
      }
    })();
  }, []);
  return null;
}
