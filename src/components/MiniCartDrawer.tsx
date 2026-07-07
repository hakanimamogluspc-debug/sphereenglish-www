'use client';

import { X, ShoppingBag, Trash2, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart, formatTRY } from '@/lib/cart/cart-context';
import { useEffect } from 'react';

/**
 * Sağdan açılan mini sepet drawer.
 * Cart context ile bağlı, isDrawerOpen state'i true ise gösterilir.
 */
export default function MiniCartDrawer() {
  const { items, itemCount, subtotal, totalListPrice, savings, removeItem, isDrawerOpen, closeDrawer } = useCart();

  // ESC ile kapat
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isDrawerOpen, closeDrawer]);

  // Body scroll lock
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-[17px] text-[#1B365D]">
              Sepetim
              {itemCount > 0 && (
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  ({itemCount} ürün)
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-[16px] text-gray-800 mb-2">Sepetin boş</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                Kitaplarımıza göz atarak sepetine ekleyebilirsin.
              </p>
              <Link
                href="/e-kitaplar"
                onClick={closeDrawer}
                className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 text-sm"
              >
                E-Kitapları Keşfet
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => {
                const isBundle = item.type === 'bundle';
                const detailUrl = isBundle
                  ? `/e-kitaplar/paketler/${item.slug}`
                  : `/e-kitaplar/${item.slug}`;
                return (
                  <div
                    key={item.key}
                    className="flex gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-emerald-300 transition"
                  >
                    {/* Görsel */}
                    <Link href={detailUrl} onClick={closeDrawer} className="flex-shrink-0">
                      {item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="w-14 h-20 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-14 h-20 rounded bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          {isBundle ? (
                            <Package className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-emerald-600" />
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Bilgi */}
                    <div className="flex-1 min-w-0">
                      {isBundle && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 mb-1">
                          📦 Paket
                        </span>
                      )}
                      <Link
                        href={detailUrl}
                        onClick={closeDrawer}
                        className="block text-[13px] font-semibold text-[#1B365D] hover:text-emerald-600 line-clamp-2 mb-1"
                      >
                        {item.title}
                      </Link>
                      {isBundle && item.itemCount && (
                        <p className="text-[11px] text-gray-500 mb-1">
                          {item.itemCount} kitap
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-bold text-[14px] text-emerald-700">
                          {formatTRY(item.priceTry)}
                        </span>
                        {item.listPriceTry && item.listPriceTry > item.priceTry && (
                          <span className="text-[11px] text-gray-400 line-through">
                            {formatTRY(item.listPriceTry)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Kaldır */}
                    <button
                      onClick={() => removeItem(item.key)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded self-start"
                      title="Sepetten çıkar"
                      aria-label="Sepetten çıkar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — özet + checkout */}
        {items.length > 0 && (
          <div className="border-t bg-gray-50 p-4 space-y-3">
            {savings > 0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-500">Toplam liste fiyatı</span>
                <span className="text-gray-400 line-through">{formatTRY(totalListPrice)}</span>
              </div>
            )}
            {savings > 0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-emerald-600 font-semibold">💰 Kazancınız</span>
                <span className="text-emerald-600 font-semibold">{formatTRY(savings)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2 border-t border-gray-200">
              <span className="text-[13px] font-semibold text-gray-700">Ara Toplam</span>
              <span className="text-[22px] font-extrabold text-[#1B365D]">
                {formatTRY(subtotal)}
              </span>
            </div>

            <Link
              href="/sepet"
              onClick={closeDrawer}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition"
            >
              Sepete Git & Ödemeye Devam
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={closeDrawer}
              className="w-full py-2 text-[12px] text-gray-500 hover:text-gray-700"
            >
              Alışverişe devam et
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
