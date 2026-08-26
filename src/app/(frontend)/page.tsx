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
import HeroSection from './home/components/HeroSection';
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

export default async function HomePage() {
  let cms: any = null;
  try {
    cms = await fetchHomePage();
  } catch (err) {
    console.warn('[home] CMS fetch hatası — varsayılan içerik kullanılacak:', err);
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main>
        <HeroSection data={cms} />
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
