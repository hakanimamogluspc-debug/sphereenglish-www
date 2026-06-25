import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EbookGallery from './EbookGallery';
import BuyEbookButton from './BuyEbookButton';

// Cache'i tamamen kapat — admin değişikliği anında yansısın
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000';

interface Ebook {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  long_description: string | null;
  table_of_contents: string | null;
  author: string;
  publisher: string;
  isbn: string | null;
  language: string;
  content_language: string | null;
  series_title: string | null;
  series_slug: string | null;
  series_order: number | null;
  cover_image_url: string | null;
  gallery_urls: string[] | null;
  preview_pdf_url: string | null;
  page_count: number | null;
  reading_time_min: number | null;
  category: string | null;
  tags: string[] | null;
  price_try: string;
  list_price_try: string | null;
  currency: string;
  is_featured: boolean;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
}

interface RelatedEbook {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  series_order: number | null;
  cover_image_url: string | null;
  price_try: string;
}

interface FetchResult {
  ebook: Ebook;
  related: RelatedEbook[];
}

async function getEbook(slug: string): Promise<FetchResult | null> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, '')}/api/ebooks/${slug}`, {
      cache: 'no-store',
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const result = await getEbook(params.slug);
  if (!result) return { title: 'Kitap Bulunamadı | Sphere English' };
  const { ebook } = result;
  const title = ebook.seo_title || `${ebook.title} | Sphere English E-Kitap`;
  const description = ebook.seo_description || ebook.description.slice(0, 280);
  const url = `https://www.sphereenglish.com/e-kitaplar/${ebook.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: ebook.seo_keywords ? ebook.seo_keywords.split(',').map((k) => k.trim()) : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Sphere English',
      type: 'book',
      locale: 'tr_TR',
      images: ebook.cover_image_url
        ? [
            {
              url: `https://www.sphereenglish.com${ebook.cover_image_url}`,
              width: 600,
              height: 850,
              alt: `${ebook.title} kapak`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export default async function EbookDetailPage({ params }: { params: { slug: string } }) {
  const result = await getEbook(params.slug);
  if (!result) return notFound();
  const { ebook, related } = result;

  // Tüm görseller (SEO/Schema için)
  const allImages: string[] = [];
  if (ebook.cover_image_url) allImages.push(`https://www.sphereenglish.com${ebook.cover_image_url}`);
  for (const g of ebook.gallery_urls ?? []) {
    const full = `https://www.sphereenglish.com${g}`;
    if (!allImages.includes(full)) allImages.push(full);
  }

  // ── JSON-LD: Book + Product schema (e-ticaret + kitap için en güçlü combo) ──
  const bookLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `https://www.sphereenglish.com/e-kitaplar/${ebook.slug}#book`,
    name: ebook.title,
    alternateName: ebook.subtitle ?? undefined,
    bookFormat: 'EBook',
    inLanguage: ebook.content_language || ebook.language || 'tr',
    numberOfPages: ebook.page_count,
    isbn: ebook.isbn ?? undefined,
    author: { '@type': 'Person', name: ebook.author },
    publisher: { '@type': 'Organization', name: ebook.publisher },
    datePublished: ebook.published_at,
    description: ebook.description,
    image: allImages.length > 0 ? allImages : undefined,
    url: `https://www.sphereenglish.com/e-kitaplar/${ebook.slug}`,
  };

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ebook.title,
    description: ebook.description,
    image: allImages.length > 0 ? allImages : undefined,
    brand: { '@type': 'Brand', name: ebook.publisher },
    category: ebook.category ?? 'İş İngilizcesi',
    offers: {
      '@type': 'Offer',
      price: ebook.price_try,
      priceCurrency: ebook.currency || 'TRY',
      availability: 'https://schema.org/InStock',
      url: `https://www.sphereenglish.com/e-kitaplar/${ebook.slug}`,
      seller: { '@type': 'Organization', name: 'Sphere English' },
      itemCondition: 'https://schema.org/NewCondition',
      ...(ebook.list_price_try && parseFloat(ebook.list_price_try) > parseFloat(ebook.price_try)
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: ebook.price_try,
              priceCurrency: ebook.currency || 'TRY',
              referencePrice: {
                '@type': 'PriceSpecification',
                price: ebook.list_price_try,
                priceCurrency: ebook.currency || 'TRY',
              },
            },
          }
        : {}),
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Anasayfa',
        item: 'https://www.sphereenglish.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'E-Kitaplar',
        item: 'https://www.sphereenglish.com/e-kitaplar',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: ebook.title,
        item: `https://www.sphereenglish.com/e-kitaplar/${ebook.slug}`,
      },
    ],
  };

  const hasDiscount =
    ebook.list_price_try && parseFloat(ebook.list_price_try) > parseFloat(ebook.price_try);
  const discountPct = hasDiscount
    ? Math.round(
        (1 - parseFloat(ebook.price_try) / parseFloat(ebook.list_price_try!)) * 100,
      )
    : 0;

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-6 lg:px-10 pt-20 pb-2 text-[12px] text-gray-500" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-[#0ea5e9]">Anasayfa</Link></li>
          <li>›</li>
          <li><Link href="/e-kitaplar" className="hover:text-[#0ea5e9]">E-Kitaplar</Link></li>
          <li>›</li>
          <li className="text-[#1B365D] font-semibold truncate">{ebook.title}</li>
        </ol>
      </nav>

      {/* Üst bölüm: kapak + bilgi */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-10 lg:gap-14">
          {/* Ürün galerisi: ana görsel + alt thumbnail'lar */}
          <div>
            <div className="sticky top-28 space-y-4">
              <EbookGallery
                cover={ebook.cover_image_url}
                gallery={ebook.gallery_urls ?? []}
                title={ebook.title}
                author={ebook.author}
                publisher={ebook.publisher}
              />
              {ebook.preview_pdf_url && (
                <a
                  href={ebook.preview_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-4 py-3 rounded-xl text-[13px] font-bold text-[#0ea5e9] border-2 border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/5 transition-colors"
                >
                  📖 Ücretsiz Önizleme (5 sayfa)
                </a>
              )}
            </div>
          </div>

          {/* Bilgi paneli */}
          <div>
            <h1 className="text-[36px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.1] mb-3">
              {ebook.title}
            </h1>
            {ebook.subtitle && (
              <p className="text-[16px] text-gray-600 mb-5">{ebook.subtitle}</p>
            )}

            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-7">
              <span>Yazar: <strong className="text-[#1B365D]">{ebook.author}</strong></span>
              <span className="text-gray-300">·</span>
              <span>{ebook.publisher}</span>
              <span className="text-gray-300">·</span>
              <span>{new Date(ebook.published_at).getFullYear()}</span>
            </div>

            {/* Açıklama */}
            <p className="text-[16px] text-gray-700 leading-relaxed mb-7">
              {ebook.long_description || ebook.description}
            </p>

            {/* Meta rozetleri */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {ebook.page_count && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#1B365D] bg-[#f0f7ff]">
                  📄 {ebook.page_count} sayfa
                </span>
              )}
              {ebook.reading_time_min && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#1B365D] bg-[#f0f7ff]">
                  ⏱ ~{ebook.reading_time_min} dk okuma
                </span>
              )}
              {ebook.content_language && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-[#1B365D] bg-[#f0f7ff]">
                  🌐 {ebook.content_language}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold text-emerald-700 bg-emerald-50">
                ⚡ Anında indirme · PDF
              </span>
            </div>

            {/* Etiketler */}
            {ebook.tags && ebook.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {ebook.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-600 bg-gray-100"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Fiyat + CTA kartı */}
            <div className="rounded-2xl border-2 border-[#0ea5e9]/30 bg-gradient-to-br from-[#f0f7ff] to-white p-6 mb-8">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] text-gray-400 line-through">
                        {formatTRY(ebook.list_price_try!)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                        %{discountPct} indirim
                      </span>
                    </div>
                  )}
                  <div className="text-[36px] font-extrabold text-[#1B365D] leading-none">
                    {formatTRY(ebook.price_try)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">KDV dahil · Tek seferlik ödeme</div>
                </div>
              </div>

              <BuyEbookButton slug={ebook.slug} title={ebook.title} price={ebook.price_try} />
              <p className="text-center text-[11px] text-gray-500 mt-3">
                🔒 Iyzico 3D Secure · Kart bilgileri bize ulaşmaz
              </p>
            </div>

            {/* Kurumsal toplu alım uyarısı */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-[13px] text-gray-700">
              <strong className="text-[#1B365D]">Kurumsal toplu alım mı?</strong>{' '}
              10+ lisans için <Link href="/iletisim" className="text-[#0ea5e9] underline font-semibold">iletişime geç</Link>,
              özel indirimli kurumsal fiyat sunalım.
            </div>
          </div>
        </div>
      </section>

      {/* İçindekiler */}
      {ebook.table_of_contents && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-4xl mx-auto px-6 lg:px-10">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
              KİTAPTA NELER VAR
            </p>
            <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#1B365D] mb-6">
              İçindekiler
            </h2>
            <div className="bg-white rounded-2xl p-8 prose prose-slate max-w-none text-[15px] leading-relaxed whitespace-pre-wrap text-gray-700">
              {ebook.table_of_contents}
            </div>
          </div>
        </section>
      )}

      {/* Aynı seriden */}
      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 lg:px-10 py-14">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            AYNI SERİDEN
          </p>
          <h2 className="text-[28px] font-extrabold text-[#1B365D] mb-8">Diğer Kitaplar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/e-kitaplar/${r.slug}`}
                className="group rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="aspect-[5/7] bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] relative overflow-hidden">
                  {r.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.cover_image_url}
                      alt={`${r.title} kapak`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-[13px] font-bold text-[#1B365D] line-clamp-2 mb-1 group-hover:text-[#0ea5e9]">
                    {r.title}
                  </h3>
                  <p className="text-[12px] text-[#1B365D] font-bold">{formatTRY(r.price_try)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
