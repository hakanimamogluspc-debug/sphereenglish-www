import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote, type QuoteItem } from '@/lib/campaign-quote';

/**
 * Sepet önizleme fiyatı — kampanya motorundan (api-server) teklif.
 * Sepet sayfası bunu gösterir; ödeme başlatılırken aynı hesap sunucuda yeniden yapılır.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: QuoteItem[] = (Array.isArray(body?.items) ? body.items : [])
    .slice(0, 20)
    .map((i: any) => ({ type: i?.type === 'bundle' ? 'bundle' : i?.type === 'course' ? 'course' : 'ebook', slug: String(i?.slug ?? '') }))
    .filter((i: QuoteItem) => i.slug);
  if (items.length === 0) return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
  const couponCode = String(body?.couponCode ?? '').trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '') || null;
  const q = await fetchQuote(items, couponCode);
  if ('error' in q) return NextResponse.json({ error: q.error }, { status: q.status });
  return NextResponse.json(q);
}
