/**
 * E-kitap fiyatları — HER ZAMAN admin panelindeki (veritabanındaki) güncel fiyattan okunur.
 * Metinlere (SEO açıklaması, sosyal paylaşım önizlemesi, partner örneği) fiyat elle YAZILMAZ;
 * böylece admin'de fiyat değişince site kendiliğinden güncellenir.
 */

const API_BASE = (process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000').replace(/\/$/, '');

export interface EbookPrices {
  /** En ucuz tek kitap fiyatı (TL) */
  single: number | null;
  /** Öne çıkan setin fiyatı (TL) */
  set: number | null;
  /** Setteki kitap sayısı */
  setCount: number | null;
}

async function getJson(path: string, revalidate: number): Promise<any> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { next: { revalidate } });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/** Fiyatlar alınamazsa alanlar null döner — çağıran taraf fiyatsız metin kullanmalı. */
export async function getEbookPrices(revalidate = 300): Promise<EbookPrices> {
  const [e, b] = await Promise.all([getJson('/api/ebooks', revalidate), getJson('/api/bundles', revalidate)]);
  const ebooks: Array<{ price_try: string | number }> = e?.ebooks ?? [];
  const bundles: Array<{ price_try: string | number; is_featured?: boolean; item_count?: number }> = b?.bundles ?? [];
  const prices = ebooks.map((x) => Number(x.price_try)).filter((n) => Number.isFinite(n) && n > 0);
  const set = bundles.find((x) => x.is_featured) ?? bundles[0];
  return {
    single: prices.length ? Math.min(...prices) : null,
    set: set && Number(set.price_try) > 0 ? Number(set.price_try) : null,
    setCount: set?.item_count ?? null,
  };
}

/** ₺249 biçimi (kuruş yok) */
export function fmtTry(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
}
