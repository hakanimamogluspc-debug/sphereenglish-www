/**
 * Kampanya motorundan fiyat teklifi (api-server /api/campaigns/quote).
 * Ödeme tutarının tek doğruluk kaynağı: süreli indirim + (sepet kampanyası | kupon, hangisi iyiyse).
 */

const API_BASE = (process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000').replace(/\/$/, '');

export type QuoteItem = { type: 'ebook' | 'bundle' | 'course'; slug: string };
export interface QuoteLine {
  type: 'ebook' | 'bundle' | 'course'; id: number; slug: string; title: string;
  listKurus: number; saleKurus: number; finalKurus: number; timedCampaignId: number | null;
}
export interface CampaignQuote {
  lines: QuoteLine[];
  listKurus: number;
  saleKurus: number;
  cartCampaign: { id: number; name: string; discountKurus: number } | null;
  coupon: { id: number; code: string; discountKurus: number } | null;
  applied: 'campaign' | 'coupon' | null;
  couponNote: string | null;
  couponError: string | null;
  affiliateCode: string | null;
  totalDiscountKurus: number;
  finalKurus: number;
}

export async function fetchQuote(items: QuoteItem[], couponCode?: string | null): Promise<CampaignQuote | { error: string; status: number }> {
  try {
    const r = await fetch(`${API_BASE}/api/campaigns/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, couponCode: couponCode || null }),
      cache: 'no-store',
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return { error: d?.error || 'Fiyat hesaplanamadı', status: r.status === 400 ? 400 : 502 };
    return d as CampaignQuote;
  } catch (e: any) {
    console.error('[campaign-quote] hata:', e?.message);
    return { error: 'Fiyat hesaplanamadı, birazdan tekrar deneyin', status: 502 };
  }
}

/** Kampanya ID'si: sepet kampanyası, yoksa süreli indirim kampanyası */
export function quoteCampaignId(q: CampaignQuote): number | null {
  return q.cartCampaign?.id ?? q.lines.find((l) => l.timedCampaignId)?.timedCampaignId ?? null;
}
