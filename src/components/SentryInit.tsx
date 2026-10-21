'use client';

/**
 * Client-side Sentry init bootstrap.
 * Root layout'tan mount edilir.
 * Inline init — dynamic import yerine direkt @sentry/nextjs ile kurulum.
 * DSN NEXT_PUBLIC_SENTRY_DSN env'inden okunur (build time'da bake olur).
 */

import { useEffect } from 'react';

/**
 * Bizim kodumuzdan gelmeyen, bilinen gürültü.
 * Instagram / Facebook uygulama içi tarayıcıları (iOS WKWebView, Android WebView) sayfaya kendi
 * script'lerini enjekte eder; bunlar `window.webkit.messageHandlers`, `_AutofillCallbackHandler`
 * gibi yerel köprüleri bulamayınca hata atar. Sayfa çalışmaya devam eder, kullanıcı etkilenmez.
 */
export const IGNORE_ERRORS: Array<string | RegExp> = [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
  'NetworkError when attempting to fetch resource',
  'fbq is not defined',
  'gtag is not defined',
  /window\.webkit\.messageHandlers/,
  /_AutofillCallbackHandler/,
  /webkit\.messageHandlers.*undefined/,
  /Java object is gone/,
  /Java bridge method invocation error/,
];

const IN_APP_UA = /(Instagram|FBAN|FBAV|FB_IAB|FBIOS)/i;

/**
 * Uygulama içi tarayıcıda (Instagram/Facebook), yığının tamamı enjekte edilmiş satır-içi
 * script'ten (`app:///<sayfa>` — bizim paketlerimiz `/_next/` altındadır) geliyorsa olayı at.
 */
export function dropInAppBrowserNoise<E extends { exception?: any }>(event: E): E | null {
  try {
    if (typeof navigator === 'undefined' || !IN_APP_UA.test(navigator.userAgent)) return event;
    const frames: Array<{ filename?: string }> = event.exception?.values?.[0]?.stacktrace?.frames ?? [];
    if (frames.length > 0 && frames.every((f) => !f.filename || !f.filename.includes('/_next/'))) {
      return null;
    }
  } catch {
    /* filtre hata verirse olayı gönder */
  }
  return event;
}

export default function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    console.log('[SentryInit] mounted, DSN present:', !!dsn, dsn ? dsn.slice(0, 40) + '...' : 'EMPTY');

    if (!dsn) return;

    (async () => {
      try {
        // @sentry/nextjs v11 → browser init withSentryConfig wrapper'ı gerektiriyor,
        // bu olmadan transport undefined kalıyor. @sentry/nextjs içindeki browser
        // modülünü direkt import ederek bypass et.
        const Sentry = await import('@sentry/nextjs/build/esm/client/index.js').catch(
          () => import('@sentry/nextjs'),
        );

        Sentry.init({
          dsn,
          environment: process.env.NEXT_PUBLIC_SENTRY_ENV || 'production',
          tracesSampleRate: 0.1,
          sendDefaultPii: false,
          enabled: true,
          // Session Replay kaldırıldı (2026-10-14): ~100 KiB ekstra JS, mobil
          // performans skoru için. Gerekirse Sentry.lazyLoadIntegration ile
          // sadece hata anında yüklenecek şekilde geri eklenebilir.
          integrations: [],
          ignoreErrors: [...IGNORE_ERRORS],
          beforeSend: dropInAppBrowserNoise as any,
        });

        (window as any).Sentry = Sentry;

        // Transport kontrolü — undefined ise manuel browser SDK dene
        const client = (Sentry as any).getClient?.();
        const hasTransport = client && typeof client.getTransport === 'function' && client.getTransport();
        console.log('[SentryInit] client=', !!client, 'transport=', !!hasTransport);

        if (!hasTransport) {
          console.warn('[SentryInit] NextJS SDK transport yok, @sentry/browser fallback deniyor...');
          const Browser = await import('@sentry/browser');
          Browser.init({
            dsn,
            environment: process.env.NEXT_PUBLIC_SENTRY_ENV || 'production',
            tracesSampleRate: 0.1,
            replaysSessionSampleRate: 0,
            replaysOnErrorSampleRate: 1.0,
            sendDefaultPii: false,
            enabled: true,
            ignoreErrors: [...IGNORE_ERRORS],
            beforeSend: dropInAppBrowserNoise as any,
            integrations: typeof (Browser as any).replayIntegration === 'function'
              ? [(Browser as any).replayIntegration({ maskAllText: true, blockAllMedia: true })]
              : [],
          });
          (window as any).Sentry = Browser;
          const bClient = (Browser as any).getClient?.();
          console.log('[SentryInit] browser SDK: client=', !!bClient, 'transport=', !!bClient?.getTransport?.());
        }

        console.log('[SentryInit] ✓ setup tamamlandı — window.Sentry hazır');

        // Global error handler
        window.addEventListener('error', (e) => {
          if (e.error) (window as any).Sentry?.captureException?.(e.error);
        });
        window.addEventListener('unhandledrejection', (e) => {
          (window as any).Sentry?.captureException?.(e.reason);
        });
      } catch (e) {
        console.warn('[SentryInit] init hata:', e);
      }
    })();
  }, []);
  return null;
}
