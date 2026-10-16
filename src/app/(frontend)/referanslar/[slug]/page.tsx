export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import { fetchCaseStudyBySlug } from '@/payload/api';

interface PageProps {
  params: Promise<{ slug: string }>;
}

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cs = await fetchCaseStudyBySlug(slug);
  if (!cs) return { title: 'Sayfa Bulunamadı' };
  const title = cs.seoTitle || cs.title;
  return {
    title,
    description: cs.summary,
    alternates: {
      canonical: `https://www.sphereenglish.com/referanslar/${slug}`,
    },
    openGraph: {
      title,
      description: cs.summary,
      url: `https://www.sphereenglish.com/referanslar/${slug}`,
    },
  };
}

function LevelBars({
  title,
  levels,
  accent,
}: {
  title: string;
  levels: { level: string; count: number }[];
  accent: string;
}) {
  const total = levels.reduce((s, l) => s + (l.count || 0), 0) || 1;
  const sorted = [...levels].sort(
    (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level)
  );
  return (
    <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6">
      <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-gray-500 mb-4">
        {title}
      </div>
      <div className="flex flex-col gap-3">
        {LEVEL_ORDER.map((lvl) => {
          const row = sorted.find((l) => l.level === lvl);
          const count = row?.count || 0;
          const pct = Math.round((count / total) * 100);
          return (
            <div key={lvl} className="flex items-center gap-3">
              <span
                className={`w-8 text-[13px] font-bold ${count ? 'text-[#082567]' : 'text-gray-300'}`}
              >
                {lvl}
              </span>
              <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: count ? accent : 'transparent',
                  }}
                />
              </div>
              <span
                className={`w-14 text-right text-[13px] ${count ? 'text-gray-700 font-semibold' : 'text-gray-300'}`}
              >
                {count ? `${count} kişi` : '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function ReferansDetayPage({ params }: PageProps) {
  const { slug } = await params;
  const cs = await fetchCaseStudyBySlug(slug);
  if (!cs) notFound();

  const name = cs.anonymous ? cs.displayName : cs.companyName || cs.displayName;
  const logo = !cs.anonymous && cs.logo && typeof cs.logo === 'object' ? (cs.logo as any) : null;
  const modules: string[] = (cs.modules || []).map((m: any) => m.item).filter(Boolean);
  const metrics: { value: string; label: string }[] = cs.metrics || [];
  const levelsBefore = (cs.levelsBefore || []) as {
    level: string;
    count: number;
  }[];
  const levelsAfter = (cs.levelsAfter || []) as {
    level: string;
    count: number;
  }[];
  const quoteText = cs.quote?.text?.trim();
  const quoteAuthor = cs.anonymous
    ? cs.quote?.authorTitle
    : [cs.quote?.authorName, cs.quote?.authorTitle].filter(Boolean).join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: cs.title,
    description: cs.summary,
    datePublished: cs.createdAt,
    dateModified: cs.updatedAt,
    author: { '@type': 'Organization', name: 'Sphere English' },
    publisher: {
      '@type': 'Organization',
      name: 'Sphere English',
      url: 'https://www.sphereenglish.com',
    },
    mainEntityOfPage: `https://www.sphereenglish.com/referanslar/${slug}`,
  };

  return (
    <main className="min-h-screen bg-white">
      <Header forceWhite />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#082567] to-[#1a3a8f] text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/referanslar"
            className="text-[12px] font-semibold text-blue-200 hover:text-white transition-colors"
          >
            ← Tüm referanslar
          </Link>
          <p className="text-[11px] font-bold tracking-[0.22em] text-blue-200 uppercase mt-6 mb-3">
            Vaka çalışması · {cs.industry}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-5">{cs.title}</h1>
          <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">{cs.summary}</p>

          <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-blue-200 mb-1">Şirket</dt>
              <dd className="font-semibold flex items-center gap-2">
                {logo?.url && <img src={logo.url} alt={name} className="h-6 w-auto rounded" />}
                {name}
              </dd>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-blue-200 mb-1">Büyüklük</dt>
              <dd className="font-semibold">
                {cs.companySize}
                {cs.region ? ` · ${cs.region}` : ''}
              </dd>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-blue-200 mb-1">Katılımcı</dt>
              <dd className="font-semibold">
                {cs.participants} kişi · {cs.roles}
              </dd>
            </div>
            <div className="rounded-xl bg-white/10 p-4">
              <dt className="text-blue-200 mb-1">Dönem</dt>
              <dd className="font-semibold">{cs.period}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Rakamlar */}
      {metrics.length > 0 && (
        <section className="px-6 -mt-8">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-gray-100 shadow-md p-5 text-center"
              >
                <div className="text-3xl font-extrabold text-[#082567] leading-none">{m.value}</div>
                <div className="text-[12px] text-gray-500 mt-2 leading-snug">{m.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sorun / Program */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0e7da6] mb-3">
              Durum
            </h2>
            <p className="text-[17px] text-gray-800 leading-[1.8]">{cs.challenge}</p>
          </div>
          <div>
            <h2 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0e7da6] mb-3">
              Program
            </h2>
            <p className="text-[17px] text-gray-800 leading-[1.8]">{cs.approach}</p>
            {(cs.weeklyProgram || modules.length > 0) && (
              <div className="mt-6 flex flex-wrap gap-2">
                {cs.weeklyProgram && (
                  <span className="text-[13px] font-semibold px-3 py-1.5 rounded-full bg-[#082567] text-white">
                    {cs.weeklyProgram}
                  </span>
                )}
                {modules.map((m, i) => (
                  <span
                    key={i}
                    className="text-[13px] font-medium px-3 py-1.5 rounded-full bg-[#e8eef8] text-[#082567]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Seviye değişimi */}
      {levelsBefore.length > 0 && levelsAfter.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#082567] mb-2 text-center">Seviye değişimi</h2>
            <p className="text-[13px] text-gray-500 text-center mb-8">
              {cs.participants} katılımcı ·{' '}
              {cs.levelSource || 'Sphere English seviye değerlendirmesi'}
            </p>
            <div className="flex flex-col md:flex-row gap-5 items-stretch">
              <LevelBars title="Başlangıç" levels={levelsBefore} accent="#94a3b8" />
              <div className="hidden md:flex items-center text-3xl text-[#13a9e0] font-bold">→</div>
              <LevelBars title="Bugün" levels={levelsAfter} accent="#13a9e0" />
            </div>
          </div>
        </section>
      )}

      {/* Gözlem + alıntı */}
      {(cs.observations || quoteText) && (
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-10">
            {cs.observations && (
              <div>
                <h2 className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0e7da6] mb-3">
                  Sonuç
                </h2>
                <p className="text-[17px] text-gray-800 leading-[1.8]">{cs.observations}</p>
              </div>
            )}
            {quoteText && (
              <figure className="rounded-3xl bg-[#082567] text-white p-8 md:p-10">
                <blockquote className="text-xl md:text-2xl font-semibold leading-relaxed">
                  “{quoteText}”
                </blockquote>
                {quoteAuthor && (
                  <figcaption className="mt-5 text-[13px] text-blue-200">
                    — {quoteAuthor}, {name}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#082567] mb-4">
            Ekibiniz için benzer bir program
          </h3>
          <p className="text-gray-600 mb-8 text-[15px]">
            Seviye ölçümü, haftalık plan ve teklifi aynı hafta içinde paylaşalım.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center bg-[#082567] hover:bg-[#0a2d7a] text-white px-8 py-4 rounded-2xl text-[15px] font-bold tracking-wide transition-all duration-200 hover:shadow-md"
            >
              Kurumsal Teklif Al
            </Link>
            <Link
              href="/referanslar"
              className="inline-flex items-center justify-center bg-white border border-gray-200 text-[#082567] px-8 py-4 rounded-2xl text-[15px] font-semibold tracking-wide transition-all duration-200 hover:border-[#082567]/30"
            >
              Diğer Referanslar
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
