/**
 * LinkedIn Insight Tag — istemci tarafı yardımcıları.
 *
 * KVKK notu: LinkedIn'in Meta'daki gibi bir "consent revoke" API'si yok;
 * script yüklendiği anda çerez bırakır. Bu yüzden SDK yalnızca `marketing`
 * rızası verildikten SONRA enjekte edilir (bkz. <LinkedInInsight />).
 * Rıza öncesi çağrılan dönüşümler kuyruğa alınır, SDK yüklenince boşaltılır.
 *
 * Env:
 *   NEXT_PUBLIC_LINKEDIN_PARTNER_ID   — Campaign Manager → Analyze → Insight Tag → Partner ID
 *   NEXT_PUBLIC_LINKEDIN_CONV_LEAD    — "Teklif talebi" dönüşümünün conversion_id'si (opsiyonel)
 *   NEXT_PUBLIC_LINKEDIN_CONV_DEMO    — "Demo randevusu" dönüşümünün conversion_id'si (opsiyonel)
 */

export const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '';

export const LINKEDIN_CONVERSIONS = {
  lead: process.env.NEXT_PUBLIC_LINKEDIN_CONV_LEAD || '',
  demo: process.env.NEXT_PUBLIC_LINKEDIN_CONV_DEMO || '',
} as const;

export type LinkedInConversion = keyof typeof LINKEDIN_CONVERSIONS;

declare global {
  interface Window {
    lintrk?: ((action: 'track', payload: { conversion_id: number }) => void) & { q?: unknown[] };
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    __sphereLinkedInLoaded?: boolean;
    __sphereLinkedInQueue?: number[];
  }
}

export function isLinkedInEnabled(): boolean {
  return Boolean(LINKEDIN_PARTNER_ID);
}

/**
 * Insight Tag SDK'sını yükler. Yalnızca marketing rızası varken çağrılmalı.
 * İdempotent: ikinci çağrı hiçbir şey yapmaz.
 */
export function loadLinkedInInsight(): void {
  if (typeof window === 'undefined' || !LINKEDIN_PARTNER_ID) return;
  if (window.__sphereLinkedInLoaded) return;
  window.__sphereLinkedInLoaded = true;

  window._linkedin_partner_id = LINKEDIN_PARTNER_ID;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(LINKEDIN_PARTNER_ID);

  // Resmî snippet'in stub kısmı: SDK inene kadar çağrılar q'da birikir.
  if (!window.lintrk) {
    const stub = ((action: 'track', payload: { conversion_id: number }) => {
      stub.q = stub.q || [];
      stub.q.push([action, payload]);
    }) as NonNullable<Window['lintrk']>;
    stub.q = [];
    window.lintrk = stub;
  }

  const s = document.createElement('script');
  s.type = 'text/javascript';
  s.async = true;
  s.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(s);

  // Rıza öncesi birikmiş dönüşümleri gönder
  const queued = window.__sphereLinkedInQueue || [];
  window.__sphereLinkedInQueue = [];
  for (const id of queued) window.lintrk('track', { conversion_id: id });
}

/**
 * Dönüşüm gönder. conversion_id tanımlı değilse sessizce atlar.
 * SDK henüz yoksa (rıza verilmemiş) kuyruğa alır — rıza gelirse gider, gelmezse kaybolur.
 */
export function trackLinkedInConversion(kind: LinkedInConversion): void {
  if (typeof window === 'undefined' || !LINKEDIN_PARTNER_ID) return;
  const raw = LINKEDIN_CONVERSIONS[kind];
  const id = Number(raw);
  if (!raw || !Number.isFinite(id)) return;

  if (window.__sphereLinkedInLoaded && typeof window.lintrk === 'function') {
    window.lintrk('track', { conversion_id: id });
    return;
  }
  window.__sphereLinkedInQueue = window.__sphereLinkedInQueue || [];
  if (!window.__sphereLinkedInQueue.includes(id)) window.__sphereLinkedInQueue.push(id);
}
