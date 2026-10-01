/**
 * Sentry client-side (browser) config
 *
 * Marketing site tarayıcı tarafı hata izleme.
 * SENTRY_DSN yoksa Sentry devre dışı — sessizce atla.
 *
 * KVKK: Sentry PII (kullanıcı IP, email vs) toplamıyor; sadece hata stack trace
 * + sayfa URL (anonim). GDPR Standard Contractual Clauses altında Sentry EU
 * data residency öneriyor.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV || 'development',

    // Performance monitoring — sample oranı
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session replay — kullanıcı deneyimini kaydet (hata olunca)
    replaysSessionSampleRate: 0,       // normal session'ları kaydetme
    replaysOnErrorSampleRate: 1.0,     // sadece hata olunca kaydet

    // PII engelle — KVKK uyumu
    sendDefaultPii: false,

    // Transport
    beforeSend(event) {
      // Browser extension hatalarını filtre
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        (f) => f.filename?.includes('extension://') || f.filename?.includes('safari-extension://')
      )) {
        return null;
      }
      return event;
    },

    // Hangi hataları yoksay
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError when attempting to fetch resource',
      // Ad blocker gürültüsü
      'fbq is not defined',
      'gtag is not defined',
    ],

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,       // KVKK: ekrandaki metni maskele
        blockAllMedia: true,     // Resim/video kaydetme
      }),
    ],
  });
}
