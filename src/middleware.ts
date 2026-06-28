import { NextRequest, NextResponse } from 'next/server';

/**
 * Sphere WWW middleware — iki iş yapar:
 *   1. Affiliate ?ref=KOD tracking (yeni)
 *   2. Markdown for Agents content negotiation (mevcut)
 */

const AFFILIATE_COOKIE = 'sphere_ref';
const AFFILIATE_COOKIE_MAX_AGE_SEC = 60 * 24 * 60 * 60; // 60 gün
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://app.sphereenglish.com/api-server/api';

const MARKDOWN_PATHS: Record<string, string> = {
  '/': '/content/home.md',
  '/home': '/content/home.md',
  '/hakkimizda': '/content/hakkimizda.md',
  '/ai-studio': '/content/ai-studio.md',
  '/nasil-calisir': '/content/nasil-calisir.md',
  '/cozumler': '/content/cozumler.md',
  '/iletisim': '/content/iletisim.md',
};

function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const lower = accept.toLowerCase();
  if (!lower.includes('text/markdown') && !lower.includes('text/x-markdown')) return false;
  const mdMatch = lower.match(/text\/(?:x-)?markdown(?:;q=([0-9.]+))?/);
  const htmlMatch = lower.match(/text\/html(?:;q=([0-9.]+))?/);
  const mdQ = mdMatch ? (mdMatch[1] ? parseFloat(mdMatch[1]) : 1) : 0;
  const htmlQ = htmlMatch ? (htmlMatch[1] ? parseFloat(htmlMatch[1]) : 1) : 0;
  return mdQ >= htmlQ;
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // ── 1) Affiliate tracking ?ref=KOD ──
  const ref = url.searchParams.get('ref');
  let affResponse: NextResponse | null = null;
  if (ref) {
    const code = ref.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 40);
    if (code && code.length >= 3) {
      const existing = req.cookies.get(AFFILIATE_COOKIE)?.value;
      if (existing !== code) {
        affResponse = NextResponse.next();
        affResponse.cookies.set({
          name: AFFILIATE_COOKIE,
          value: code,
          maxAge: AFFILIATE_COOKIE_MAX_AGE_SEC,
          path: '/',
          sameSite: 'lax',
        });
        // Fire-and-forget tracking call
        try {
          void fetch(`${API_BASE}/affiliate/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code,
              landingPath: pathname,
              referrer: req.headers.get('referer') ?? null,
              utmSource: url.searchParams.get('utm_source'),
              utmMedium: url.searchParams.get('utm_medium'),
              utmCampaign: url.searchParams.get('utm_campaign'),
              visitorId: existing || code,
            }),
          });
        } catch {}
      }
    }
  }

  // ── 2) Markdown for Agents content negotiation ──
  const mdPath = MARKDOWN_PATHS[pathname];
  if (mdPath && wantsMarkdown(req.headers.get('accept'))) {
    const mdUrl = new URL(mdPath, req.url);
    const res = NextResponse.rewrite(mdUrl);
    // Affiliate cookie set edildiyse, MD response'a da uygula
    if (affResponse) {
      affResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    }
    return res;
  }

  return affResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
};
