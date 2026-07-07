'use client';

import Link from 'next/link';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Trash2, Package, ArrowLeft, Tag, Loader2, Check, AlertCircle } from 'lucide-react';
import { useCart, formatTRY } from '@/lib/cart/cart-context';

export default function SepetPage() {
  const { items, itemCount, subtotal, totalListPrice, savings, removeItem, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountKurus: number;
    type: 'coupon' | 'affiliate';
  } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCouponBusy(true);
    setCouponError(null);
    setCouponMessage(null);
    try {
      const amountKurus = Math.round(subtotal * 100);
      // Not: Sepette birden fazla ürün var, ama validate endpoint tek scope alıyor.
      // Şimdilik "ebook" scope ile validate ediyoruz. Faz 5'te sepet-scope endpoint eklenebilir.
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, scope: 'ebook', amountKurus }),
      });
      const data = await r.json();
      if (!data?.ok) {
        setCouponError(data?.error || 'Geçersiz kod');
        return;
      }
      setAppliedCoupon({
        code: data.code || code,
        discountKurus: Number(data.discountKurus ?? 0),
        type: data.type,
      });
      setCouponMessage(data.message || 'Kupon uygulandı');
    } catch (e: any) {
      setCouponError(e?.message || 'Doğrulama hatası');
    } finally {
      setCouponBusy(false);
    }
  }

  function clearCoupon() {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
    setCouponMessage(null);
  }

  const discount = appliedCoupon ? Number(appliedCoupon.discountKurus) / 100 : 0;
  const finalTotal = Math.max(0, subtotal - discount);

  return (
    <main className="bg-white min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-8 pb-16">
        {/* Breadcrumb */}
        <Link
          href="/e-kitaplar"
          className="inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-emerald-600 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Alışverişe devam
        </Link>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-[36px] lg:text-[44px] font-extrabold text-[#1B365D] leading-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-emerald-600" />
            Sepetim
          </h1>
          {itemCount > 0 && (
            <p className="text-[14px] text-gray-500 mt-2">
              {itemCount} ürün · Toplam {formatTRY(subtotal)}
            </p>
          )}
        </div>

        {/* Boş durum */}
        {itemCount === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-gray-50">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-[20px] font-bold text-gray-700 mb-2">Sepetin boş</h2>
            <p className="text-[14px] text-gray-500 mb-6 max-w-md mx-auto">
              Sphere English e-kitaplarını incele ve ilgilendiğin kitapları sepete ekle.
            </p>
            <Link
              href="/e-kitaplar"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
            >
              E-Kitapları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol — Sepet ürünleri */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const isBundle = item.type === 'bundle';
                const detailUrl = isBundle
                  ? `/e-kitaplar/paketler/${item.slug}`
                  : `/e-kitaplar/${item.slug}`;
                return (
                  <div
                    key={item.key}
                    className="flex gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition"
                  >
                    <Link href={detailUrl} className="flex-shrink-0">
                      {item.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="w-20 h-28 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-20 h-28 rounded bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                          {isBundle ? (
                            <Package className="w-8 h-8 text-emerald-600" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-emerald-600" />
                          )}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {isBundle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 mb-1">
                              📦 Paket · {item.itemCount ?? '?'} kitap
                            </span>
                          )}
                          <Link
                            href={detailUrl}
                            className="block text-[15px] font-bold text-[#1B365D] hover:text-emerald-600 leading-snug"
                          >
                            {item.title}
                          </Link>
                          {item.subtitle && (
                            <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.key)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                          title="Sepetten çıkar"
                          aria-label="Sepetten çıkar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-auto pt-3 flex items-baseline gap-2">
                        <span className="font-bold text-[18px] text-emerald-700">
                          {formatTRY(item.priceTry)}
                        </span>
                        {item.listPriceTry && item.listPriceTry > item.priceTry && (
                          <span className="text-[13px] text-gray-400 line-through">
                            {formatTRY(item.listPriceTry)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  if (confirm('Sepetteki tüm ürünleri kaldırmak istediğinden emin misin?')) {
                    clearCart();
                    clearCoupon();
                  }
                }}
                className="text-[13px] text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Sepeti temizle
              </button>
            </div>

            {/* Sağ — Özet + kupon + checkout */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4">
                <h2 className="font-bold text-[16px] text-[#1B365D]">Sipariş Özeti</h2>

                {/* Kupon kodu */}
                {!appliedCoupon ? (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                      <Tag className="w-3.5 h-3.5 inline mr-1" /> Kupon Kodu (opsiyonel)
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ÖRN. HOSGELDIN10"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono bg-white"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponBusy || !couponCode.trim()}
                        className="px-3 py-2 bg-[#1B365D] text-white rounded-lg text-sm font-semibold hover:bg-[#0B1F3A] disabled:bg-gray-300"
                      >
                        {couponBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Uygula'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-1.5 text-[11px] text-red-600 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1 text-[13px] font-semibold text-emerald-800">
                          <Check className="w-4 h-4" />
                          {appliedCoupon.code}
                        </div>
                        {couponMessage && (
                          <p className="text-[11px] text-emerald-700 mt-1">{couponMessage}</p>
                        )}
                      </div>
                      <button
                        onClick={clearCoupon}
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-600">Ara toplam</span>
                    <span className="font-semibold text-gray-800">{formatTRY(subtotal)}</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-gray-500">Liste fiyatından tasarruf</span>
                      <span className="text-emerald-600 font-semibold">-{formatTRY(savings)}</span>
                    </div>
                  )}
                  {appliedCoupon && discount > 0 && (
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-emerald-600 font-semibold">
                        Kupon indirimi ({appliedCoupon.code})
                      </span>
                      <span className="text-emerald-600 font-bold">-{formatTRY(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-3 border-t border-gray-300">
                  <span className="text-[15px] font-bold text-[#1B365D]">Toplam</span>
                  <span className="text-[28px] font-extrabold text-emerald-700">
                    {formatTRY(finalTotal)}
                  </span>
                </div>

                {/* Checkout MVP — WhatsApp/Mail yönlendirme */}
                <CheckoutMvp
                  items={items}
                  finalTotal={finalTotal}
                  appliedCouponCode={appliedCoupon?.code ?? null}
                />

                <div className="pt-2 space-y-1.5 text-[11px] text-gray-500 leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Iyzico 3D Secure ödeme
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Anında PDF indirme
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Ömür boyu erişim
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

// ─── MVP Checkout — Faz 5'e kadar WhatsApp/Mail fallback ────────────────
function CheckoutMvp({
  items,
  finalTotal,
  appliedCouponCode,
}: {
  items: ReturnType<typeof useCart>['items'];
  finalTotal: number;
  appliedCouponCode: string | null;
}) {
  const [showInfo, setShowInfo] = useState(false);

  function handleClick() {
    // Meta Pixel — InitiateCheckout
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      try {
        (window as any).fbq('track', 'InitiateCheckout', {
          content_ids: items.map((i) => `${i.type}-${i.slug}`),
          content_type: 'product',
          num_items: items.length,
          value: finalTotal,
          currency: 'TRY',
        });
      } catch {
        /* ignore */
      }
    }
    setShowInfo(true);
  }

  const itemLines = items
    .map((i, idx) => `${idx + 1}. ${i.title} (${i.type === 'bundle' ? 'Paket' : 'Kitap'})`)
    .join('\n');
  const waMessage = encodeURIComponent(
    `Merhaba, aşağıdaki ürünleri satın almak istiyorum:\n\n${itemLines}\n\nToplam: ${finalTotal.toLocaleString(
      'tr-TR',
    )} TL${appliedCouponCode ? `\nKupon: ${appliedCouponCode}` : ''}\n\nBilgi verebilir misiniz?`,
  );

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] transition shadow-md"
      >
        Ödeme Yap
      </button>

      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-3">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#1B365D] mb-2">
                Sepet Ödeme Sistemi Yakında
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Çoklu ürün ödeme akışımız test aşamasında. Bu siparişi hemen tamamlamak istiyorsan
                aşağıdaki kanallardan ulaş — sana özel ödeme linki göndereceğiz.
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/905066085810?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
              >
                💬 WhatsApp ile Sipariş Ver
              </a>
              <a
                href={`mailto:info@sphereenglish.com?subject=${encodeURIComponent(
                  'Sepet Siparişi',
                )}&body=${waMessage}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border-2 border-gray-200 text-[#1B365D] font-semibold hover:bg-gray-50 transition"
              >
                ✉️ E-posta Gönder
              </a>
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-2 text-[12px] text-gray-500 hover:text-gray-700"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
