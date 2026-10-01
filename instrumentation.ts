/**
 * Next.js 15+ Sentry instrumentation
 * Runtime bazlı init'leri bootstrap eder.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export { onRequestError } from '@sentry/nextjs';
