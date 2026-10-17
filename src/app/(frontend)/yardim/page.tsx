export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { fetchHelpArticles, fetchHelpCategories } from '@/lib/help-center';
import HelpSearch from './HelpSearch';

export const metadata: Metadata = {
  title: 'Yardım Merkezi | Sphere English',
  description:
    'Hesap, seviye testi, canlı dersler, AI koçlar, e-kitaplar, fatura ve kurumsal panel hakkında kısa ve net cevaplar.',
  alternates: { canonical: 'https://www.sphereenglish.com/yardim' },
  openGraph: {
    title: 'Yardım Merkezi | Sphere English',
    description: 'Sphere English kullanımıyla ilgili sık sorulan sorular ve adım adım rehberler.',
    url: 'https://www.sphereenglish.com/yardim',
  },
};

interface PageProps {
  searchParams: Promise<{ k?: string; q?: string }>;
}

export default async function YardimPage({ searchParams }: PageProps) {
  const { k = '', q = '' } = await searchParams;
  const [categories, articles] = await Promise.all([
    fetchHelpCategories(),
    fetchHelpArticles({ category: k || undefined, q: q || undefined }),
  ]);
  const filtered = Boolean(k || q);
  const activeCat = categories.find((c) => c.slug === k);

  const grouped = new Map<string, typeof articles>();
  if (!filtered) {
    for (const a of articles) {
      const key = a.categorySlug ?? 'diger';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(a);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header forceWhite />
      <main>
        <section className="pt-32 pb-14 px-4 sm:px-6 bg-gradient-to-br from-[#082567] to-[#1a3a8f] text-white text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-blue-200 uppercase mb-4">
            Yardım Merkezi
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5">
            Size nasıl yardımcı olabiliriz?
          </h1>
          <HelpSearch initialQuery={q} />
        </section>

        <section className="py-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-2 flex-wrap mb-8">
              <Link
                href="/yardim"
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border ${!k ? 'bg-[#082567] text-white border-[#082567]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
              >
                Tümü
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/yardim?k=${c.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border ${k === c.slug ? 'bg-[#082567] text-white border-[#082567]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
                >
                  {c.title} <span className="opacity-60 text-xs">{c.articleCount}</span>
                </Link>
              ))}
            </div>

            {filtered ? (
              <>
                <h2 className="text-xl font-bold text-[#082567] mb-4">
                  {q ? `“${q}” için ${articles.length} sonuç` : activeCat?.title}
                </h2>
                {articles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
                    Bu konuda henüz makale yok. Farklı bir kelimeyle arayın ya da{' '}
                    <Link href="/iletisim" className="text-[#0e7da6] font-semibold underline">
                      bize yazın
                    </Link>
                    .
                  </div>
                ) : (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {articles.map((a) => (
                      <ArticleCard key={a.id} slug={a.slug} title={a.title} summary={a.summary} />
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="space-y-12">
                {categories
                  .filter((c) => grouped.has(c.slug))
                  .map((c) => (
                    <div key={c.slug}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#082567]">{c.title}</h2>
                        <Link
                          href={`/yardim?k=${c.slug}`}
                          className="text-sm font-semibold text-[#0e7da6] hover:underline"
                        >
                          Tümü →
                        </Link>
                      </div>
                      {c.description && (
                        <p className="text-sm text-gray-500 -mt-2 mb-4">{c.description}</p>
                      )}
                      <ul className="grid gap-4 sm:grid-cols-2">
                        {grouped
                          .get(c.slug)!
                          .slice(0, 4)
                          .map((a) => (
                            <ArticleCard
                              key={a.id}
                              slug={a.slug}
                              title={a.title}
                              summary={a.summary}
                            />
                          ))}
                      </ul>
                    </div>
                  ))}
                {articles.length === 0 && (
                  <p className="text-center text-gray-500">
                    Yardım makaleleri yakında burada olacak.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-[#082567] mb-4">Cevabı bulamadınız mı?</h3>
            <p className="text-gray-600 mb-8 text-[15px]">
              Hafta içi genellikle aynı gün yanıtlıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/iletisim"
                className="inline-flex items-center justify-center bg-[#082567] hover:bg-[#0a2d7a] text-white px-8 py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all"
              >
                İletişim Formu
              </Link>
              <a
                href="https://wa.me/905066085810"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white border border-gray-200 text-[#082567] px-8 py-4 rounded-2xl text-[15px] font-semibold tracking-wide transition-all hover:border-[#082567]/30"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ArticleCard({ slug, title, summary }: { slug: string; title: string; summary: string }) {
  return (
    <li>
      <Link
        href={`/yardim/${slug}`}
        className="block h-full rounded-2xl border border-gray-100 bg-white p-5 hover:border-[#082567]/25 hover:shadow-md transition-all"
      >
        <div className="font-semibold text-[#082567] leading-snug">{title}</div>
        <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{summary}</p>
      </Link>
    </li>
  );
}
