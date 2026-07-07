import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PurchaseTracker from '@/components/PurchaseTracker';
import CartClearOnMount from './CartClearOnMount';

export const metadata: Metadata = {
  title: 'Ödeme Başarılı | Sphere English',
  robots: { index: false, follow: false },
};

const API_BASE =
  process.env.INTERNAL_API_BASE_URL ??
  'http://sphere-english_sphere-english-app:3000';
const PUBLIC_DOWNLOAD_BASE =
  process.env.PUBLIC_DOWNLOAD_BASE_URL ??
  process.env.PUBLIC_API_BASE_URL ??
  'https://app.sphereenglish.com';

type OrderItem = {
  ebookSlug: string | null;
  ebookTitle: string;
  ebookAuthor: string | null;
  ebookCoverUrl: string | null;
  bundleSlug: string | null;
  bundleTitle: string | null;
  downloadToken: string;
  downloadExpiresAt: string;
  amountPaid: number;
};

type OrderData = {
  orderId: string;
  totalAmount: number;
  currency: string;
  paidAt: string;
  itemCount: number;
  items: OrderItem[];
};

async function fetchOrder(orderId: string): Promise<OrderData | null> {
  try {
    const r = await fetch(
      `${API_BASE.replace(/\/$/, '')}/api/order/${encodeURIComponent(orderId)}`,
      { cache: 'no-store' },
    );
    if (!r.ok) return null;
    const d = await r.json();
    return d?.order ?? null;
  } catch {
    return null;
  }
}

function formatTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function OdemeBasariliPage({
  searchParams,
}: {
  searchParams: Promise<{
    conv?: string;
    orderId?: string;
    warn?: string;
    type?: string;
    token?: string;
    value?: string;
    productId?: string;
    productName?: string;
  }>;
}) {
  const sp = await searchParams;
  const conv = sp.conv ?? '';
  const warn = sp.warn;
  const type = sp.type;
  const token = sp.token;
  const orderId = sp.orderId;

  const isEbook = type === 'ebook';
  const isCart = type === 'cart';
  const isSubscription = !isEbook && !isCart;

  const downloadUrl =
    isEbook && token
      ? `${PUBLIC_DOWNLOAD_BASE}/api/ebooks/download?token=${encodeURIComponent(token)}`
      : null;

  // Cart tipiyse — order detaylarını çek
  const cartOrder = isCart && orderId ? await fetchOrder(orderId) : null;

  // Meta Pixel Purchase event params
  const priceTry = Number(sp.value ?? (cartOrder?.totalAmount ?? 0));
  const productId = sp.productId ?? (isEbook ? 'ebook' : isCart ? `cart-${orderId}` : 'subscription');
  const productName = sp.productName ?? (isEbook ? 'E-Kitap' : isCart ? 'Sepet' : 'Pro Abonelik');

  return (
    <main className="bg-white min-h-screen">
      {/* Meta Pixel Purchase */}
      {priceTry > 0 && !warn && (
        <PurchaseTracker
          type={isEbook || isCart ? 'ebook' : 'subscription'}
          productId={productId}
          productName={productName}
          priceTry={priceTry}
          orderId={orderId ?? conv}
        />
      )}

      {/* Sepet ödemesi başarılıysa localStorage'ı temizle */}
      {isCart && cartOrder && <CartClearOnMount />}

      <Header />
      <section className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
        <div className="text-center mb-10">
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-[32px] lg:text-[40px] font-extrabold tracking-tight text-[#1B365D] mb-3">
            {isCart
              ? cartOrder
                ? `${cartOrder.itemCount} Kitap Hazır! 🎉`
                : 'Ödemen Alındı 🎉'
              : isEbook
                ? 'Kitabın Hazır! 🎉'
                : 'Ödemen Alındı 🎉'}
          </h1>
          <p className="text-[16px] text-gray-600 max-w-md mx-auto">
            {isCart
              ? 'Ödemen başarıyla alındı. Aşağıdaki butonlardan tüm kitaplarını hemen indirebilirsin. Her link 7 gün geçerli, 10 indirme hakkı verir.'
              : isEbook
                ? 'Ödemen başarıyla alındı. Aşağıdaki butondan kitabını hemen indirebilirsin. Bağlantı 7 gün geçerli, 10 indirme hakkı verir.'
                : 'Aboneliğin aktif edildi. E-posta adresine giriş bilgileri ve makbuz gönderildi.'}
          </p>
        </div>

        {/* Cart — çoklu indirme linkleri */}
        {isCart && cartOrder && warn !== 'manuel' && (
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Sipariş #{cartOrder.orderId.slice(-8)}
                </div>
                <div className="text-[13px] text-emerald-900 font-semibold">
                  {cartOrder.itemCount} ürün · {formatTRY(cartOrder.totalAmount)}
                </div>
              </div>
              <div className="text-[11px] text-emerald-700">✓ Ödeme onaylandı</div>
            </div>

            {cartOrder.items.map((it, idx) => {
              const downloadHref = `${PUBLIC_DOWNLOAD_BASE}/api/ebooks/download?token=${encodeURIComponent(
                it.downloadToken,
              )}`;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 transition"
                >
                  {it.ebookCoverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.ebookCoverUrl}
                      alt={it.ebookTitle}
                      className="w-16 h-20 object-cover rounded border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 rounded bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0 text-2xl">
                      📚
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {it.bundleTitle && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 mb-1">
                        📦 {it.bundleTitle}
                      </span>
                    )}
                    <div className="font-bold text-[15px] text-[#1B365D] leading-snug">
                      {it.ebookTitle}
                    </div>
                    {it.ebookAuthor && (
                      <div className="text-[12px] text-gray-500">{it.ebookAuthor}</div>
                    )}
                  </div>

                  <a
                    href={downloadHref}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition shadow-sm"
                  >
                    📄 İndir
                  </a>
                </div>
              );
            })}

            <p className="text-[11px] text-gray-500 text-center mt-3">
              Tüm bağlantılar ve fatura ayrıca e-posta adresine gönderildi. Bağlantıları
              kaydetmeyi unutma — 7 gün geçerli.
            </p>
          </div>
        )}

        {/* Tekil ebook — indirme butonu */}
        {isEbook && downloadUrl && warn !== 'manuel' && (
          <div className="mb-8 text-center">
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[16px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg"
            >
              📄 Kitabı PDF Olarak İndir
            </a>
            <p className="text-[12px] text-gray-500 mt-3">
              Bağlantıyı kaydetmeyi unutma — 7 gün geçerli, sonra yeniden satın alman gerekir.
            </p>
          </div>
        )}

        {/* Manuel aktivasyon uyarısı */}
        {warn === 'manuel' && (
          <div className="mb-6 mx-auto max-w-lg p-5 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900 text-left">
            <p className="font-semibold mb-2">📬 İndirme bağlantısı maile gönderiliyor</p>
            <p className="mb-2">
              Ödemen başarıyla alındı, ancak hesap aktivasyonunda kısa bir gecikme yaşanıyor.
              {isCart ? ' Tüm PDF indirme bağlantıları' : ' PDF indirme bağlantısı'}{' '}
              <strong>birkaç dakika içinde e-posta adresine</strong> gönderilecek.
            </p>
            <p className="text-[12px]">
              Eğer 15 dakika içinde mail almazsan veya hemen yardım gerekirse{' '}
              <a
                className="underline font-semibold"
                href="mailto:info@sphereenglish.com"
              >
                info@sphereenglish.com
              </a>{' '}
              ile iletişime geç — siparişini doğrulayıp linki manuel göndereceğiz.
            </p>
          </div>
        )}

        {/* Abonelik ise ne yapmalı listesi */}
        {isSubscription && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
            <p className="text-[12px] font-bold tracking-wider uppercase text-gray-500 mb-3">
              Şimdi Ne Yapacaksın?
            </p>
            <ol className="space-y-3 text-[14px] text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">
                  1
                </span>
                <span>E-posta gelen kutunu kontrol et — giriş linkimiz orada.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">
                  2
                </span>
                <span>
                  <a
                    className="text-[#0ea5e9] font-semibold"
                    href="https://app.sphereenglish.com/login"
                  >
                    app.sphereenglish.com
                  </a>{' '}
                  adresinden giriş yap.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">
                  3
                </span>
                <span>
                  Seviye belirleme testini yap ve AI Studio&apos;nun tüm özelliklerine başla.
                </span>
              </li>
            </ol>
          </div>
        )}

        <div className="text-center">
          <Link
            href={isEbook || isCart ? '/e-kitaplar' : 'https://app.sphereenglish.com/login'}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
          >
            {isEbook || isCart ? 'Diğer Kitaplara Göz At' : "Sphere English'e Git"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          {(orderId || conv) && (
            <p className="mt-6 text-[11px] text-gray-400">
              İşlem No: {orderId ?? conv}
            </p>
          )}

          <p className="mt-10 text-[13px] text-gray-500">
            Yardım gerekirse:{' '}
            <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">
              info@sphereenglish.com
            </a>{' '}
            ·{' '}
            <a className="text-[#0ea5e9]" href="https://wa.me/905066085810">
              WhatsApp
            </a>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
