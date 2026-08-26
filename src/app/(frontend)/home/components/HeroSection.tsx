'use client';
import React, { useEffect, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface HeroProps {
  data?: {
    heroLine1?: string;
    heroLine2?: string;
    heroLine3?: string;
    heroSubtitle?: string;
    heroCta1Text?: string;
    heroCta2Text?: string;
    heroBadge?: string;
    heroStatValue?: string;
    heroStatLabel?: string;
    heroStatNote?: string;
  };
}

export default function HeroSection({ data }: HeroProps = {}) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // ─── HERO CONTENT — CMS OVERRIDE BYPASS ─────────────────────────────
  // Payload CMS'te eski B2B yönlendirmeli değerler ("Kurumsal İş İngilizcesi
  // Eğitim Programı", "HEMEN TEKLİF AL" vb.) hâlâ mevcut ve yeni positioning'i
  // (bireysel profesyonel + kurs/e-kitap funnel) eziyordu.
  //
  // Yeni positioning'i garantilemek için CMS override'ı bilinçli olarak DEVRE DIŞI.
  // İleride CMS'i admin panelden güncelledikten sonra `data?.heroLine1 ?? '...'`
  // pattern'ine geri dönebilirsiniz.
  const heroLine1 = 'İş İngilizcesinde';
  const heroLine2 = 'Bir Üst Seviyeye';
  const heroLine3 = 'Geç.';
  const heroSubtitle = 'Türk profesyoneller için gerçek iş hayatına odaklanan online kurslar, dijital kaynaklar ve AI destekli pratik. Toplantıdan e-postaya, mülakattan pazarlığa kariyerinizde daha net ve güvenli iletişim.';
  const heroCta1Text = 'KURSLARI İNCELE';
  const heroCta2Text = 'E-KİTAPLARI KEŞFET';
  const heroBadge = data?.heroBadge ?? 'Canlı Ders Devam Ediyor';
  const heroStatValue = data?.heroStatValue ?? '+2';
  const heroStatLabel = data?.heroStatLabel ?? 'Seviye';
  const heroStatNote = data?.heroStatNote ?? '6 aylık program sonrası';

  useEffect(() => {
    const elements = [headlineRef?.current, subRef?.current, ctaRef?.current];
    elements?.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      setTimeout(() => {
        el.style.transition = 'opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 200 + i * 150);
    });
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#f0f4f8] via-white to-[#e8f0fe]" style={{ paddingTop: '72px' }}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#082567]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0ea5e9]/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 min-h-[calc(100vh-72px)] items-center pt-[80px] pb-[60px] lg:py-0">

        <div className="flex flex-col justify-center lg:pr-16 lg:pt-[80px] lg:pb-[60px]">
          <h1
            ref={headlineRef}
            className="text-[28px] sm:text-[44px] lg:text-[60px] xl:text-[68px] font-extrabold leading-[1.18] tracking-[-0.02em] text-[#1B365D] mt-[30px] sm:mt-[60px] mb-[20px] sm:mb-[30px]"
          >
            <span className="block pb-1">{heroLine1}</span>
            <span className="block pb-1">{heroLine2}</span>
            <span className="block text-[#0ea5e9]">{heroLine3}</span>
          </h1>

          <p
            ref={subRef}
            className="text-[14px] lg:text-[18px] text-gray-500 leading-[1.7] max-w-md mb-6 lg:mb-10"
          >
            {heroSubtitle}
          </p>

          <div ref={ctaRef} className="flex flex-col gap-3 mb-4 lg:mb-6 w-full max-w-sm">
            <Link
              href="/is-ingilizcesi-kursu"
              className="bg-[#1B365D] text-white font-bold text-[13px] tracking-widest px-7 py-4 rounded-2xl flex items-center justify-center gap-2 text-center w-full hover:bg-[#0ea5e9] transition-colors duration-300 shadow-md"
            >
              <Icon name="AcademicCapIcon" size={16} />
              {heroCta1Text}
            </Link>
            <Link
              href="/e-kitaplar"
              className="bg-white border-2 border-[#1B365D] text-[#1B365D] font-bold text-[13px] tracking-widest px-7 py-4 rounded-2xl flex items-center justify-center gap-2 text-center w-full hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors duration-300 shadow-sm"
            >
              <Icon name="BookOpenIcon" size={16} />
              {heroCta2Text}
            </Link>
          </div>

          {/* Tertiary link — kurumsal kaybolmasın (§8: → /cozumler, NOT /iletisim) */}
          <div className="mb-6 lg:mb-10 max-w-sm">
            <Link
              href="/cozumler"
              className="text-[12px] text-gray-500 hover:text-[#0ea5e9] transition-colors inline-flex items-center gap-1.5"
            >
              Şirketiniz için eğitim mi arıyorsunuz? <span className="font-semibold text-[#1B365D] hover:text-[#0ea5e9]">Kurumsal Çözümler →</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:gap-6 pt-5 lg:pt-8 border-t border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e8f0fe]">
                <Icon name="BookOpenIcon" size={16} style={{ color: '#082567' }} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1B365D]">Oxford</p>
                <p className="text-[10px] text-gray-400 tracking-wide">University Press</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e8f0fe]">
                <Icon name="VideoCameraIcon" size={16} style={{ color: '#082567' }} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1B365D]">Zoom</p>
                <p className="text-[10px] text-gray-400 tracking-wide">Çevrimiçi Dersler</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e8f0fe]">
                <Icon name="ChartBarIcon" size={16} style={{ color: '#082567' }} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#1B365D]">A1 – C2</p>
                <p className="text-[10px] text-gray-400 tracking-wide">Tüm Seviyeler</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center lg:justify-end order-first lg:order-last">
          <div className="relative w-full max-w-[480px] sm:max-w-[560px] aspect-[16/10] sm:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <AppImage
              src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Profesyoneller Zoom üzerinden çevrimiçi İş İngilizcesi dersi yapıyor, modern ofis ortamı"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,37,103,0.15) 0%, transparent 60%)' }} />

            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 rounded-2xl">
              <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 bg-[#0ea5e9]" />
              <span className="text-[11px] sm:text-[12px] font-semibold text-[#1B365D] whitespace-nowrap">{heroBadge}</span>
            </div>

            <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg p-3 sm:p-4 rounded-2xl">
              <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-1">ORTALAMA GELİŞİM</p>
              <div className="flex items-end gap-1.5">
                <span className="text-[24px] sm:text-[28px] font-extrabold leading-none text-[#0ea5e9]">{heroStatValue}</span>
                <span className="text-[13px] sm:text-[14px] font-bold mb-1 text-[#0ea5e9]">{heroStatLabel}</span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">{heroStatNote}</p>
            </div>
          </div>

          <div className="w-full max-w-[480px] sm:max-w-[560px] mt-3 flex justify-center">
            <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase">
              BUSINESS ENGLISH FOR PROFESSIONALS
            </span>
          </div>

          <div className="absolute -bottom-6 -left-6 w-32 h-32 -z-10 hidden lg:block bg-[#0ea5e9]/15 rounded-full blur-2xl" />
        </div>
      </div>
    </section>
  );
}
