import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BuyCourseButton from '../../kurslar/BuyCourseButton';
import { PROGRAMMES, findProgrammeByLevelSlug } from '@/lib/courses-catalog';
import { COHORTS, cohortStatusMessage } from '@/lib/cohort-config';
import { GROUP_SIZE, CONTACT, OXFORD } from '@/lib/business-config';
import {
  Users, Calendar, MessageSquare, FileText, Video, Building2,
  ArrowRight, CheckCircle2, Shield, BookOpen,
} from 'lucide-react';

/**
 * Kurs detay sayfası — /is-ingilizcesi-kursu/[a1-a2|b1-b2]
 *
 * Backend Iyzico akışı /kurslar/BuyCourseButton üzerinden çalışıyor (paymentSlug ile).
 * Yeni URL'de aynı satın alma component'i yeniden kullanılıyor.
 */

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return PROGRAMMES.map((p) => ({ levelSlug: p.levelSlug }));
}

const SEO_META: Record<string, { title: string; description: string; h1Prefix: string }> = {
  'a1-a2': {
    title: 'A1-A2 İş İngilizcesi Kursu | Business English Foundation',
    description:
      'İş İngilizcesine sıfırdan başlayın. A1-A2 profesyoneller için 4 haftalık online Business English programı. E-posta, toplantı, telefon ve günlük iş iletişimini öğrenin.',
    h1Prefix: 'A1–A2 İş İngilizcesi',
  },
  'b1-b2': {
    title: 'B1-B2 İş İngilizcesi Kursu | Toplantı ve İletişim',
    description:
      'B1-B2 profesyoneller için 4 haftalık online İş İngilizcesi programı. Toplantı yönetimi, kriz iletişimi, ikna teknikleri ve zorlu mülakatlar — gerçek iş senaryoları.',
    h1Prefix: 'B1–B2 İş İngilizcesi',
  },
};

interface Props {
  params: Promise<{ levelSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { levelSlug } = await params;
  const seo = SEO_META[levelSlug];
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `https://www.sphereenglish.com/is-ingilizcesi-kursu/${levelSlug}` },
    // TEST MODU — Eylül lansmanına kadar noindex. Lansmanda kaldır.
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false },
    },
    openGraph: {
      title: `${seo.title} | Sphere English`,
      description: seo.description,
      url: `https://www.sphereenglish.com/is-ingilizcesi-kursu/${levelSlug}`,
    },
  };
}

const SHARED_FEATURES = [
  { icon: Users,         title: `Maks ${GROUP_SIZE.max} kişi`, desc: 'Küçük grup — herkese söz hakkı.' },
  { icon: Calendar,      title: 'Haftada 1 ders',              desc: '60 dakika, sürdürülebilir plan.' },
  { icon: MessageSquare, title: 'Konuşma odaklı',              desc: 'Gerçek iş senaryoları.' },
  { icon: FileText,      title: 'Case study PDF',              desc: 'Materyaller elinizde kalır.' },
  { icon: Video,         title: '%100 canlı',                  desc: 'Kayıt değil, gerçek eğitmen.' },
  { icon: Building2,     title: 'Türk iş dünyası',             desc: 'Türk profesyonellere özel.' },
];

