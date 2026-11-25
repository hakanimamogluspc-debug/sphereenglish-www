'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCart, formatTRY } from '@/lib/cart/cart-context';

/**
 * Sepette "Bunları da ekle" önerileri.
 *
 * Neden: müşteriler çoğunlukla yalnızca 5'li seti alıyor, diğer kitapları sonradan fark edip ayrı sipariş veriyordu.
 * Kural: sepette olmayan ve sepetteki bir setin içinde de bulunmayan kitaplar önerilir. Sepette set ya da
 * "1000 Kelime" serisinden kitap varsa önce beceri/sektör kitapları (seri dışı) gösterilir.
 */

interface Ebook {
  slug: string; title: string; subtitle: string | null; cover_image_url: string | null;
  price_try: string; list_price_try: string | null; category: string | null;
}
interface Bundle { slug: string; items_preview: Array<{ slug: string }> }

const API = (process.env.NEXT_PUBLIC_API_BASE || 'https://app.sphereenglish.com').replace(/\/$/, '');
const MAX = 3;

/** Seri dışı kitap mı? (e-kitaplar sayfasındaki gruplama ile aynı ölçüt: kategoride "beceri" ya da "sektör" geçer) */
const isSkillBook = (b: Ebook) => {
  const c = (b.category ?? '').toLocaleLowerCase('tr-TR');
  return c.includes('beceri') || c.includes('sektör');
};

export default function CartSuggestions() {
  const { items, addItem } = useCart();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(`${API}/api/ebooks`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/api/bundles`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([e, b]) => {
        if (cancelled) return;
        setEbooks(Array.isArray(e?.ebooks) ? e.ebooks : []);
        setBundles(Array.isArray(b?.bundles) ? b.bundles : []);
      })
      .catch(() => { /* öneri gösterilemezse sepet aynen çalışır */ });
    return () => { cancelled = true; };
  }, []);

  const suggestions = useMemo(() => {
    if (ebooks.length === 0 || items.length === 0) return [];
    const owned = new Set<string>();
    for (const it of items) {
      if (it.type === 'ebook') owned.add(it.slug);
      else bundles.find((b) => b.slug === it.slug)?.items_preview?.forEach((x) => owned.add(x.slug));
    }
    const rest = ebooks.filter((b) => !owned.has(b.slug));
    // Sepette yalnızca beceri kitabı varsa seri kitaplarını da öner; aksi halde önce beceri kitapları
    const cartHasSeries = items.some((it) => it.type === 'bundle' || !isSkillBook(ebooks.find((b) => b.slug === it.slug) ?? ({ category: null } as Ebook)));
    const first = rest.filter((b) => isSkillBook(b) === cartHasSeries);
    const second = rest.filter((b) => isSkillBook(b) !== cartHasSeries);
    return [...first, ...second].slice(0, MAX);
  }, [ebooks, bundles, items]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-[#e6ebf2] bg-[#f5f8fc] p-4" aria-labelledby="cartSuggestH">
      <h2 id="cartSuggestH" className="text-[15px] font-bold text-[#1B365D]">Bunları da ekle</h2>
      <p className="text-[12px] text-gray-500 mt-0.5">Aynı siparişe ekleyebileceğin kitaplar. Tek ödeme, hepsi aynı anda teslim edilir.</p>
      <ul className="mt-3 space-y-2.5">
        {suggestions.map((b) => {
          const price = Number(b.price_try);
          const list = b.list_price_try ? Number(b.list_price_try) : null;
          return (
            <li key={b.slug} className="flex items-center gap-3 rounded-lg bg-white border border-[#e6ebf2] p-2.5">
              <Link href={`/e-kitaplar/${b.slug}`} className="flex-shrink-0">
                {b.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.cover_image_url} alt="" className="w-11 h-[60px] object-cover rounded border" loading="lazy" />
                ) : (
                  <span className="block w-11 h-[60px] rounded bg-[#e8eef8]" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/e-kitaplar/${b.slug}`} className="block text-[13px] font-bold text-[#1B365D] hover:text-[#0ea5e9] leading-snug line-clamp-2">
                  {b.title}
                </Link>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <span className="text-[13px] font-bold text-emerald-700">{formatTRY(price)}</span>
                  {list && list > price && <span className="text-[11px] text-gray-400 line-through">{formatTRY(list)}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => addItem({
                  key: `ebook:${b.slug}`, type: 'ebook', slug: b.slug, title: b.title, subtitle: b.subtitle,
                  coverImageUrl: b.cover_image_url, priceTry: price, listPriceTry: list,
                })}
                className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#1B365D] text-white text-[12px] font-bold hover:bg-[#0ea5e9] transition-colors"
                aria-label={`${b.title} kitabını sepete ekle`}
              >
                <Plus className="w-3.5 h-3.5" /> Ekle
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
