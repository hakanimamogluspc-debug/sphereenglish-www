'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';

/**
 * Header'da gösterilen sepet ikonu — tıklanınca mini drawer açar.
 * Badge'te ürün sayısı gösterilir.
 */
export default function CartIcon({ className = '' }: { className?: string }) {
  const { itemCount, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition ${className}`}
      title="Sepetim"
      aria-label={`Sepetim (${itemCount} ürün)`}
    >
      <ShoppingBag className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </button>
  );
}
