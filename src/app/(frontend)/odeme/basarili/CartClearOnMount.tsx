'use client';

import { useEffect } from 'react';
import { useCart } from '@/lib/cart/cart-context';

/**
 * Sepet başarılı ödeme sonrası mount olur, sepeti temizler.
 * Success sayfası server component olduğu için client-only bu utility gerekli.
 * Ödeme tekrar deneyen kullanıcı için "temiz sepet" garantisi.
 */
export default function CartClearOnMount() {
  const { clearCart } = useCart();
  useEffect(() => {
    try {
      clearCart();
    } catch {
      /* ignore */
    }
    // Ek güvence — localStorage direkt temizle
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('sphere_cart_v1');
      }
    } catch {
      /* ignore */
    }
  }, [clearCart]);
  return null;
}
