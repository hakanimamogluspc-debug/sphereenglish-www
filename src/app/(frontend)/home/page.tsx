export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import FounderQuoteSection from './components/FounderQuoteSection';
import MerveFounderQuoteSection from './components/MerveFounderQuoteSection';
import NedenBizSection from './components/NedenBizSection';
import EgitimModeliSection from './components/ICPSection';
import BentoGrid from './components/ModuleGrid';
import RaporlamaSection from './components/ProofSection';
import PaketlerSection from './components/SyllabusDownload';
import ContactSection from './components/StickyCTA';
import ReferencesSection from './components/ReferencesSection';
import FAQSection from './components/FAQSection';
import AICoachesSection from './components/AICoachesSection';
import AIStudioTeaser from './components/AIStudioTeaser';
import { fetchHomePage } from '@/payload/api';

/**
 * NOT: /home artık next.config'de 301 → / redirect ediliyor.
 * Bu sayfa src/app/(frontend)/page.tsx üzerinden root olarak sunuluyor.
 * Metadata orada tanımlı — burada tekrar tanımlamayın.
 */
export const metadata: Metadata = {
  // Bilinçli olarak boş — root page.tsx'in metadata'sı kullanılacak.
  // Eğer bu dosya (redirect atlanırsa) render edilirse, canonical / gösterir.
  alternates: { canonical: 'https://www.sphereenglish.com/' },
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
