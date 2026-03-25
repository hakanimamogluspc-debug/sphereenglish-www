'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface WhyCard {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

const whyCards: WhyCard[] = [
  {
    icon: 'GlobeAltIcon',
    title: 'Uluslararası Müşteri İletişimi',
    description: 'Çalışanlarınız yabancı müşterilerle güvenle iletişim kurabilir, global iş fırsatlarını kaçırmaz.',
    tag: 'Global Rekabet',
  },
  {
    icon: 'PresentationChartBarIcon',
    title: 'Toplantı & Sunum Becerileri',
    description: 'Uluslararası toplantılarda etkili sunum yapma, fikir savunma ve müzakere yürütme yetkinliği.',
    tag: 'Profesyonel Gelişim',
  },
  {
    icon: 'EnvelopeOpenIcon',
    title: 'Profesyonel E-posta Yazımı',
    description: 'İş dünyasının standartlarına uygun, etkileyici ve net İngilizce yazışma becerisi kazandırın.',
    tag: 'Yazılı İletişim',
  },
  {
    icon: 'ChartBarSquareIcon',
    title: 'Ölçülebilir Sonuçlar',
    description: 'Aylık gelişim raporları ve performans değerlendirmeleriyle eğitimin ROI\'sini somut verilerle takip edin.',
    tag: 'Veri Odaklı',
  },
  {
    icon: 'BuildingOffice2Icon',
    title: 'Kuruma Özel İçerik',
    description: 'Sektörünüze ve şirketinizin ihtiyaçlarına göre özelleştirilmiş müfredat ve vaka çalışmaları.',
    tag: 'Kişiselleştirilmiş',
  },
  {
    icon: 'AcademicCapIcon',
    title: 'Sertifikalı Eğitmenler',
    description: 'CELTA/DELTA sertifikalı, iş dünyası deneyimli İngiliz ve Amerikan eğitmenlerle birebir çalışın.',
    tag: 'Uzman Kadro',
  },
];

export default function NedenBizSection() {
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
      { threshold: 0.12 }
    );
    cards.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="neden-biz" className="py-20 lg:py-28 bg-white" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            NEDEN SPHERE ENGLISH?
          </span>
          <h2 className="text-[34px] lg:text-[46px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.12] mb-4">
            Şirketinizi global arenada<br />
            <span className="text-[#0ea5e9]">rekabetçi kılan eğitim.</span>
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-md mx-auto">
            Sadece dil öğretmiyoruz. Çalışanlarınıza iş dünyasında fark yaratan iletişim gücü kazandırıyoruz.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyCards.map((card, i) => (
            <div
              key={card.title}
              className="reveal-card bg-[#f8fafc] border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default"
              data-delay={i * 100}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#e8f0fe]">
                  <Icon name={card.icon as any} size={22} style={{ color: '#082567' }} />
                </div>
                <span className="text-[10px] font-bold tracking-[0.18em] px-3 py-1 rounded-full bg-[#0ea5e9]/10 text-[#0ea5e9]">
                  {card.tag}
                </span>
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#1B365D] mb-2">
                  {card.title}
                </h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
