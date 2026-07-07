'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

/**
 * Sepet Context'i — localStorage tabanlı, browser-only.
 * Dijital ürünler için tasarlandı: her ürün sepette bir kez bulunur (qty yok).
 *
 * Kullanım:
 *   const { items, addItem, removeItem, total, clearCart } = useCart();
 *
 * Provider layout'a eklenir. State page reload'a persist eder.
 */

export type CartItem = {
  /** Benzersiz key — "ebook:{slug}" veya "bundle:{slug}" */
  key: string;
  type: 'ebook' | 'bundle';
  slug: string;
  title: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  priceTry: number;
  listPriceTry?: number | null;
  /** Sadece bundle için — kaç kitap içeriyor */
  itemCount?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  totalListPrice: number;
  savings: number;
  addItem: (item: CartItem) => { added: boolean; message?: string };
  removeItem: (key: string) => void;
  clearCart: () => void;
  hasItem: (key: string) => boolean;
  /** Sepet açık mı state — drawer için */
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'sphere_cart_v1';

function loadFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota exceeded veya storage disabled */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Storage'dan yükle — sadece client-side
  useEffect(() => {
    setItems(loadFromStorage());
    setHydrated(true);
  }, []);

  // Değişince storage'a yaz
  useEffect(() => {
    if (hydrated) saveToStorage(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    let added = false;
    let message: string | undefined;
    setItems((prev) => {
      if (prev.find((x) => x.key === item.key)) {
        message = 'Bu ürün zaten sepetinde';
        return prev;
      }
      added = true;
      return [...prev, item];
    });
    return { added, message };
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const hasItem = useCallback((key: string) => items.some((x) => x.key === key), [items]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const subtotal = items.reduce((sum, i) => sum + Number(i.priceTry ?? 0), 0);
  const totalListPrice = items.reduce(
    (sum, i) => sum + Number(i.listPriceTry ?? i.priceTry ?? 0),
    0,
  );
  const savings = Math.max(0, totalListPrice - subtotal);

  const value: CartContextValue = {
    items,
    itemCount: items.length,
    subtotal,
    totalListPrice,
    savings,
    addItem,
    removeItem,
    clearCart,
    hasItem,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}

/** Format TL — helper */
export function formatTRY(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}
