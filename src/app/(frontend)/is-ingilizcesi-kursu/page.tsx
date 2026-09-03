import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchAllCourses } from '@/lib/api/courses';
import { GROUP_SIZE, CONTACT, OXFORD } from '@/lib/business-config';
import {
  Users, Calendar, MessageSquare, FileText, Video, Building2,
  ArrowRight, CheckCircle2, Shield,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Online İş İngilizcesi Kursu | A1-A2 ve B1-B2 Programları',
  description:
    'Profesyoneller için online İş İngilizcesi kursu. A1-A2 sıfırdan başlayanlar ve B1-B2 orta seviye ve üstü için 4 haftalık canlı grup programları. Max 6 kişi, Oxford University Press müfredatı, gerçek iş senaryoları.',
  alternates: { canonical: 'https://www.sphereenglish.com/is-ingilizcesi-kursu' },
  // TEST MODU — Eylül lansmanına kadar noindex.
  // Ön kayıt akışı canlı, sadece Google index'lemesin diye.
  // Lansmanda: bu robots bloğunu kaldır.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    title: 'Online İş İngilizcesi Kursu',
    description:
      'A1-A2 ve B1-B2 için 4 haftalık canlı grup programları. Max 6 kişi, gerçek iş senaryoları.',
    url: 'https://www.sphereenglish.com/is-ingilizcesi-kursu',
  },
};

export const dynamic = 'force-dynamic';

const SHARED_FEATURES = [
  { icon: Users,         title: `Maks ${GROUP_SIZE.max} kişi`, desc: 'Küçük grup — herkese söz hakkı ve pratik fırsatı.' },
  { icon: Calendar,      title: 'Haftada 1 ders',              desc: '60 dakika, iş temponuza uygun sürdürülebilir plan.' },
  { icon: MessageSquare, title: 'Konuşma odaklı',              desc: 'Gerçek iş senaryoları — plaza jargonu değil.' },
  { icon: FileText,      title: 'Case study PDF',              desc: 'Her ders sonu materyaller elinizde kalır.' },
  { icon: Video,         title: '%100 canlı',                  desc: 'Kayıt değil — gerçek eğitmenle etkileşimli.' },
  { icon: Building2,     title: 'Türk iş dünyası',             desc: 'Sektörel gerçek durumlar, Türk profesyonellere özel.' },
];

const FAQ = [
  {
    q: 'Program ne zaman başlıyor?',
    a: `Eylül 2026'nın ilk haftası ilk gruplar açılıyor. Kesin başlangıç tarihi ön kayıt sonrası size e-posta ile iletilir.`,
  },
  {
    q: 'Dersler nasıl işleniyor?',
    a: '4 hafta boyunca haftada 1 kez, 60 dakikalık canlı Zoom oturumları. Kayıt değil — gerçek zamanlı eğitmenle etkileşimli.',
  },
  {
    q: 'Grup büyüklüğü kaç kişi?',
    a: `Maksimum ${GROUP_SIZE.max} kişilik gruplar. Her katılımcının söz alması ve pratik yapması için tasarlandı.`,
  },
  {
    q: 'Hangi seviyeye uygunum, nasıl karar veririm?',
    a: 'Ödeme sonrası kayıt formunda seviye tespiti yapılır. Emin değilseniz WhatsApp\'tan da bize danışabilirsiniz.',
  },
  {
    q: 'Müfredat nasıl hazırlandı?',
    a: `${OXFORD.long} Programlarımız Türk profesyonellerin ihtiyaçlarına göre uyarlanmıştır.`,
  },
  {
    q: 'Ödeme güvenli mi?',
    a: 'Ödeme Iyzico ile 3D Secure altyapısı üzerinden alınır. Kart bilgileriniz Sphere English tarafından hiçbir zaman görülmez veya saklanmaz.',
  },
];

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://www.sphereenglish.com/' },
    { '@type': 'ListItem', position: 2, name: 'İş İngilizcesi Kursu', item: 'https://www.sphereenglish.com/is-ingilizcesi-kursu' },
  ],
};

