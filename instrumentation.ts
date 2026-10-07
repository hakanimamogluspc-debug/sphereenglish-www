/**
 * Next.js 15+ Sentry instrumentation
 * Runtime bazlı init'leri bootstrap eder.
 */

import sentryPkg from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// Next.js 15: unhandled errors Sentry'ye forward
export const onRequestError = (sentryPkg as any).captureRequestError
  ?? (sentryPkg as any).onRequestError
  ?? (() => {});
