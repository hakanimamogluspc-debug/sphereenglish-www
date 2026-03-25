'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BentoItem {
  icon: string;
  title: string;
  description: string;
  size: 'normal' | 'wide' | 'tall';
  accent?: boolean;
}

const bentoItems: BentoItem[] = [
  {
    icon: 'EnvelopeIcon',
    title: 'E-posta Yazımı',
    description: 'Profesyonel iş yazışmaları, resmi talepler, müzakere e-postaları ve raporlama dili.',
    size: 'wide',
    accent: false,
  },
  {
    icon: 'PresentationChartLineIcon',
    title: 'Sunum Teknikleri',
    description: 'Boardroom sunumları, ürün tanıtımları ve veri odaklı raporlama becerileri.',
    size: 'normal',
    accent: false,
  },
  {
    icon: 'ChatBubbleLeftRightIcon',
    title: 'Müzakere Dili',
    description: 'Fiyat görüşmeleri, sözleşme müzakereleri ve çatışma çözümü için güçlü dil kalıpları.',
    size: 'normal',
    accent: true,
  },
  {
    icon: 'PhoneIcon',
    title: 'Telefon & Video Görüşmeleri',
    description: 'Uluslararası konferans görüşmeleri, müşteri toplantıları ve takip iletişimi.',
    size: 'normal',
    accent: false,
  },
  {
    icon: 'DocumentTextIcon',
    title: 'Rapor & Teklif Yazımı',
    description: 'İş teklifleri, proje raporları ve yönetici özetleri hazırlama.',
    size: 'wide',
    accent: false,
  },
  {
    icon: 'UserGroupIcon',
    title: 'Toplantı Yönetimi',
    description: 'Toplantı açma, gündem yürütme, fikir savunma ve karar alma süreçleri.',
    size: 'normal',
    accent: false,
  },
];

export default function BentoGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.reveal-card');
    if (!cards) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseInt(el.dataset.delay || '0');
            setTimeout(() => el.classList.add('visible'), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="ders-icerigi" className="py-20 lg:py-28 bg-white" ref={sectionRef}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            DERS İÇERİKLERİ
          </span>
          <h2 className="text-[34px] lg:text-[46px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.12] mb-4">
            İş hayatında gerçekten<br />
            <span className="text-[#0ea5e9]">kullandığınız İngilizce.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bentoItems.map((item, i) => {
            return (
              <div
                key={item.title}
                className="reveal-card rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow duration-300 bg-[#1B365D]"
                data-delay={i * 90}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <Icon
                    name={item.icon as any}
                    size={24}
                    style={{ color: 'white' }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3
                    className="text-[20px] font-extrabold mb-2"
                    style={{ color: '#FFFFFF' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed"
                    style={{ color: '#E8E8E8' }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Bottom tag */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00BCD4' }}
                  />
                  <span
                    className="text-[11px] font-bold tracking-[0.18em]"
                    style={{ color: '#00BCD4' }}
                  >
                    GERÇEK İŞ SENARYOLARI
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}