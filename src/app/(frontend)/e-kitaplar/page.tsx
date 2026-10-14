import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AddToCartButton from '@/components/AddToCartButton';
import PreviewLinkButton from '@/components/PreviewLinkButton';
import WaitlistForm, { type InterestOption } from './WaitlistForm';

export const metadata: Metadata = {
  title: 'İş İngilizcesi PDF E-Kitapları: 1000 Kelime Serisi',
  description:
    'Toplantı, satış, liderlik, finans ve teknoloji için Türkçe açıklamalı iş İngilizcesi PDF e-kitapları. Tek kitap ₺199, 5 kitaplık set ₺799. Yeni seriler yolda.',
  alternates: { canonical: 'https://www.sphereenglish.com/e-kitaplar' },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  openGraph: {
    title: 'İş İngilizcesi PDF E-Kitapları | Sphere English',
    description: '250 kurumsal kalıp + 750 terim, 5 PDF kitap. Tek kitap ₺199, tam set ₺799. Yeni seriler yakında.',
    url: 'https://www.sphereenglish.com/e-kitaplar',
    siteName: 'Sphere English',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: { card: 'summary_large_image' },
  keywords: [
    'iş ingilizcesi kitap', 'business english pdf', 'kurumsal ingilizce', 'toplantı ingilizcesi',
    'e-posta ingilizcesi', 'plaza dili', 'sphere english kitap', 'dijital ingilizce kitap',
    '1000 kelime', 'iş ingilizcesi pdf indir',
  ],
};

// Admin değişikliği anında yansısın
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE = (process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000').replace(/\/$/, '');
const SITE = 'https://www.sphereenglish.com';

// ─── Types ────────────────────────────────────────────────────────────────

interface Ebook {
  id: number; slug: string; title: string; subtitle: string | null; description: string;
  author: string; series_title: string | null; series_order: number | null;
  cover_image_url: string | null; page_count: number | null; reading_time_min: number | null;
  category: string | null; tags: string[] | null; price_try: string; list_price_try: string | null;
  downloads_display_count: number | null; preview_pdf_url: string | null; is_featured: boolean;
  published_at: string;
}
interface Bundle {
  id: number; slug: string; title: string; subtitle: string | null; description: string | null;
  cover_image_url: string | null; price_try: string; list_price_try: string | null;
  is_featured: boolean; item_count: number;
  items_preview: Array<{ id: number; slug: string; title: string; cover_image_url: string | null }>;
}
interface Faq { id: number; question: string; answer: string }
interface Guide { id: number; roleLabel: string; description: string; ctaText: string | null; ctaHref: string | null; icon: string | null }

// ─── Data ─────────────────────────────────────────────────────────────────

async function getJson<T>(path: string, key: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!r.ok) return fallback;
    const data = await r.json();
    return (data?.[key] ?? fallback) as T;
  } catch (err) {
    console.error(`[e-kitaplar] fetch ${path} error:`, err);
    return fallback;
  }
}

const fmtTRY = (n: number | string) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(n));

