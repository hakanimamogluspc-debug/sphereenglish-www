/**
 * Sphere English — Anasayfa (root canonical)
 *
 * URL: https://www.sphereenglish.com/
 *
 * Not: Önceden anasayfa /home altındaydı ve / → /home redirect vardı.
 * Şimdi ters çevirdik: / ana canonical, /home 301 → /. Bu sayede:
 *   - Google için tek bir homepage URL
 *   - SEO equity dağılmıyor
 *   - Standart Next.js App Router konvansiyonu
 *
 * İçerik ve component'ler mevcut /home/page.tsx'ten yeniden kullanılıyor
 * (component klasörü orada duruyor).
 */

export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection, { type HeroBanner } from './home/components/HeroSection';
import CoursesSection from './home/components/CoursesSection';
import FounderQuoteSection from './home/components/FounderQuoteSection';
import MerveFounderQuoteSection from './home/components/MerveFounderQuoteSection';
import NedenBizSection from './home/components/NedenBizSection';
import EgitimModeliSection from './home/components/ICPSection';
import BentoGrid from './home/components/ModuleGrid';
import RaporlamaSection from './home/components/ProofSection';
import PaketlerSection from './home/components/SyllabusDownload';
import ContactSection from './home/components/StickyCTA';
import ReferencesSection from './home/components/ReferencesSection';
import FAQSection from './home/components/FAQSection';
import AICoachesSection from './home/components/AICoachesSection';
import AIStudioTeaser from './home/components/AIStudioTeaser';
import { fetchHomePage } from '@/payload/api';
import { DEFAULT_FAQS, type FAQ } from './home/components/faq-data';

export const metadata: Metadata = {
  title: 'Profesyoneller İçin İş İngilizcesi | Kurslar, E-Kitaplar ve AI Studio',
  description:
    'Türk profesyoneller için gerçek iş hayatına odaklanan İş İngilizcesi kursları, dijital kaynaklar ve AI destekli pratik. A1-A2 ve B1-B2 seviyeleri için 4 haftalık canlı programlar, PDF e-kitap serisi ve AI Studio.',
  alternates: { canonical: 'https://www.sphereenglish.com/' },
  openGraph: {
    title: 'Sphere English | Profesyoneller İçin İş İngilizcesi',
    description:
      'İş İngilizcesi kursları, PDF e-kitaplar ve AI Studio. Türk profesyonellere göre tasarlandı.',
    url: 'https://www.sphereenglish.com/',
    images: [{ url: '/assets/images/hero_online_english_lesson.png', width: 1200, height: 630 }],
  },
};

/** Admin → Ana Sayfa Banner'ları (60 sn önbellek). Hata olursa hero varsayılan slaytla açılır. */
async function fetchHomeBanners(): Promise<HeroBanner[]> {
  try {
    const base = (process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000').replace(/\/$/, '');
    const r = await fetch(`${base}/api/home-banners`, { next: { revalidate: 60 } });
    if (!r.ok) return [];
    const d = await r.json();
    return Array.isArray(d?.banners) ? d.banners : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const banners = await fetchHomeBanners();
  let cms: any = null;
  try {
    cms = await fetchHomePage();
  } catch (err) {
    console.warn('[home] CMS fetch hatası — varsayılan içerik kullanılacak:', err);
  }

  // SSS şeması, sayfada görünen sorularla birebir aynı kaynaktan üretilir (CMS → yoksa varsayılan).
  const faqs: FAQ[] = Array.isArray(cms?.faqs) && cms.faqs.length > 0 ? cms.faqs : DEFAULT_FAQS;
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
  const ORG = { '@id': 'https://www.sphereenglish.com/#organization' };
  const offeringsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Sphere English hizmetleri',
    itemListElement: [
      {
        '@type': 'ListItem', position: 1,
        item: {
          '@type': 'Service', name: 'Online İş İngilizcesi Kursları',
          description: 'A1-A2 ve B1-B2 seviyeleri için küçük gruplu, canlı online İş İngilizcesi programları.',
          url: 'https://www.sphereenglish.com/is-ingilizcesi-kursu', provider: ORG, areaServed: 'TR',
        },
      },
      {
        '@type': 'ListItem', position: 2,
        item: {
          '@type': 'Service', name: 'Kurumsal İş İngilizcesi Eğitimi',
          description: 'Şirket çalışanları için sektöre göre uyarlanan canlı dersler, yapay zeka destekli pratik ve İK için ilerleme raporları.',
          url: 'https://www.sphereenglish.com/cozumler', provider: ORG, areaServed: 'TR',
        },
      },
      {
        '@type': 'ListItem', position: 3,
        item: {
          '@type': 'Service', name: 'İş İngilizcesi E-Kitapları',
          description: 'Türkçe açıklamalı İş İngilizcesi kalıp ve terim kitapları (PDF); alınan kitaplar uygulamada okunur ve kalıplarla pratik yapılır.',
          url: 'https://www.sphereenglish.com/e-kitaplar', provider: ORG, areaServed: 'TR',
        },
      },
      {
        '@type': 'ListItem', position: 4,
        item: {
          '@type': 'Service', name: 'Sphere AI Studio',
          description: 'Yapay zeka koçlarıyla konuşma, telaffuz, yazma ve dilbilgisi pratiği.',
          url: 'https://www.sphereenglish.com/ai-studio', provider: ORG, areaServed: 'TR',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offeringsJsonLd) }} />
      <Header />
      <main>
        <HeroSection data={cms} banners={banners} />
        {/* Yeni: Kurslar bölümü — hero'dan hemen sonra birincil ticari alan (§9) */}
        <CoursesSection />
        <NedenBizSection data={cms} />
        <EgitimModeliSection />
        <BentoGrid data={cms} />
        <AICoachesSection data={cms} />
        <AIStudioTeaser />
        <FounderQuoteSection />
        <MerveFounderQuoteSection />
        <RaporlamaSection />
        <ReferencesSection />
        <PaketlerSection />
        <FAQSection data={cms} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
