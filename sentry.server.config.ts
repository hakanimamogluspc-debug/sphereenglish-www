/**
 * Sentry server-side (Node.js runtime) config
 *
 * Marketing site SSR/API Route hata izleme.
 */

import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV || 'development',

    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Release — git SHA ile track
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || undefined,

    // PII engelle
    sendDefaultPii: false,

    // Server-side error filtering
    beforeSend(event) {
      // Health check hatalarını filtre (gürültü)
      if (event.request?.url?.includes('/api/health')) return null;
      return event;
    },

    ignoreErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      // Payload CMS admin routes önemsiz
    ],
  });
}
