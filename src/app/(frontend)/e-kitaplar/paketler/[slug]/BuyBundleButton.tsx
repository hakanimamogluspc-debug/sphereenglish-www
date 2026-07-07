'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ShoppingBag } from 'lucide-react';
import { trackAddToCart } from '@/lib/analytics/meta-pixel';
import { useCart } from '@/lib/cart/cart-context';

/**
 * Bundle satın alma butonu.
 * "Sepete Ekle" — cart context'e yeni item ekler + mini drawer açar.
 */
export default function BuyBundleButton({
  slug,
  title,
  subtitle,
  coverImageUrl,
  price,
  listPrice,
  itemCount,
}: {
  slug: string;
  title: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  price: number;
  listPrice?: number | null;
  itemCount: number;
}) {
  const { addItem, hasItem, openDrawer } = useCart();
  const cartKey = `bundle:${slug}`;
  const inCart = hasItem(cartKey);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    if (inCart) {
      openDrawer();
      return;
    }
    const { added } = addItem({
      key: cartKey,
      type: 'bundle',
      slug,
      title,
      subtitle: subtitle ?? null,
      coverImageUrl: coverImageUrl ?? null,
      priceTry: price,
      listPriceTry: listPrice ?? null,
      itemCount,
    });
    if (added) {
      trackAddToCart({
        productId: `bundle-${slug}`,
        productName: title,
        priceTry: price,
        type: 'ebook',
      });
      setJustAdded(true);
      openDrawer();
      setTimeout(() => setJustAdded(false), 3000);
    }
  }

  return (
    <div className="space-y-2">
      {inCart ? (
        <>
          <div className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[14px] text-emerald-800 bg-emerald-100 border border-emerald-200">
            <Check className="w-4 h-4" /> Sepette
          </div>
          <Link
            href="/sepet"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
          >
            Sepete Git & Ödemeye Devam
          </Link>
        </>
      ) : (
        <>
          <button
            onClick={handleAdd}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4" /> Sepete Ekle
          </button>
          {justAdded && (
            <p className="text-[12px] text-emerald-700 text-center font-semibold">
              ✓ Sepete eklendi
            </p>
          )}
        </>
      )}
    </div>
  );
}
