/**
 * Sitede kampanya gösterimi (rozet + üstü çizili fiyat).
 * Kurallar api-server lib/campaign-engine.ts ile aynı; buradaki hesap yalnızca GÖSTERİM içindir.
 * Ödenecek tutar her zaman ödeme başlarken sunucudaki motordan alınır.
 */

const API_BASE = (process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000').replace(/\/$/, '');

export interface PublicCampaign {
  id: number; name: string;
  type: 'timed_discount' | 'buy_x_pay_y' | 'cart_threshold' | 'tiered_quantity';
  scope: 'ebook' | 'course' | 'all';
  targetEbookIds: number[]; targetCategories: string[]; targetCourseSlugs: string[];
  params: any; badgeText: string | null; description: string | null; endsAt: string | null; showOnHome: boolean;
}

export async function getActiveCampaigns(): Promise<PublicCampaign[]> {
  try {
    const r = await fetch(`${API_BASE}/api/campaigns/active`, { next: { revalidate: 60 } });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d?.campaigns) ? d.campaigns : [];
  } catch {
    return [];
  }
}

export function categoryGroup(category: string | null): string {
  const c = (category ?? '').toLocaleLowerCase('tr-TR');
  if (c.includes('sektör') || c.includes('sektor')) return 'sektorel';
  if (c.includes('beceri')) return 'beceri';
  return 'seri';
}

function ebookEligible(c: PublicCampaign, id: number, category: string | null): boolean {
  if (c.scope === 'course') return false;
  if (c.targetEbookIds.length === 0 && c.targetCategories.length === 0) return true;
  return c.targetEbookIds.includes(id) || c.targetCategories.includes(categoryGroup(category));
}
function courseEligible(c: PublicCampaign, slug: string): boolean {
  if (c.scope === 'ebook') return false;
  return c.targetCourseSlugs.length === 0 || c.targetCourseSlugs.includes(slug);
}

const tl = (kurus: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(kurus / 100);

/** Kampanyanın kısa açıklaması (rozet metni girilmediyse) */
export function campaignLabel(c: PublicCampaign): string {
  if (c.badgeText) return c.badgeText;
  const p = c.params ?? {};
  const disc = p.discountType === 'fixed' ? `${tl(Number(p.value) * 100)} indirim` : `%${p.value} indirim`;
  if (c.type === 'buy_x_pay_y') return `${p.buy} al ${p.pay} öde`;
  if (c.type === 'cart_threshold') return `${tl(Number(p.minKurus))} üzeri ${disc}`;
  if (c.type === 'tiered_quantity') {
    const t = (p.tiers ?? []).slice().sort((a: any, b: any) => a.minQty - b.minQty)[0];
    return t ? `${t.minQty}+ kitapta %${t.percent}` : 'Çoklu alım indirimi';
  }
  return disc;
}

function timedDiscountKurus(c: PublicCampaign, priceKurus: number): number {
  const p = c.params ?? {};
  const v = Number(p.value) || 0;
  const d = p.discountType === 'fixed' ? Math.round(v * 100) : Math.floor((priceKurus * Math.min(100, Math.max(0, v))) / 100);
  return Math.min(d, priceKurus - 100);
}

export interface Offer {
  priceTry: number;        // gösterilecek fiyat (süreli indirim sonrası)
  strikeTry: number | null; // üstü çizili fiyat
  badges: string[];        // kampanya rozetleri
  endsAt: string | null;   // süreli indirimin bitişi
}

function offerFor(priceTry: number, listTry: number | null, applicable: PublicCampaign[]): Offer {
  const kurus = Math.round(priceTry * 100);
  let best = 0; let bestC: PublicCampaign | null = null;
  for (const c of applicable.filter((x) => x.type === 'timed_discount')) {
    const d = timedDiscountKurus(c, kurus);
    if (d > best) { best = d; bestC = c; }
  }
  const sale = (kurus - best) / 100;
  const strike = best > 0 ? Math.max(priceTry, listTry ?? 0) : listTry && listTry > priceTry ? listTry : null;
  const badges = [
    ...(bestC ? [campaignLabel(bestC)] : []),
    ...applicable.filter((c) => c.type !== 'timed_discount').map(campaignLabel),
  ];
  return { priceTry: sale, strikeTry: strike, badges: [...new Set(badges)].slice(0, 2), endsAt: bestC?.endsAt ?? null };
}

export function ebookOffer(campaigns: PublicCampaign[], b: { id: number; category: string | null; priceTry: number; listTry: number | null }): Offer {
  // Sepet kampanyalarından kurs-only olanlar ve kurslara özgü olanlar elenir
  const applicable = campaigns.filter((c) => ebookEligible(c, b.id, b.category));
  return offerFor(b.priceTry, b.listTry, applicable);
}

export function courseOffer(campaigns: PublicCampaign[], c: { slug: string; priceTry: number; listTry?: number | null }): Offer {
  const applicable = campaigns.filter((x) => courseEligible(x, c.slug) && (x.type === 'timed_discount' || x.type === 'cart_threshold'));
  return offerFor(c.priceTry, c.listTry ?? null, applicable);
}
