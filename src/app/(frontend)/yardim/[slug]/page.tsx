export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Markdown from '@/components/help/Markdown';
import { fetchHelpArticle } from '@/lib/help-center';
import HelpFeedback from './HelpFeedback';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchHelpArticle(slug);
  if (!data) return { title: 'Makale Bulunamadı' };
  const { article } = data;
  return {
    title: `${article.title} | Yardım Merkezi`,
    description: article.summary,
    alternates: { canonical: `https://www.sphereenglish.com/yardim/${slug}` },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `https://www.sphereenglish.com/yardim/${slug}`,
    },
  };
}

export default async function YardimMakalePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchHelpArticle(slug);
  if (!data) notFound();
  const { article, related } = data;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: article.title,
        acceptedAnswer: { '@type': 'Answer', text: article.summary },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <Header forceWhite />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <section className="pt-32 pb-10 px-6 bg-gradient-to-br from-[#082567] to-[#1a3a8f] text-white">
        <div className="max-w-3xl mx-auto">
          <nav className="text-[13px] text-blue-200 flex flex-wrap gap-1.5 mb-5">
            <Link href="/yardim" className="hover:text-white">
              Yardım Merkezi
            </Link>
            {article.categorySlug && (
              <>
                <span>/</span>
                <Link href={`/yardim?k=${article.categorySlug}`} className="hover:text-white">
                  {article.categoryTitle}
                </Link>
              </>
            )}
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{article.title}</h1>
          <p className="text-blue-100 mt-3 text-lg">{article.summary}</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Markdown source={article.bodyMd} className="text-gray-800" />
          <HelpFeedback
            slug={article.slug}
            initialYes={article.helpfulYes}
            initialNo={article.helpfulNo}
          />
          <p className="text-xs text-gray-400 mt-4">
            Son güncelleme:{' '}
            {new Date(article.updatedAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-12 px-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-[#082567] mb-4">İlgili makaleler</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/yardim/${r.slug}`}
                    className="block rounded-2xl bg-white border border-gray-100 p-4 hover:border-[#082567]/25 transition"
                  >
                    <div className="font-semibold text-[#082567] leading-snug">{r.title}</div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="py-14 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#082567] mb-3">
            Hâlâ takıldığınız bir yer mi var?
          </h3>
          <p className="text-gray-600 mb-6 text-[15px]">
            Uygulama içinden “Bize bildir” ya da iletişim formu — hafta içi aynı gün dönüyoruz.
          </p>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center bg-[#082567] hover:bg-[#0a2d7a] text-white px-8 py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all"
          >
            Bize Ulaşın
          </Link>
        </div>
      </section>
    </main>
  );
}
