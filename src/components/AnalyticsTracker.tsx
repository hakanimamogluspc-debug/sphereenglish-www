'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Self-hosted website analytics tracker.
 *
 * Her sayfa görüntülemesinde api-server'a POST atar:
 *   POST https://app.sphereenglish.com/api/analytics/track
 *
 * visitor_id localStorage'da kalıcı UUID (anonim).
 * DNT (Do Not Track) ayarlı tarayıcılarda kayıt yapılmaz.
 * UTM parametreleri ilk landing'de yakalanır.
 *
 * Bu component visible bir şey render etmez.
 */

const TRACK_ENDPOINT = 'https://app.sphereenglish.com/api/analytics/track';
const VISITOR_ID_KEY = 'sph_vid';

function getOrCreateVisitorId(): string | null {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      // RFC 4122 v4 UUID
      id = (crypto.randomUUID?.() ?? (() => {
        const r = (n: number) => Math.floor(Math.random() * n);
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const v = c === 'x' ? r(16) : (r(16) & 0x3) | 0x8;
          return v.toString(16);
        });
      })()) as string;
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function getUtmParams(sp: URLSearchParams): Record<string, string> {
  const utm: Record<string, string> = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
    const v = sp.get(`utm_${k}`);
    if (v) utm[k] = v;
  }
  return utm;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    // DNT saygısı
    try {
      const dnt = (navigator as any).doNotTrack ?? (window as any).doNotTrack;
      if (dnt === '1' || dnt === 1 || dnt === 'yes') return;
    } catch {
      // ignore
    }

    if (!pathname) return;
    const fullUrl = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

    // Aynı sayfada tetiklenmeyi önle (örn. searchParams ref değişikliği gibi)
    if (lastTrackedRef.current === fullUrl) return;
    lastTrackedRef.current = fullUrl;

    const visitorId = getOrCreateVisitorId();
    if (!visitorId) return;

    const utm = searchParams ? getUtmParams(searchParams) : {};

    const payload = {
      visitorId,
      path: pathname,
      url: typeof window !== 'undefined' ? window.location.href : fullUrl,
      title: typeof document !== 'undefined' ? document.title : null,
      referrer: typeof document !== 'undefined' && document.referrer ? document.referrer : null,
      utm,
    };

    // Fire-and-forget — kullanıcı deneyimini yavaşlatma
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      // sendBeacon en güvenilir yöntem (sayfa kapansa bile gönderilir)
      if (navigator.sendBeacon && navigator.sendBeacon(TRACK_ENDPOINT, blob)) {
        return;
      }
    } catch {
      // sendBeacon başarısızsa fetch'e düş
    }

    fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: 'omit',
    }).catch(() => {
      // sessizce başarısız
    });
  }, [pathname, searchParams]);

  return null;
}