export default async function CourseLandingPage() {
  const courses = await fetchAllCourses();

  // JSON-LD: ItemList (kurslar)
  const listJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: courses.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: c.title,
        description: c.subtitle ?? '',
        provider: { '@type': 'EducationalOrganization', name: 'Sphere English', url: 'https://www.sphereenglish.com' },
        url: `https://www.sphereenglish.com/is-ingilizcesi-kursu/${c.level_slug}`,
        educationalLevel: c.level_cefr ?? '',
        offers: {
          '@type': 'Offer',
          price: (c.price_kurus / 100).toFixed(2),
          priceCurrency: 'TRY',
        },
      },
    })),
  };

  return (
    <main className="bg-white min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-20 pb-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            ONLINE BUSINESS ENGLISH
          </p>
          <h1 className="text-[40px] lg:text-[54px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-5">
            Profesyoneller İçin Online
            <br />
            İş İngilizcesi Kursları
          </h1>
          <p className="text-[17px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Gerçek iş hayatında kullanacağınız İngilizceyi öğrenin. Toplantılardan e-postalara,
            mülakatlardan kriz iletişimine kadar kariyerinizde ihtiyaç duyduğunuz becerileri
            seviyenize uygun programla geliştirin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-[12px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Eylül 2026'nın ilk haftası başlıyor
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Maks {GROUP_SIZE.max} kişilik gruplar
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              %100 canlı ders
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <a href="#programlar" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[15px] transition-colors">
              Programları İncele
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent('Seviyemi bilmiyorum, uygun programı öğrenmek istiyorum.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 hover:border-[#0ea5e9] text-[#1B365D] font-semibold text-[15px] transition-colors"
            >
              Seviyemi Bilmiyorum
            </a>
          </div>
        </div>
      </section>

      {/* 2 program kart */}
      <section id="programlar" className="max-w-6xl mx-auto px-6 lg:px-10 py-14">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            SEVİYENE UYGUN PROGRAMI SEÇ
          </p>
          <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
            İki Farklı Seviye, İki Farklı Yolculuk
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((c) => {
            const isWaitlist = c.cohort_status === 'waitlist';
            const remainingWeeks = Math.max(0, (c.weeks.length ?? 0) - 3);
            return (
              <article
                key={c.id}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl hover:border-[#0ea5e9]/40 transition-all duration-300"
              >
                <div className="relative border-b border-gray-100 px-7 pt-6 pb-5">
                  <div className="absolute top-6 left-0 w-1 h-12 bg-[#0ea5e9]" />
                  <div className="pl-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {c.level_badge && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B365D] text-white text-[11px] font-bold uppercase tracking-[0.14em]">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                          {c.level_badge}
                        </span>
                      )}
                      {c.level_cefr && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[13px] font-extrabold tracking-wide">
                          {c.level_cefr}
                        </span>
                      )}
                      {c.level_audience && (
                        <span className="text-[12px] font-semibold text-gray-500">
                          {c.level_audience}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[24px] lg:text-[28px] font-extrabold text-[#1B365D] leading-[1.15] tracking-tight">
                      {c.title}
                    </h3>
                    {c.title_en && (
                      <p className="text-[12px] text-gray-400 italic mt-1.5">{c.title_en}</p>
                    )}
                  </div>
                </div>

                <div className="px-7 py-6 flex-1 flex flex-col">
                  {c.subtitle && (
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-6">{c.subtitle}</p>
                  )}

                  <ul className="space-y-2 mb-6">
                    {c.weeks.slice(0, 3).map((w) => (
                      <li key={w.n} className="flex gap-3 text-[13px] text-gray-600">
                        <span className="flex-shrink-0 mt-1 w-4 h-4 rounded-full border border-[#1B365D]/25 text-[10px] font-bold text-[#1B365D] flex items-center justify-center">
                          {w.n}
                        </span>
                        <span className="leading-snug">{w.title}</span>
                      </li>
                    ))}
                    {remainingWeeks > 0 && (
                      <li className="text-[12px] text-gray-400 pl-7">+ {remainingWeeks} hafta daha (detay sayfasında)</li>
                    )}
                  </ul>

                  <div className="mt-auto pt-5 border-t border-gray-100">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                          {c.duration_weeks ?? 4} HAFTALIK PROGRAM
                        </div>
                        <div className="text-[26px] font-extrabold text-[#1B365D] leading-none mt-1">
                          {c.price_display ?? `${(c.price_kurus / 100).toFixed(0)} TL`}
                        </div>
                      </div>
                      {isWaitlist && c.cohort_waitlist_label && (
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                          {c.cohort_waitlist_label}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/is-ingilizcesi-kursu/${c.level_slug}`}
                      className="block w-full text-center py-3.5 rounded-xl font-bold text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
                    >
                      Programı İncele
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Kontenjan mesajı — sahte scarcity YOK */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-10">
        <div className="rounded-xl bg-[#f0f7ff] border border-[#0ea5e9]/25 p-5 text-center">
          <p className="text-[14px] text-[#1B365D] leading-relaxed">
            <strong>Mevcut gruplarımızın kontenjanı dolmuştur.</strong>{' '}
            Eylül 2026 grupları için ön kayıt devam ediyor. Her programda yalnızca <strong>{GROUP_SIZE.max} kişilik</strong> yer var.
          </p>
        </div>
      </section>

      {/* Ortak özellikler */}
      <section className="border-t border-gray-100 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
              HER İKİ PROGRAMDA
            </p>
            <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
              Neden Sphere English?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHARED_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-xl border border-gray-200 p-6 hover:border-[#0ea5e9]/40 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-lg bg-[#1B365D]/5 border border-[#1B365D]/10 flex items-center justify-center text-[#1B365D] group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9] group-hover:border-[#0ea5e9]/30 transition-all mb-4">
                    <Icon strokeWidth={1.6} className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-[#1B365D] text-[15px] mb-1.5">{f.title}</div>
                  <div className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            SIK SORULAN SORULAR
          </p>
          <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
            Bilmen Gereken Her Şey
          </h2>
        </div>
        <div className="space-y-2.5">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#0ea5e9]/40 transition-colors">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-[#1B365D] text-[15px] hover:bg-gray-50 flex items-center gap-3 list-none">
                <span className="flex-1">{item.q}</span>
                <span className="text-[#0ea5e9] group-open:rotate-45 transition-transform text-xl leading-none font-light">+</span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-[14px] text-gray-600 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Alt CTA */}
      <section className="bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#7dd3fc] uppercase mb-4">
            KONTENJANLAR SINIRLIDIR
          </p>
          <h2 className="text-[32px] lg:text-[42px] font-extrabold leading-tight mb-4 tracking-tight">
            Eylül Grubunda Yerini Ayır
          </h2>
          <p className="text-[16px] text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
            Her programda yalnızca <strong className="text-white">{GROUP_SIZE.max} kişilik</strong> yer var.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-5 mb-8 text-[13px] text-white/70">
            <span className="inline-flex items-center gap-2"><Shield className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />Iyzico 3D Secure</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />Taksit imkanı</span>
            <span className="inline-flex items-center gap-2"><ArrowRight className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />24 saat içinde iletişim</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <a href="#programlar" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[15px] transition-colors">
              Programı Seç ve Kayıt Ol
            </a>
            <a
              href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent('Sphere English kurumsal grup programı için bilgi almak istiyorum.')}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/30 hover:border-white/70 hover:bg-white/5 text-white font-bold text-[15px] transition-colors"
            >
              WhatsApp ile Danış
            </a>
          </div>

          <p className="text-[12px] text-white/50 mt-8">
            {CONTACT.email} · {CONTACT.phoneDisplay}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
