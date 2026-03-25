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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main>
        <HeroSection />
        <NedenBizSection />
        <EgitimModeliSection />
        <BentoGrid />
        <FounderQuoteSection />
        <MerveFounderQuoteSection />
        <RaporlamaSection />
        <ReferencesSection />
        <PaketlerSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}