export default async function LevelDetailPage({ params }: Props) {
  const { levelSlug } = await params;
  const p = findProgrammeByLevelSlug(levelSlug);
  if (!p) notFound();

  const cohort = COHORTS.find((c) => c.programmeSlug === p.levelSlug);
  const isWaitlist = cohort?.status === 'waitlist';

  return (
    <main className="bg-white min-h-screen">
      <Header />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-6 lg:px-10 pt-6 text-[12px] text-gray-500">
        <ol className="flex items-center gap-2 flex-wrap">
          <li><Link href="/" className="hover:text-[#0ea5e9]">Ana Sayfa</Link></li>
          <li className="text-gray-300">/</li>
          <li><Link href="/is-ingilizcesi-kursu" className="hover:text-[#0ea5e9]">İş İngilizcesi Kursu</Link></li>
          <li className="text-gray-300">/</li>
          <li className="text-[#1B365D] font-semibold">{p.levelCefr}</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-10 pb-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B365D] text-white text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
              {p.levelBadge}
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[13px] font-extrabold tracking-wide">
              {p.levelCefr}
            </span>
            <span className="text-[12px] font-semibold text-gray-500">{p.levelAudience}</span>
          </div>

          <h1 className="text-[38px] lg:text-[52px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-4">
            {p.titleTr}
          </h1>
          <p className="text-[14px] text-gray-500 italic mb-5">{p.titleEn}</p>
          <p className="text-[17px] text-gray-600 max-w-3xl leading-relaxed mb-6">
            {p.description}
          </p>

          <div className="flex flex-wrap gap-3 text-[13px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {p.durationLabel}
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Maks {GROUP_SIZE.max} kişi
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {OXFORD.metaShort}
            </span>
          </div>
        </div>
      </section>

      {/* Kime uygun + Program + Fiyat sepeti */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sol: Program + kime uygun */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-[24px] font-extrabold text-[#1B365D] mb-4 tracking-tight">Kime Uygun?</h2>
              <ul className="space-y-2.5">
                {p.audience.map((a, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-gray-700 leading-relaxed">
                    <CheckCircle2 className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-[24px] font-extrabold text-[#1B365D] mb-6 tracking-tight">4 Haftalık Program</h2>
              <div className="space-y-4">
                {p.weeks.map((w) => (
                  <div key={w.n} className="flex gap-4">
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full border-2 border-[#1B365D]/20 bg-white text-[#1B365D] flex items-center justify-center font-bold text-[15px]">
                        {w.n}
                      </div>
                      {w.n < p.weeks.length && <div className="w-px flex-1 bg-gray-200 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0ea5e9] mb-1">{w.n}. HAFTA</div>
                      <div className="text-[17px] font-bold text-[#1B365D] leading-snug mb-1.5">{w.title}</div>
                      <div className="text-[14px] text-gray-600 leading-relaxed">{w.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[24px] font-extrabold text-[#1B365D] mb-6 tracking-tight">Program Detayları</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {SHARED_FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="rounded-xl border border-gray-200 p-4">
                      <div className="w-9 h-9 rounded-lg bg-[#1B365D]/5 border border-[#1B365D]/10 flex items-center justify-center text-[#1B365D] mb-2">
                        <Icon strokeWidth={1.6} className="w-4 h-4" />
                      </div>
                      <div className="font-bold text-[#1B365D] text-[13px] mb-0.5">{f.title}</div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">{f.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sağ: Satın al kart (sticky) */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-1">
                4 HAFTALIK PROGRAM
              </div>
              <div className="text-[36px] font-extrabold text-[#1B365D] leading-none mb-1">
                {p.price}
              </div>
              <div className="text-[12px] text-emerald-600 font-semibold mb-5">
                Iyzico 3D Secure · Taksit imkanı
              </div>

              {isWaitlist && cohort && (
                <div className="mb-5 rounded-lg bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-900 leading-relaxed">
                  {cohortStatusMessage(cohort)}
                </div>
              )}

              <BuyCourseButton
                programmeSlug={p.paymentSlug}
                programmeTitle={p.titleTr}
                price={p.price}
                variant="primary"
              />

              <ul className="mt-5 space-y-2 text-[12px] text-gray-600">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-px" />4 hafta canlı grup dersi</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-px" />Her ders sonu case study PDF</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-px" />Maks {GROUP_SIZE.max} kişilik butik grup</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-px" />24 saat içinde iletişim</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Cross-sell: ilgili e-kitaplar */}
      {p.relatedEbookSlugs.length > 0 && (
        <section className="bg-[#f0f7ff]/50 border-t border-gray-100 py-14">
          <div className="max-w-5xl mx-auto px-6 lg:px-10">
            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-2">
                KURSA HAZIRLIK
              </p>
              <h2 className="text-[24px] font-extrabold text-[#1B365D] tracking-tight">
                Programa Başlarken Faydalanabileceğin E-Kitaplar
              </h2>
              <p className="text-[14px] text-gray-500 mt-2">
                Programa katılmadan önce temel kavramları PDF e-kitaplarımızla pekiştirebilirsin.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {p.relatedEbookSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`/e-kitaplar/${slug}`}
                  className="group flex items-center gap-4 rounded-xl bg-white border border-gray-200 p-4 hover:border-[#0ea5e9]/40 hover:shadow-sm transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-[#1B365D]/5 border border-[#1B365D]/10 flex items-center justify-center text-[#1B365D] group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9] group-hover:border-[#0ea5e9]/30 transition-all flex-shrink-0">
                    <BookOpen strokeWidth={1.6} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0ea5e9]">E-KİTAP · PDF</div>
                    <div className="text-[14px] font-bold text-[#1B365D] truncate">{slugToTitle(slug)}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#0ea5e9] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Alt CTA */}
      <section className="bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[28px] lg:text-[36px] font-extrabold leading-tight mb-4 tracking-tight">
            Bu Program Sana Uygun mu?
          </h2>
          <p className="text-[16px] text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
            Emin değilsen WhatsApp'tan yaz — sana uygun programı beraber belirleyelim.
          </p>
          <a
            href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent(`${p.titleTr} programı hakkında bilgi almak istiyorum.`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[15px] transition-colors"
          >
            WhatsApp ile Danış
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function slugToTitle(slug: string): string {
  // Basit slug → başlık dönüşümü. Gerçek başlıklar için DB fetch yapılabilir ama bu boyut için yeterli.
  const map: Record<string, string> = {
    'kurumsal-iletisim-toplantilar': 'Kurumsal İletişim & Toplantılar',
    'pazarlama-satis-musteri-iliskileri': 'Pazarlama, Satış & Müşteri İlişkileri',
    'liderlik-insan-kaynaklari-kuresel-operasyonlar': 'Liderlik, İK & Küresel Operasyonlar',
    'kurumsal-strateji-finansal-analiz-risk-yonetimi': 'Kurumsal Strateji & Finans',
    'kuresel-girisimcilik-edtech-teknoloji-yonetimi': 'Küresel Girişimcilik, EdTech & Teknoloji',
  };
  return map[slug] ?? slug;
}
