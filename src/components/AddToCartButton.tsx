'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { trackAddToCart } from '@/lib/analytics/meta-pixel';

/**
 * Genel "Sepete Ekle" butonu — hem tekil kitap hem paket için kullanılır.
 * Kart içinde kullanılırken preventPropagation ile Link'e tıklamayı engeller.
 * Sepette mevcutsa "Sepette" durumuna geçer + "Sepete Git" seçeneği verir.
 *
 * variant:
 *   - "compact" : küçük yatay buton (kart altları için)
 *   - "full"    : geniş buton (detay sayfaları için)
 */
export default function AddToCartButton({
  type,
  slug,
  title,
  subtitle,
  coverImageUrl,
  price,
  listPrice,
  itemCount,
  variant = 'compact',
  className = '',
}: {
  type: 'ebook' | 'bundle';
  slug: string;
  title: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  price: number;
  listPrice?: number | null;
  /** Sadece bundle için */
  itemCount?: number;
  variant?: 'compact' | 'full';
  className?: string;
}) {
  const { addItem, hasItem, openDrawer } = useCart();
  const cartKey = `${type}:${slug}`;
  const inCart = hasItem(cartKey);
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    // Parent Link'in gitmesine engel ol
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      openDrawer();
      return;
    }

    const { added } = addItem({
      key: cartKey,
      type,
      slug,
      title,
      subtitle: subtitle ?? null,
      coverImageUrl: coverImageUrl ?? null,
      priceTry: price,
      listPriceTry: listPrice ?? null,
      itemCount: itemCount,
    });

    if (added) {
      trackAddToCart({
        productId: `${type}-${slug}`,
        productName: title,
        priceTry: price,
        type: 'ebook',
      });
      setJustAdded(true);
      openDrawer();
      setTimeout(() => setJustAdded(false), 3000);
    }
  }

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        {inCart ? (
          <Link
            href="/sepet"
            onClick={(e) => e.stopPropagation()}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <Check className="w-4 h-4" /> Sepette · Sepete Git
          </Link>
        ) : (
          <button
            onClick={handleClick}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
          >
            <ShoppingBag className="w-4 h-4" /> Sepete Ekle
          </button>
        )}
        {justAdded && (
          <p className="text-[12px] text-emerald-700 text-center font-semibold">
            ✓ Sepete eklendi
          </p>
        )}
      </div>
    );
  }

  // Compact — kart altı için
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold text-[12px] transition-colors shadow-sm ${
        inCart
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      } ${className}`}
      title={inCart ? 'Sepete git' : 'Sepete ekle'}
    >
      {inCart ? (
        <>
          <Check className="w-3.5 h-3.5" /> Sepette
        </>
      ) : (
        <>
          <ShoppingBag className="w-3.5 h-3.5" /> Sepete Ekle
        </>
      )}
    </button>
  );
}
