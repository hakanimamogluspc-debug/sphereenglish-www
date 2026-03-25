'use client';
import React, { useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Metric {
  value: string;
  label: string;
  sub: string;
  fill: number;
}

const metrics: Metric[] = [
  { value: '%87', label: 'Katılım Oranı', sub: 'Ortalama ders devam yüzdesi', fill: 87 },
  { value: '+2.1', label: 'Seviye Artışı', sub: 'Ortalama CEFR seviye gelişimi', fill: 84 },
  { value: '%94', label: 'Memnuniyet', sub: 'Kurumsal müşteri memnuniyeti', fill: 94 },
];

const dashboardFeatures = [
  {
    icon: 'ChartBarIcon',
    title: 'Aylık Gelişim Raporları',
    description: 'Her çalışan için detaylı ilerleme raporu. Seviye değişimleri, güçlü ve geliştirilmesi gereken alanlar.',
  },
  {
    icon: 'ClipboardDocumentCheckIcon',
    title: 'Katılım Takibi',
    description: 'Ders devam oranları, tamamlanan modüller ve ödev teslim istatistikleri anlık olarak izlenir.',
  },
  {
    icon: 'TrophyIcon',
    title: 'Performans Değerlendirmesi',
    description: 'Dönemsel sınavlar ve konuşma değerlendirmeleriyle çalışan gelişimini somut verilerle ölçün.',
  },
  {
    icon: 'DocumentChartBarIcon',
    title: 'Yönetici Paneli',
    description: 'İK ve yöneticiler için özet dashboard. Tüm ekibin eğitim durumunu tek ekranda görün.',
  },
];

export default function RaporlamaSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.reveal-card');
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
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const bars = barsRef.current?.querySelectorAll('.progress-bar');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target as HTMLElement;
            const fill = bar.dataset.fill || '0';
            bar.style.width = `${fill}%`;
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.5 }
    );
    bars?.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="raporlama" className="py-20 lg:py-28 bg-gradient-to-br from-[#f0f4f8] to-white" ref={sectionRef}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            RAPORLAMA & TAKİP
          </span>
          <h2 className="text-[34px] lg:text-[46px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.12] mb-4">
            Eğitimin değerini<br />
            <span className="text-[#0ea5e9]">verilerle kanıtlayın.</span>
          </h2>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10" ref={barsRef}>
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="reveal-card bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
              data-delay={i * 100}
            >
              <p className="text-[44px] font-extrabold leading-none mb-1 text-[#1B365D]">
                {m.value}
              </p>
              <p className="text-[13px] font-bold text-[#1B365D] mb-1">{m.label}</p>
              <p className="text-[12px] text-gray-400 mb-5">{m.sub}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="progress-bar h-full rounded-full transition-all duration-1000 ease-out bg-[#0ea5e9]"
                  data-fill={m.fill}
                  style={{ width: '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {dashboardFeatures.map((feat, i) => (
            <div
              key={feat.title}
              className="reveal-card bg-[#f8fafc] border border-gray-100 rounded-3xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-300"
              data-delay={i * 90}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#e8f0fe]">
                <Icon name={feat.icon as any} size={20} style={{ color: '#082567' }} />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-[#1B365D] mb-2">
                  {feat.title}
                </h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard mockup visual */}
        <div
          className="rounded-3xl border border-gray-100 overflow-hidden reveal-card shadow-sm"
          data-delay={200}
          style={{ background: '#f8fafc' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-[#1B365D] rounded-t-3xl overflow-hidden">
            <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex-shrink-0" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex-shrink-0" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex-shrink-0" />
            <span className="ml-2 text-[10px] sm:text-[11px] font-bold text-white/70 tracking-widest truncate">Sphere English — Yönetici Paneli</span>
          </div>
          <div className="p-4 lg:p-10 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { label: 'Aktif Çalışan', value: '24', icon: 'UserGroupIcon' },
              { label: 'Bu Ay Ders', value: '96', icon: 'CalendarDaysIcon' },
              { label: 'Ort. Devam', value: '%89', icon: 'ChartBarIcon' },
              { label: 'Tamamlanan Modül', value: '312', icon: 'CheckCircleIcon' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-400 leading-tight">{stat.label}</span>
                  <Icon name={stat.icon as any} size={14} style={{ color: '#082567' }} />
                </div>
                <p className="text-[22px] sm:text-[28px] font-extrabold leading-none text-[#1B365D]">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="px-4 lg:px-10 pb-6 lg:pb-8 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            {['Ahmet Y. — B1 → B2 (+1 seviye)', 'Zeynep K. — A2 → B1 (+1 seviye)', 'Mert D. — B2 → C1 (+1 seviye)'].map((emp) => (
              <div key={emp} className="bg-white border border-gray-100 rounded-2xl px-3 sm:px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#e8f0fe]">
                  <Icon name="UserIcon" size={14} style={{ color: '#082567' }} />
                </div>
                <span className="text-[12px] sm:text-[13px] font-medium text-[#1B365D] break-words min-w-0">{emp}</span>
                <Icon name="ArrowTrendingUpIcon" size={14} style={{ color: '#0ea5e9' }} className="ml-auto flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}