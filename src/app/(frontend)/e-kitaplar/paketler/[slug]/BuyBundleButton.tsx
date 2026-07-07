'use client';

import { useState } from 'react';
import { trackAddToCart, trackMetaEvent } from '@/lib/analytics/meta-pixel';

/**
 * Bundle satın alma butonu — MVP hali.
 *
 * Faz 5'te tam Iyzico çoklu-item checkout entegrasyonu yapılacak.
 * Şimdilik bir bilgi mesajı + "iletişime geç" fallback'i sunuyor.
 * Bu sayede paket sayfaları canlıda olsun, hazır olan kullanıcılar
 * iletişimden bize ulaşabilir.
 */
export default function BuyBundleButton({
  slug,
  title,
  price,
  itemCount,
}: {
  slug: string;
  title: string;
  price: number;
  itemCount: number;
}) {
  const [showInfo, setShowInfo] = useState(false);

  function handleClick() {
    // Meta Pixel — paket sepete eklendi
    trackAddToCart({
      productId: `bundle-${slug}`,
      productName: title,
      priceTry: price,
      type: 'ebook',
    });
    trackMetaEvent('InitiateCheckout', {
      content_ids: [`bundle-${slug}`],
      content_type: 'product',
      content_category: 'ebook_bundle',
      value: price,
      currency: 'TRY',
      num_items: itemCount,
    });
    setShowInfo(true);
  }

  const waMessage = encodeURIComponent(
    `Merhaba, "${title}" paketini satın almak istiyorum. Bilgi verebilir misiniz?`,
  );

  return (
    <>
      <button
        onClick={handleClick}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-[15px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md"
      >
        📦 Paketi Satın Al
      </button>

      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#1B365D] mb-2">
                Paket Ödeme Sistemi Yakında
              </h3>
              <p className="text-[14px] text-gray-600 leading-relaxed">
                Tam paket ödeme akışımız test aşamasında. Bu paketi hemen edinmek istiyorsan
                aşağıdaki kanallardan bize ulaş — sana özel indirimli link göndereceğiz.
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
                  `Paket Satın Alma: ${title}`,
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
