import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DiscountCountdown from '@/components/DiscountCountdown';
import BuyBundleButton from './BuyBundleButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000';

interface BundleItem {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  author: string;
  cover_image_url: string | null;
  page_count: number | null;
  reading_time_min: number | null;
  price_try: string;
  category: string | null;
}

interface Bundle {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  price_try: string;
  list_price_try: string | null;
  currency: string;
  discount_ends_at: string | null;
  is_featured: boolean;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  created_at: string;
  items: BundleItem[];
  individual_total_try: number;
  savings_amount_try: number;
  savings_percent: number;
}

async function getBundle(slug: string): Promise<Bundle | null> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, '')}/api/bundles/${slug}`, {
      cache: 'no-store',
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.bundle ?? null;
  } catch (err) {
    console.error('[bundle detay] fetch error:', err);
    return null;
  }
}

function formatTRY(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const bundle = await getBundle(params.slug);
  if (!bundle) return { title: 'Paket bulunamadı | Sphere English' };

  const title = bundle.seo_title || `${bundle.title} | Sphere English`;
  const description =
    bundle.seo_description ||
    (bundle.description ?? '').slice(0, 280) ||
    `${bundle.items?.length ?? 0} kitaplık iş İngilizcesi seti — %${bundle.savings_percent} indirim`;

  return {
    title,
    description,
    keywords: bundle.seo_keywords ?? undefined,
    alternates: { canonical: `https://www.sphereenglish.com/e-kitaplar/paketler/${bundle.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.sphereenglish.com/e-kitaplar/paketler/${bundle.slug}`,
      images: bundle.cover_image_url ? [{ url: bundle.cover_image_url, width: 1200, height: 800, alt: bundle.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: bundle.cover_image_url ? [bundle.cover_image_url] : undefined,
    },
  };
}

export default async function BundleDetailPage({ params }: { params: { slug: string } }) {
  const bundle = await getBundle(params.slug);
  if (!bundle) notFound();

  const price = Number(bundle.price_try);
  const listPrice = bundle.list_price_try ? Number(bundle.list_price_try) : null;
  const individualTotal = Number(bundle.individual_total_try ?? 0);
  const savings = Number(bundle.savings_amount_try ?? 0);
  const savingsPercent = Number(bundle.savings_percent ?? 0);

  // SEO JSON-LD — Product schema
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: bundle.title,
    description: bundle.description,
    image: bundle.cover_image_url,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TRY',
      price: price,
      availability: 'https://schema.org/InStock',
      url: `https://www.sphereenglish.com/e-kitaplar/paketler/${bundle.slug}`,
      seller: { '@type': 'Organization', name: 'Sphere English' },
    },
    brand: { '@type': 'Brand', name: 'Sphere English' },
  };

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />

      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-6 lg:px-10 pt-8 text-[12px] text-gray-500">
        <Link href="/e-kitaplar" className="hover:text-[#0ea5e9]">E-Kitaplar</Link>
        <span className="mx-2">/</span>
        <span>Paketler</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">{bundle.title}</span>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Sol — Kapak + fiyat kutusu */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              {bundle.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bundle.cover_image_url}
                  alt={bundle.title}
                  className="w-full aspect-[3/4] object-cover rounded-2xl border border-gray-200 shadow-lg"
                />
              ) : (
                <div className="w-full aspect-[3/4] rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 grid grid-cols-2 gap-2 p-4">
                  {bundle.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded overflow-hidden bg-white/70 aspect-[3/4] shadow-sm">
                      {item.cover_image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Fiyat kutusu */}
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {savingsPercent > 0 && (
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-emerald-500">
                      %{savingsPercent} İNDİRİM
                    </div>
                  )}
                  {bundle.discount_ends_at && <DiscountCountdown endsAt={bundle.discount_ends_at} />}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[36px] font-extrabold text-emerald-700 leading-none">
                    {formatTRY(price)}
                  </span>
                  {listPrice && listPrice > price && (
                    <span className="text-[16px] text-gray-400 line-through">
                      {formatTRY(listPrice)}
                    </span>
                  )}
                </div>
                {individualTotal > price && (
                  <div className="text-[12px] text-emerald-600 font-semibold mt-2">
                    Tek tek: {formatTRY(individualTotal)} · Kazancınız: {formatTRY(savings)}
                  </div>
                )}
                <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
                  Anında PDF indirme · Iyzico 3D Secure · Ömür boyu erişim
                </p>

                <div className="mt-4">
                  <BuyBundleButton
                    slug={bundle.slug}
                    title={bundle.title}
                    subtitle={bundle.subtitle}
                    coverImageUrl={bundle.cover_image_url}
                    price={price}
                    listPrice={listPrice}
                    itemCount={bundle.items.length}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sağ — Bilgi */}
          <div className="lg:col-span-3">
            <p className="text-[11px] font-bold tracking-[0.22em] text-emerald-600 uppercase mb-3">
              📦 {bundle.items.length} Kitaplık Paket
            </p>
            <h1 className="text-[36px] lg:text-[46px] font-extrabold text-[#1B365D] leading-[1.1] mb-3">
              {bundle.title}
            </h1>
            {bundle.subtitle && (
              <p className="text-[18px] text-gray-600 leading-relaxed mb-6">
                {bundle.subtitle}
              </p>
            )}

            {bundle.description && (
              <div className="prose prose-slate max-w-none mb-8">
                {bundle.description.split('\n').map((paragraph, i) =>
                  paragraph.trim() ? (
                    <p key={i} className="text-[15px] text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ) : null,
                )}
              </div>
            )}

            {/* İçerik listesi */}
            <div className="mt-8">
              <h2 className="text-[20px] font-bold text-[#1B365D] mb-4">
                Bu Pakette Bulunan Kitaplar
              </h2>
              <div className="space-y-3">
                {bundle.items.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/e-kitaplar/${item.slug}`}
                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition group"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    {item.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        className="w-14 h-20 object-cover rounded border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-20 bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] rounded border border-gray-200 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[15px] text-[#1B365D] group-hover:text-emerald-700 transition-colors">
                        {item.title}
                      </h3>
                      {item.subtitle && (
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                        {item.page_count && <span>📄 {item.page_count} sayfa</span>}
                        {item.reading_time_min && <span>⏱ {item.reading_time_min} dk</span>}
                        <span className="text-gray-400 line-through">
                          {formatTRY(item.price_try)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Alt bilgi */}
            <div className="mt-8 p-5 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-[13px] text-blue-900 leading-relaxed">
                💡 <strong>Bilgi:</strong> Bu paketi satın aldığınızda listedeki tüm {bundle.items.length} kitaba
                anında erişim sağlarsınız. Her kitabın PDF indirme linki e-posta adresinize gönderilir.
                Kupon kodunuz varsa ödeme aşamasında girebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
