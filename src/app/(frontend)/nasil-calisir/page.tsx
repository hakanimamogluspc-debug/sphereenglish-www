'use client';
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Ücretsiz Demo Randevusu',
    description: 'İhtiyaçlarınızı anlamak için 30 dakikalık ücretsiz görüşme planlayın.',
    icon: '📅',
  },
  {
    number: '02',
    title: 'Seviye Tespiti',
    description: 'CEFR uyumlu seviye testi ile başlangıç noktanızı belirleyin.',
    icon: '📊',
  },
  {
    number: '03',
    title: 'Kişiselleştirilmiş Program',
    description: 'Oxford University Press müfredat ve kaynaklarını temel alarak hedeflerinize ve sektörünüze özel program hazırlanır.',
    icon: '📋',
  },
  {
    number: '04',
    title: 'Eğitmen Ataması',
    description: 'Alanında uzman, iş dünyası deneyimli eğitmeninizle tanışın.',
    icon: '👨‍🏫',
  },
  {
    number: '05',
    title: 'Canlı Dersler ve Takip',
    description: 'Zoom entegreli, %100 canlı online dersler. Haftalık program, sürdürülebilir tempo.',
    icon: '💻',
  },
  {
    number: '06',
    title: 'Raporlama ve Sertifika',
    description: 'Aylık gelişim raporları. Program tamamlama sertifikası.',
    icon: '🏆',
  },
];

export default function NasilCalisirPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header forceWhite />
      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-[#f0f4f8] to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
              Süreç
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1B365D] mb-5 leading-tight">
              Nasıl Çalışır?
            </h1>
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Sphere English ile iş İngilizcenizi geliştirmek sadece 6 adım uzağınızda.
            </p>
          </div>
        </section>

        {/* Timeline Section — her adım TEK KEZ render (duplicate content bug fix) */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="relative">
              {/* Desktop dikey çizgi (ortada) */}
              <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#0ea5e9] via-[#1B365D] to-[#0ea5e9] -translate-x-1/2" aria-hidden="true" />
              {/* Mobile dikey çizgi (solda) */}
              <div className="md:hidden absolute left-[9px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#0ea5e9] to-[#1B365D]" aria-hidden="true" />

              <ol className="flex flex-col gap-8 md:gap-12">
                {steps.map((step, index) => {
                  const isLeft = index % 2 === 0;
                  return (
                    <li key={step.number} className="relative md:grid md:grid-cols-2 md:gap-x-12 flex items-start gap-4 md:gap-0">
                      {/* Dot — mobile: solda 20px, desktop: ortada absolute */}
                      <div className="flex-shrink-0 md:absolute md:left-1/2 md:top-6 md:-translate-x-1/2 z-10 pt-1 md:pt-0">
                        <div className="w-5 h-5 rounded-full bg-[#0ea5e9] border-4 border-white shadow-lg shadow-[#0ea5e9]/30" />
                      </div>
                      {/* Card — desktop: alternating column, mobile: sağ tarafta tek kolon */}
                      <div className={`flex-1 md:flex-none min-w-0 ${isLeft ? 'md:col-start-1 md:pr-6' : 'md:col-start-2 md:pl-6'}`}>
                        <TimelineCard step={step} />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1B365D] to-[#082567]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-blue-200 text-base sm:text-lg mb-8">
              Ücretsiz demo randevunuzu alın, farkı kendiniz görün.
            </p>
            <Link
              href="/demo"
              className="inline-block px-8 py-4 rounded-full bg-[#0ea5e9] text-white text-[13px] font-bold tracking-[0.18em] hover:bg-[#0284c7] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              ÜCRETSİZ DEMO RANDEVUSU AL
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function TimelineCard({ step }: { step: { number: string; title: string; description: string; icon: string } }) {
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 w-full">
      <span className="block text-[13px] font-bold tracking-[0.2em] text-gray-400 mb-3">
        {step.number}
      </span>
      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#1B365D] mb-3 leading-snug">
        {step.title}
      </h3>
      <p className="text-gray-500 text-[14px] sm:text-[15px] leading-relaxed">
        {step.description}
      </p>
    </div>
  );
}
