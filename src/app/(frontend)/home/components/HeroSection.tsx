'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

export interface HeroBanner {
  id: number; slot: 'ebook' | 'course' | 'general';
  eyebrow: string | null; titleLine1: string; titleLine2: string | null; titleAccent: string | null; subtitle: string | null;
  cta1Text: string | null; cta1Url: string | null; cta2Text: string | null; cta2Url: string | null;
  imageUrl: string | null; videoUrl?: string | null; imageAlt: string | null; imageBadge: string | null;
  campaign?: { label: string; endsAt: string | null } | null;
}

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
  /** Admin → Ana Sayfa Banner'ları. Boşsa varsayılan tek slayt gösterilir. */
  banners?: HeroBanner[];
}

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
const ROTATE_MS = 7000;

export default function HeroSection({ data, banners }: HeroProps = {}) {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Varsayılan slayt (banner yoksa) — eski sabit hero içeriği
  const fallback: HeroBanner = {
    id: 0, slot: 'general', eyebrow: null,
    titleLine1: 'İş İngilizcesinde', titleLine2: 'Bir Üst Seviyeye', titleAccent: 'Geç.',
    subtitle: 'Türk profesyoneller için gerçek iş hayatına odaklanan online kurslar, dijital kaynaklar ve AI destekli pratik. Toplantıdan e-postaya, mülakattan pazarlığa kariyerinizde daha net ve güvenli iletişim.',
    cta1Text: 'KURSLARI İNCELE', cta1Url: '/is-ingilizcesi-kursu', cta2Text: 'E-KİTAPLARI KEŞFET', cta2Url: '/e-kitaplar',
    imageUrl: FALLBACK_IMAGE, imageAlt: 'Profesyoneller Zoom üzerinden çevrimiçi İş İngilizcesi dersi yapıyor, modern ofis ortamı',
    imageBadge: data?.heroBadge ?? 'Canlı Ders Devam Ediyor',
  };
  const slides = banners && banners.length > 0 ? banners : [fallback];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[idx % slides.length];
  const heroStatValue = data?.heroStatValue ?? '50+';
  const heroStatLabel = data?.heroStatLabel ?? 'Kurumsal müşteri';

  // Hareketi azaltma tercihi → video yerine yalnız görsel
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    setReduceMotion(mq.matches);
    const on = () => setReduceMotion(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);

  const go = useCallback((d: number) => setIdx((i) => (i + d + slides.length) % slides.length), [slides.length]);

  // Otomatik kayma (fareyle üzerindeyken / sekme gizliyken / hareket azaltma açıkken durur)
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => { if (!document.hidden) go(1); }, ROTATE_MS);
    return () => clearInterval(t);
  }, [slides.length, paused, go]);

  // Parmakla kaydırma
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f0f4f8] via-white to-[#e8f0fe]" style={{ paddingTop: '72px' }}
      aria-roledescription="carousel" aria-label="Öne çıkanlar"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#082567]/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0ea5e9]/8 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 lg:h-[calc(100vh-72px)] lg:min-h-[560px] lg:max-h-[760px] items-center pt-0 pb-8 lg:py-0">

        <div className="flex flex-col justify-center lg:pr-12 lg:py-6">
          {/* Üst etiket yalnızca kampanyada (ör. "3 AL 2 ÖDE · 30 Kasım'a kadar") */}
          {slide.campaign && slide.eyebrow && (
            <span key={`eb-${slide.id}`} className="inline-flex self-start items-center gap-2 mb-3 lg:mb-4 px-3 py-1.5 rounded-full bg-[#1e3a6e] text-white text-[11px] font-extrabold tracking-[0.14em]">
              {slide.eyebrow}
              {slide.campaign.endsAt && (
                <span className="font-semibold tracking-normal text-[#4dcfff]">
                  · {new Date(slide.campaign.endsAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })}'e kadar
                </span>
              )}
            </span>
          )}
          <h1
            key={`h-${slide.id}`}
            ref={headlineRef}
            className="text-[30px] sm:text-[42px] lg:text-[46px] xl:text-[50px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#1B365D] mt-0 mb-3 lg:mb-4"
          >
            <span className="block">{slide.titleLine1}</span>
            {(slide.titleLine2 || slide.titleAccent) && (
              <span className="block">
                {slide.titleLine2}{slide.titleLine2 && slide.titleAccent ? ' ' : ''}
                {slide.titleAccent && <span className="text-[#0ea5e9]">{slide.titleAccent}</span>}
              </span>
            )}
          </h1>

          <p
            key={`p-${slide.id}`}
            ref={subRef}
            className="text-[14px] lg:text-[16px] text-gray-500 leading-[1.6] max-w-[480px] mb-5"
          >
            {slide.subtitle}
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 mb-4 w-full sm:w-auto">
            {slide.cta1Text && slide.cta1Url && (
              <Link
                href={slide.cta1Url}
                className="bg-[#1B365D] text-white font-bold text-[12px] tracking-widest px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-center hover:bg-[#0ea5e9] transition-colors duration-300 shadow-md"
              >
                <Icon name={slide.slot === 'ebook' ? 'BookOpenIcon' : 'AcademicCapIcon'} size={16} />
                {slide.cta1Text}
              </Link>
            )}
            {slide.cta2Text && slide.cta2Url && (
              <Link
                href={slide.cta2Url}
                className="bg-white border-2 border-[#1B365D] text-[#1B365D] font-bold text-[12px] tracking-widest px-6 py-3 rounded-2xl flex items-center justify-center gap-2 text-center hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors duration-300 shadow-sm"
              >
                <Icon name={slide.slot === 'course' ? 'PlayCircleIcon' : 'BookOpenIcon'} size={16} />
                {slide.cta2Text}
              </Link>
            )}
          </div>

          {/* Slayt göstergeleri + kurumsal bağlantı (§8: → /cozumler) tek satırda */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-5">
            {slides.length > 1 && (
              <div className="flex items-center gap-2.5" role="tablist" aria-label="Slaytlar">
                <button type="button" onClick={() => go(-1)} aria-label="Önceki" className="w-7 h-7 rounded-full border border-gray-200 text-[#1B365D] hover:border-[#0ea5e9] flex items-center justify-center">‹</button>
                {slides.map((s2, i) => (
                  <button key={s2.id} type="button" role="tab" aria-selected={i === idx} aria-label={`${i + 1}. slayt`}
                    onClick={() => setIdx(i)}
                    className={`h-2 rounded-full transition-all ${i === idx ? 'w-7 bg-[#1B365D]' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} />
                ))}
                <button type="button" onClick={() => go(1)} aria-label="Sonraki" className="w-7 h-7 rounded-full border border-gray-200 text-[#1B365D] hover:border-[#0ea5e9] flex items-center justify-center">›</button>
              </div>
            )}
            <Link
              href="/cozumler"
              className="text-[12px] text-gray-500 hover:text-[#0ea5e9] transition-colors inline-flex items-center gap-1.5"
            >
              Şirketiniz için mi? <span className="font-semibold text-[#1B365D] hover:text-[#0ea5e9]">Kurumsal Çözümler →</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 lg:gap-6 pt-4 border-t border-gray-200 max-w-[520px]">
            {[
              { icon: 'BookOpenIcon', t: 'Oxford', s: 'University Press' },
              { icon: 'VideoCameraIcon', t: 'Zoom', s: 'Çevrimiçi Dersler' },
              { icon: 'ChartBarIcon', t: 'A1 – C2', s: 'Tüm Seviyeler' },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#e8f0fe]">
                  <Icon name={x.icon} size={15} style={{ color: '#082567' }} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1B365D] leading-tight">{x.t}</p>
                  <p className="text-[10px] text-gray-400 tracking-wide">{x.s}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Görsel alanı — çerçevesiz; kenarları zemine yumuşakça eriyor (mobilde alt, masaüstünde sol + alt) */}
        <div className="relative order-first lg:order-last w-[calc(100%+2rem)] sm:w-full aspect-[4/5] max-h-[540px] sm:aspect-[4/3] sm:max-h-[600px] lg:aspect-auto lg:max-h-none lg:self-stretch -mx-4 sm:mx-0 lg:w-[calc(100%+2.5rem)] lg:-mr-10 lg:ml-0">
          {(() => {
            const isCover = slide.slot === 'ebook';
            const fade = '[mask-image:linear-gradient(to_top,transparent_0%,#000_22%)] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_26%),linear-gradient(to_top,transparent_0%,#000_14%)] lg:[mask-composite:intersect] lg:[-webkit-mask-composite:source-in]';
            const showVideo = !!slide.videoUrl && !isCover && !reduceMotion;
            return (
              <div key={`media-${slide.id}`} className={`absolute inset-0 animate-[heroFade_.7s_ease-out] ${fade}`}>
                <AppImage
                  src={slide.imageUrl || FALLBACK_IMAGE}
                  alt={slide.imageAlt || slide.titleLine1}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={isCover ? 'object-cover object-[50%_62%]' : 'object-cover object-[50%_20%]'}
                  priority={idx === 0}
                />
                {showVideo && (
                  <video
                    className="absolute inset-0 w-full h-full object-cover object-[50%_20%]"
                    src={slide.videoUrl!}
                    autoPlay muted loop playsInline preload="metadata"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })()}

          {(slide.campaign?.label ?? slide.imageBadge) && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-[14%] lg:right-10 bg-white/90 backdrop-blur-md shadow-md px-3 py-1.5 flex items-center gap-2 rounded-full">
              <span className="w-2 h-2 rounded-full animate-pulse flex-shrink-0 bg-[#13a9e0]" />
              <span className="text-[11px] sm:text-[12px] font-semibold text-[#1e3a6e] whitespace-nowrap">{slide.campaign?.label ?? slide.imageBadge}</span>
            </div>
          )}

          <div className="absolute bottom-3 right-4 sm:bottom-6 sm:right-6 lg:bottom-[12%] lg:right-10 bg-white/90 backdrop-blur-md shadow-md px-4 py-2.5 rounded-2xl">
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-gray-500 mb-0.5">BİZE GÜVENENLER</p>
            <div className="flex items-end gap-1.5">
              <span className="text-[22px] sm:text-[26px] font-extrabold leading-none text-[#0e7da6]">{heroStatValue}</span>
              <span className="text-[12px] sm:text-[13px] font-bold mb-0.5 text-[#0e7da6]">{heroStatLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