/** Düz metindeki URL'leri tıklanabilir yap (FAQ cevapları için) */
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p)
      ? <a key={i} href={p} className="text-[#0ea5e9] font-semibold hover:underline break-all">{p.replace(/^https?:\/\/(www\.)?/, '')}</a>
      : <span key={i}>{p}</span>,
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function EKitaplarPage() {
  const [ebooks, bundles, faq, guide, interests] = await Promise.all([
    getJson<Ebook[]>('/api/ebooks', 'ebooks', []),
    getJson<Bundle[]>('/api/bundles', 'bundles', []),
    getJson<Faq[]>('/api/ebook-marketing/faq', 'faq', []),
    getJson<Guide[]>('/api/ebook-marketing/guide', 'guide', []),
    getJson<InterestOption[]>('/api/ebook-marketing/interests', 'interests', []),
  ]);

  const set = bundles.find((b) => b.is_featured) ?? bundles[0] ?? null;
  const setPrice = set ? Number(set.price_try) : null;
  const setList = set?.list_price_try ? Number(set.list_price_try) : null;
  const singleSum = ebooks.reduce((s, b) => s + Number(b.price_try), 0);
  const setSaving = set && singleSum > Number(set.price_try) ? singleSum - Number(set.price_try) : 0;
  const singlePrice = ebooks.length ? Math.min(...ebooks.map((b) => Number(b.price_try))) : null;
  const totalPages = ebooks.reduce((s, b) => s + (b.page_count ?? 0), 0);
  const kalip = ebooks.length * 50;
  const terim = ebooks.length * 150;
  const updated = ebooks.reduce((d, b) => (b.published_at > d ? b.published_at : d), '');

  // ─── JSON-LD ───
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}/e-kitaplar#page`,
        url: `${SITE}/e-kitaplar`,
        name: 'İş İngilizcesi PDF E-Kitapları',
        inLanguage: 'tr-TR',
        isPartOf: { '@type': 'WebSite', url: SITE, name: 'Sphere English' },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'E-Kitaplar', item: `${SITE}/e-kitaplar` },
          ],
        },
      },
      {
        '@type': 'ItemList',
        itemListElement: ebooks.map((b, i) => ({
          '@type': 'ListItem', position: i + 1, url: `${SITE}/e-kitaplar/${b.slug}`, name: b.title,
        })),
      },
      ...ebooks.map((b) => ({
        '@type': 'Product',
        name: b.title,
        url: `${SITE}/e-kitaplar/${b.slug}`,
        image: b.cover_image_url ?? undefined,
        description: b.description,
        brand: { '@type': 'Brand', name: 'Sphere English' },
        offers: {
          '@type': 'Offer', priceCurrency: 'TRY', price: Number(b.price_try),
          availability: 'https://schema.org/InStock', url: `${SITE}/e-kitaplar/${b.slug}`,
        },
      })),
      ...(set ? [{
        '@type': 'Product',
        name: set.title,
        url: `${SITE}/e-kitaplar/paketler/${set.slug}`,
        image: set.cover_image_url ?? undefined,
        description: set.subtitle ?? set.description ?? undefined,
        brand: { '@type': 'Brand', name: 'Sphere English' },
        offers: {
          '@type': 'Offer', priceCurrency: 'TRY', price: Number(set.price_try),
          availability: 'https://schema.org/InStock', url: `${SITE}/e-kitaplar/paketler/${set.slug}`,
        },
      }] : []),
      ...(faq.length ? [{
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question', name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }] : []),
    ],
  };

  return (
    <main className="bg-white min-h-screen text-[#334155]">
      <Header />
      {/* JSON.stringify + "<" kaçışı: admin içeriğinde </script> geçse bile script kapanmaz */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#f5f8fc] to-white pt-16 pb-10 lg:pt-20 lg:pb-14 border-b border-[#e6ebf2]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <nav aria-label="Sayfa yolu" className="text-[12px] text-gray-500 mb-6">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-[#0ea5e9]">Ana Sayfa</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-[#1B365D] font-semibold">E-Kitaplar</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-start">
            <div>
              <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">E-Kitap Kütüphanesi</span>
              <h1 className="mt-3 text-[36px] lg:text-[52px] font-extrabold tracking-[-0.02em] text-[#1B365D] leading-[1.1] [text-wrap:balance]">
                İş İngilizcesi <span className="text-[#0ea5e9] whitespace-nowrap">e‑kitapları</span>: toplantıdan finansa
              </h1>
              <p className="mt-5 text-[16px] lg:text-[17px] text-gray-600 leading-relaxed max-w-2xl">
                Türk profesyoneller için Türkçe açıklamalı, gerçek iş senaryolu PDF kitaplar.
                Şu an {ebooks.length} kitap ve tam set mevcut; farklı sektör ve konularda yeni kitaplar yolda.
                Ödemeden hemen sonra e-postanızda.
              </p>

              <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
                {[
                  [String(ebooks.length), 'kitap'],
                  [kalip.toLocaleString('tr-TR'), 'kalıp'],
                  [totalPages.toLocaleString('tr-TR'), 'sayfa'],
                  ['30+', 'yeni kitap yolda'],
                ].map(([n, l]) => (
                  <div key={l} className="rounded-xl bg-white border border-[#e6ebf2] px-4 py-3">
                    <b className="block text-[22px] font-extrabold text-[#1B365D] leading-none tabular-nums">{n}</b>
                    <small className="text-[11px] text-gray-500 font-semibold">{l}</small>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] text-gray-500 font-semibold">
                <span>Sık arananlar:</span>
                {['toplantı', 'e-posta', 'satış', 'liderlik', 'finans', 'yazılım'].map((w) => (
                  <a key={w} href="#katalog" className="px-3 py-1.5 rounded-full bg-white border border-[#e6ebf2] text-[#1B365D] hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors">{w}</a>
                ))}
              </div>
            </div>

            {/* Tiers aside */}
            {set && (
              <aside className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white p-7 shadow-xl" aria-labelledby="tiersH">
                <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#7dd3fc]">En avantajlı seçenek</span>
                <h2 id="tiersH" className="mt-2 text-[24px] font-extrabold leading-tight text-white">
                  {set.item_count} kitaplık tam set {fmtTRY(set.price_try)}
                </h2>
                <p className="mt-2 text-[14px] text-white/75 leading-relaxed">
                  {set.subtitle ?? 'Toplantı, satış, liderlik, finans ve teknoloji kitaplarının hepsi.'}
                  {setSaving > 0 && <> Tek tek almaya göre <b className="text-white">{fmtTRY(setSaving)}</b> daha az.</>}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[[kalip, 'kalıp'], [terim, 'terim'], [totalPages, 'sayfa']].map(([n, l]) => (
                    <div key={String(l)} className="rounded-xl bg-white/10 px-3 py-2.5 text-center">
                      <b className="block text-[20px] font-extrabold leading-none tabular-nums">{Number(n).toLocaleString('tr-TR')}</b>
                      <small className="text-[11px] text-white/70">{l}</small>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <AddToCartButton
                    type="bundle" slug={set.slug} title={set.title} subtitle={set.subtitle}
                    coverImageUrl={set.cover_image_url} price={Number(set.price_try)} listPrice={setList}
                    itemCount={set.item_count} variant="full"
                  />
                  {setList && setList > Number(set.price_try) && (
                    <p className="mt-2 text-center text-[12px] text-white/60">
                      Liste fiyatı <s>{fmtTRY(setList)}</s>
                    </p>
                  )}
                </div>
                <Link href={`/e-kitaplar/paketler/${set.slug}`} className="mt-3 block text-center text-[12px] text-[#7dd3fc] hover:underline">
                  Setin detayını gör →
                </Link>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* ─── KISACA ───────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <section aria-labelledby="kisaca" className="mt-8 rounded-2xl bg-[#e6f5fd] border border-[#bae6fd] p-5 lg:p-6 flex gap-4">
          <div aria-hidden="true" className="w-8 h-8 rounded-full bg-[#0ea5e9] text-white grid place-items-center font-extrabold flex-shrink-0">i</div>
          <div className="text-[14px] leading-relaxed">
            <h2 id="kisaca" className="text-[15px] font-extrabold text-[#1B365D] mb-1">Kısaca</h2>
            <p>
              Sphere English e-kitap kütüphanesi, Türk profesyoneller için hazırlanmış iş İngilizcesi PDF kitaplarından oluşur.
              Şu an <strong className="text-[#1B365D]">İş İngilizcesinde Kullanılan 1000 Kelime</strong> serisinin {ebooks.length} kitabı satıştadır.
              Her kitapta 50 kurumsal kalıp ve 150 terim vardır.
              {singlePrice !== null && <> Tek kitap {fmtTRY(singlePrice)}{setPrice !== null && <>, {set!.item_count} kitaplık set {fmtTRY(setPrice)}</>}&apos;dur.</>}
              {' '}Yazar Didem İmamoğlu, yayıncı Sphere English. Farklı sektörler ve beceriler için yeni kitaplar hazırlanmaktadır.
            </p>
            {updated && (
              <time dateTime={updated.slice(0, 10)} className="block mt-2 text-[12px] text-gray-500">
                Son güncelleme: {new Date(updated).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            )}
          </div>
        </section>
      </div>

      {/* ─── SERİLER ──────────────────────────────────────────────────── */}
      <section id="paketler" className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 scroll-mt-24" aria-labelledby="serH">
        <div className="mb-6">
          <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">Seriler ve paketler</span>
          <h2 id="serH" className="mt-1 text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] leading-tight">Seriler</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {set ? (
            <article className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white p-6 flex flex-col gap-4 md:col-span-1 relative overflow-hidden">
              <span className="self-start px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white">En çok tercih edilen</span>
              {set.cover_image_url ? (
                <div className="relative w-full aspect-[4/3] rounded-xl border border-white/10 overflow-hidden">
                  <Image src={set.cover_image_url} alt={set.title} fill
                    sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {set.items_preview.slice(0, 5).map((it) => (
                    <div key={it.id} className="relative aspect-[3/4] rounded-md overflow-hidden bg-white/10">
                      {it.cover_image_url && (
                        <Image src={it.cover_image_url} alt={it.title} fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <h3 className="text-[18px] font-extrabold leading-snug text-white">
                <Link href={`/e-kitaplar/paketler/${set.slug}`} className="hover:text-[#7dd3fc]">{set.title}</Link>
              </h3>
              <p className="text-[13px] text-white/75 -mt-2">{set.subtitle ?? `${kalip} kurumsal kalıp + ${terim} terim.`}</p>
              <div className="mt-auto flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[24px] font-extrabold tabular-nums">
                  {fmtTRY(set.price_try)}
                  {setList && setList > Number(set.price_try) && <s className="ml-2 text-[14px] font-semibold text-white/50">{fmtTRY(setList)}</s>}
                </span>
                <AddToCartButton type="bundle" slug={set.slug} title={set.title} subtitle={set.subtitle}
                  coverImageUrl={set.cover_image_url} price={Number(set.price_try)} listPrice={setList} itemCount={set.item_count} />
              </div>
            </article>
          ) : null}

          {[
            ['Sektörel İngilizce', 'Havacılıktan sağlığa, turizmden lojistiğe: her sektörün günlük iş dili, terimleri ve senaryoları.'],
            ['Beceri Kitapları', 'Sektörden bağımsız: e-posta, toplantı, sunum, müzakere, mülakat ve rapor yazımı.'],
          ].map(([t, d]) => (
            <article key={t} className="rounded-2xl bg-[#f5f8fc] border border-dashed border-[#cbd5e1] p-6 flex flex-col gap-3">
              <span className="self-start px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#e6f5fd] text-[#0369a1]">Yakında</span>
              <h3 className="text-[18px] font-extrabold text-[#1B365D] leading-snug">{t}</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">{d}</p>
              <a href="#haberdar-ol" className="mt-auto text-[13px] font-bold text-[#0ea5e9] hover:underline">Çıkınca haber ver →</a>
            </article>
          ))}
        </div>
      </section>

      {/* ─── HABERDAR OL ──────────────────────────────────────────────── */}
      <section id="haberdar-ol" className="max-w-6xl mx-auto px-6 lg:px-10 pt-12 scroll-mt-24" aria-labelledby="soonH">
        <div className="rounded-3xl bg-[#f5f8fc] border border-[#e6ebf2] p-6 lg:p-10 grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div>
            <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">Katalog büyüyor</span>
            <h2 id="soonH" className="mt-1 text-[26px] lg:text-[32px] font-extrabold text-[#1B365D] leading-tight">Yeni sektörler ve konular yolda</h2>
            <p className="mt-3 text-[14px] text-gray-600 leading-relaxed max-w-xl">
              Kütüphaneye farklı sektör ve konularda 30–40 yeni kitap ekleniyor: sektörlere özel İngilizce kitapları ve
              e-posta, sunum, müzakere, mülakat gibi beceri kitapları. Yeni kitaplar yayına girdikçe bu sayfaya eklenecek.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Havacılık', 'Turizm & Otelcilik', 'Sağlık & Medikal', 'Hukuk', 'Lojistik & Dış Ticaret', 'Enerji & Mühendislik', 'Gıda & Tarım İhracatı', 'E-posta', 'Sunum', 'Müzakere', 'Mülakat'].map((c) => (
                <span key={c} className="px-3 py-1 rounded-full bg-white border border-[#e6ebf2] text-[12px] font-semibold text-gray-600">{c}</span>
              ))}
            </div>
          </div>
          <WaitlistForm interests={interests} />
        </div>
      </section>

      {/* ─── KATALOG ──────────────────────────────────────────────────── */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 pb-14 scroll-mt-24" aria-labelledby="catH">
        <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
          <div>
            <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">Mağaza</span>
            <h2 id="catH" className="mt-1 text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] leading-tight">Mevcut kitaplar</h2>
          </div>
          <span className="text-[13px] text-gray-500 font-semibold" aria-live="polite">{ebooks.length} kitap</span>
        </div>

        {ebooks.length === 0 ? (
          <div className="text-center py-20 bg-[#f5f8fc] rounded-3xl">
            <p className="text-[16px] text-gray-500">Kitaplar yakında yayınlanacak.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((b) => {
              const price = Number(b.price_try);
              const list = b.list_price_try ? Number(b.list_price_try) : null;
              const off = list && list > price ? Math.round(((list - price) / list) * 100) : 0;
              return (
                <article key={b.id} className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-[#e6ebf2] hover:shadow-xl hover:border-[#0ea5e9]/40 transition-all duration-300">
                  <Link href={`/e-kitaplar/${b.slug}`} className="relative block aspect-[5/7] overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#1B365D]">
                    {b.cover_image_url && (
                      <Image src={b.cover_image_url} alt={`${b.title} kapak`} fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {(b.downloads_display_count ?? 0) >= 300 ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-[#b45309] shadow">Çok satan</span>
                      ) : b.is_featured ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white bg-emerald-500 shadow">Yeni</span>
                      ) : null}
                      {off > 0 && <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white bg-[#0ea5e9] shadow">%{off}</span>}
                    </div>
                  </Link>

                  <div className="flex flex-col flex-1 p-5">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0ea5e9]">
                      {b.category ?? 'İş İngilizcesi'}{b.series_title ? ` · ${b.series_title}` : ''}{b.series_order ? ` ${String(b.series_order).padStart(2, '0')}` : ''}
                    </span>
                    <h3 className="mt-1.5 text-[17px] font-extrabold text-[#1B365D] leading-snug">
                      <Link href={`/e-kitaplar/${b.slug}`} className="group-hover:text-[#0ea5e9] transition-colors">{b.title}</Link>
                    </h3>
                    {b.subtitle && <p className="text-[12px] text-gray-500 mt-1 line-clamp-1">{b.subtitle}</p>}
                    <p className="mt-2 text-[13px] text-gray-600 leading-relaxed line-clamp-3">{b.description}</p>

                    <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 font-semibold">
                      {b.page_count ? <span>{b.page_count} sayfa</span> : null}
                      {b.reading_time_min ? <span>~{b.reading_time_min} dk</span> : null}
                      {(b.tags ?? []).slice(0, 2).map((t) => <span key={t} className="px-1.5 rounded bg-[#f5f8fc] border border-[#e6ebf2]">{t}</span>)}
                    </div>
                    {(b.downloads_display_count ?? 0) > 0 && (
                      <span className="mt-2 text-[11px] font-bold text-emerald-600">● {b.downloads_display_count!.toLocaleString('tr-TR')}+ kez indirildi</span>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-[#f1f5f9] mt-4">
                      <div className="leading-none">
                        <b className="text-[20px] font-extrabold text-[#1B365D] tabular-nums">{fmtTRY(price)}</b>
                        {list && list > price && <s className="ml-1.5 text-[12px] text-gray-400 tabular-nums">{fmtTRY(list)}</s>}
                      </div>
                      <AddToCartButton type="ebook" slug={b.slug} title={b.title} subtitle={b.subtitle}
                        coverImageUrl={b.cover_image_url} price={price} listPrice={list} />
                    </div>
                    {b.preview_pdf_url && (
                      <div className="mt-2.5 text-center">
                        <PreviewLinkButton url={b.preview_pdf_url} ebookSlug={b.slug} ebookName={b.title} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── REHBER ───────────────────────────────────────────────────── */}
      {guide.length > 0 && (
        <section className="bg-[#f5f8fc] border-y border-[#e6ebf2] py-14" aria-labelledby="guideH">
          <div className="max-w-6xl mx-auto px-6 lg:px-10">
            <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
              <div>
                <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">Rehber</span>
                <h2 id="guideH" className="mt-1 text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] leading-tight">Nereden başlamalıyım?</h2>
              </div>
              <p className="text-[14px] text-gray-500 max-w-md">Rolünüze göre en kısa yol. Yeni kitaplar eklendikçe bu rehber de genişleyecek.</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#e6ebf2] overflow-hidden divide-y divide-[#f1f5f9]">
              {guide.map((g) => (
                <div key={g.id} className="grid md:grid-cols-[2.2rem_1fr_1.6fr_auto] gap-3 md:gap-5 items-center px-5 py-4">
                  <span className="text-[22px] leading-none" aria-hidden="true">{g.icon ?? '•'}</span>
                  <b className="text-[15px] text-[#1B365D] leading-snug">{g.roleLabel}</b>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{g.description}</p>
                  {g.ctaText && g.ctaHref ? (
                    <a href={g.ctaHref} className="text-[13px] font-bold text-[#0ea5e9] hover:underline whitespace-nowrap md:text-right">{g.ctaText} →</a>
                  ) : <span />}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── KURUMSAL ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-14" aria-label="Kurumsal">
        <div className="rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white p-8 lg:p-12 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
          <div>
            <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#7dd3fc]">Kurumsal kütüphane</span>
            <h2 className="mt-2 text-[28px] lg:text-[36px] font-extrabold leading-tight text-white">Bütün katalog, bütün ekibiniz için</h2>
            <p className="mt-3 text-[15px] text-white/75">Şirketinizin ihtiyacına göre kitap seçkisi ve toplu lisans.</p>
            <ul className="mt-4 space-y-1.5 text-[14px] text-white/85">
              {['10+ lisansta özel fiyat ve tek fatura', 'Yeni seri kitapları çıktıkça lisansınıza eklenebilir', 'Canlı grup eğitimiyle birlikte kullanım'].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-emerald-400">✓</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/iletisim" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors">Kurumsal teklif al</Link>
            <Link href="/abonelik" className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-bold text-[14px] text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors">Abonelik seçeneklerini gör</Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      {faq.length > 0 && (
        <section className="bg-[#f5f8fc] border-t border-[#e6ebf2] py-14" aria-labelledby="faqH">
          <div className="max-w-3xl mx-auto px-6 lg:px-10">
            <div className="mb-6">
              <span className="text-[12px] font-extrabold tracking-[0.2em] uppercase text-[#0ea5e9]">Sıkça sorulan sorular</span>
              <h2 id="faqH" className="mt-1 text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] leading-tight">Satın almadan önce merak edilenler</h2>
            </div>
            <div className="space-y-2">
              {faq.map((f) => (
                <details key={f.id} className="group rounded-xl bg-white border border-[#e6ebf2] open:border-[#0ea5e9]/40 open:shadow-sm">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-5 py-4 text-[15px] font-bold text-[#1B365D] [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <span aria-hidden="true" className="text-[#0ea5e9] text-[20px] leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-[14px] text-gray-600 leading-relaxed whitespace-pre-line">{linkify(f.answer)}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
