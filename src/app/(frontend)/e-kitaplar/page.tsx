import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'E-Kitaplar — Sphere English Dijital Kitap Kataloğu | İş İngilizcesi PDF Kitaplar',
  description:
    'Sphere English dijital iş İngilizcesi kitap serisi. "İş İngilizcesinde Kullanılan 1000 Kelime" — kurumsal iletişim, toplantı, e-posta, sunum dili. PDF format, anında indirilebilir, Türkçe açıklamalı.',
  alternates: { canonical: 'https://www.sphereenglish.com/e-kitaplar' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Sphere English E-Kitap Kataloğu — İş İngilizcesi PDF Kitaplar',
    description:
      'Plaza dili, toplantı İngilizcesi, e-posta yazımı, sunum ifadeleri. 1000 Kelime serisi dijital kitaplar.',
    url: 'https://www.sphereenglish.com/e-kitaplar',
    siteName: 'Sphere English',
    type: 'website',
    locale: 'tr_TR',
  },
  keywords: [
    'iş ingilizcesi kitap',
    'business english pdf',
    'kurumsal ingilizce',
    'toplantı ingilizcesi',
    'e-posta ingilizcesi',
    'plaza dili',
    'sphere english kitap',
    'dijital ingilizce kitap',
    '1000 kelime',
    'iş ingilizcesi pdf indir',
  ],
};

// Cache'i kapat — admin değişikliği anında yansısın
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000';

interface Ebook {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  author: string;
  series_title: string | null;
  series_order: number | null;
  cover_image_url: string | null;
  page_count: number | null;
  reading_time_min: number | null;
  category: string | null;
  tags: string[] | null;
  price_try: string;
  list_price_try: string | null;
  is_featured: boolean;
  published_at: string;
}

async function getEbooks(): Promise<Ebook[]> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, '')}/api/ebooks`, {
      cache: 'no-store',
    });
    if (!r.ok) return [];
    const data = await r.json();
    return data.ebooks ?? [];
  } catch (err) {
    console.error('[e-kitaplar] fetch error:', err);
    return [];
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

export default async function EKitaplarPage() {
  const ebooks = await getEbooks();

  // SEO için JSON-LD CollectionPage + ItemList schema
  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Sphere English E-Kitap Kataloğu',
    description:
      'Dijital iş İngilizcesi kitap serisi. PDF format, anında indirilebilir.',
    url: 'https://www.sphereenglish.com/e-kitaplar',
    inLanguage: 'tr-TR',
    publisher: {
      '@type': 'Organization',
      name: 'Sphere English',
      url: 'https://www.sphereenglish.com',
    },
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: ebooks.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.sphereenglish.com/e-kitaplar/${b.slug}`,
      name: b.title,
    })),
  };

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            E-Kitap Kataloğu
          </p>
          <h1 className="text-[40px] lg:text-[54px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-5">
            İş İngilizcesi Dijital Kitap Serisi
          </h1>
          <p className="text-[17px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-[#1B365D]">İş İngilizcesinde Kullanılan 1000 Kelime</strong> serisi
            — plaza dilini akıcı konuşmak isteyenler için sektörlere ayrılmış, Türkçe açıklamalı,
            gerçek iş hayatından örneklerle dolu PDF kitaplar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-[12px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Anında indirme
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              PDF format
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Iyzico 3D Secure
            </span>
          </div>
        </div>
      </section>

      {/* Kitap listesi */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        {ebooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl">
            <p className="text-[16px] text-gray-500">Kitaplar yakında yayınlanacak.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((b) => (
              <Link
                key={b.id}
                href={`/e-kitaplar/${b.slug}`}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl hover:border-[#0ea5e9]/40 transition-all duration-300"
              >
                {/* Kapak */}
                <div className="relative aspect-[5/7] overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1B365D]">
                  {b.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.cover_image_url}
                      alt={`${b.title} kapak`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  {b.is_featured && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white bg-emerald-500 shadow-md">
                      ⭐ Yeni
                    </span>
                  )}
                </div>

                {/* Bilgi */}
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-[18px] font-bold text-[#1B365D] mb-1 group-hover:text-[#0ea5e9] transition-colors">
                    {b.title}
                  </h2>
                  {b.subtitle && (
                    <p className="text-[12px] text-gray-500 mb-3 line-clamp-1">{b.subtitle}</p>
                  )}
                  <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-3 mb-4">
                    {b.description}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mb-4">
                    {b.page_count && (
                      <span className="inline-flex items-center gap-1">📄 {b.page_count} sayfa</span>
                    )}
                    {b.reading_time_min && (
                      <span className="inline-flex items-center gap-1">
                        ⏱ {b.reading_time_min} dk
                      </span>
                    )}
                  </div>

                  {/* Fiyat + CTA */}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4 border-t border-gray-100">
                    <div>
                      {b.list_price_try && parseFloat(b.list_price_try) > parseFloat(b.price_try) && (
                        <span className="text-[11px] text-gray-400 line-through mr-1.5">
                          {formatTRY(b.list_price_try)}
                        </span>
                      )}
                      <span className="text-[20px] font-extrabold text-[#1B365D]">
                        {formatTRY(b.price_try)}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-[#0ea5e9] group-hover:translate-x-1 transition-transform">
                      İncele →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Seri tanıtım */}
        <div className="mt-16 p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#7dd3fc] uppercase mb-3">
              SERİ HAKKINDA
            </p>
            <h2 className="text-[28px] lg:text-[36px] font-extrabold tracking-[-0.02em] mb-4 leading-tight">
              1000 Kelime Serisi — Plaza Dilinin Sözlüğü
            </h2>
            <p className="text-[15px] text-white/75 leading-relaxed mb-6">
              Türk iş profesyonellerinin kurumsal hayatta en sık karşılaştığı 1000 İngilizce
              kelimeyi ve kalıbı 10 tematik kitaba böldük. Her kitap; toplantıdan e-postaya, sunumdan
              müzakereye gerçek iş senaryoları üzerinden Türkçe açıklamalarla kalıcı öğrenme
              sağlıyor. Sphere English AI Coach&apos;u ile birlikte kullanın, telaffuzunuzu da
              geliştirin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/fiyatlandirma"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-[13px] text-[#1B365D] bg-white hover:bg-gray-100 transition-colors"
              >
                Sphere Abonelik Planları
              </Link>
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-[13px] text-white border border-white/30 hover:bg-white/10 transition-colors"
              >
                Kurumsal Toplu Alım
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
