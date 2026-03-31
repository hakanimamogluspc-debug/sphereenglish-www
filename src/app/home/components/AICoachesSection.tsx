'use client';
import React, { useRef, useEffect } from 'react';

const coaches = [
  {
    id: 'pronunciation',
    tag: 'Yapay Zeka',
    title: 'Telaffuz Koçu',
    subtitle: 'Sizi dinliyor, anında geri bildirim veriyor.',
    description:
      'Çalışanlarınız kendi hızında, utanmadan, istediği zaman telaffuz pratiği yapabilir. Yapay zeka her kelimeyi analiz eder, yanlışı anında düzeltir.',
    color: '#0ea5e9',
    bgColor: '#e8f4fd',
    features: [
      'Kelime bazında doğruluk puanı',
      'Tonlama ve vurgu analizi',
      'Farklı AI öğretmen sesleri',
      'Hazır pratik cümleleri',
      'Anında sesli geri bildirim',
    ],
    iconPath: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8',
    stat: { value: 'Gerçek Zamanlı', label: 'Ses Analizi' },
  },
  {
    id: 'writing',
    tag: 'Yapay Zeka',
    title: 'Yazma Koçu',
    subtitle: 'Yazdığı İngilizceyi düzeltiyor, geliştiriyor.',
    description:
      "İş e-postası, resmi mektup veya rapor — çalışanlar yazdıklarını yapay zekaya gönderir, A1'den C2'ye kadar seviye tespiti ve kapsamlı geri bildirim alır.",
    color: '#6366f1',
    bgColor: '#ede9fe',
    features: [
      'Dilbilgisi hatası tespiti ve düzeltme',
      'Kelime hazinesi önerileri',
      'A1–C2 seviye değerlendirmesi',
      'Geliştirilmiş metin versiyonu',
      'İş e-postası, rapor, essay desteği',
    ],
    iconPath: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z',
    stat: { value: '5 Yazı Türü', label: 'Tam Destek' },
  },
];

export default function AICoachesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.ai-card-reveal');
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
    <section id="yapay-zeka-koclar" ref={sectionRef} className="py-20 lg:py-28 bg-[#f8fafc]">
      <style>{`
        .ai-card-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.55s ease, transform 0.55s ease; }
        .ai-card-reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            YAPAY ZEKA KOÇLARIMIZ
          </span>
          <h2 className="text-[34px] lg:text-[46px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.12] mb-4">
            7/24 yanında olan<br />
            <span className="text-[#0ea5e9]">kişisel İngilizce koçu.</span>
          </h2>
          <p className="text-[15px] text-gray-500 leading-relaxed max-w-lg mx-auto">
            Çalışanlarınız öğretmen beklemek zorunda değil. Sphere English&apos;in yapay zeka koçları istedikleri an devreye giriyor.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {coaches.map((coach, i) => (
            <div
              key={coach.id}
              className="ai-card-reveal bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
              data-delay={i * 150}
            >
              <div className="h-1.5 w-full" style={{ backgroundColor: coach.color }} />
              <div className="p-8 lg:p-10 flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: coach.bgColor, color: coach.color }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d={coach.iconPath} />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.18em] px-3 py-1 rounded-full" style={{ backgroundColor: coach.bgColor, color: coach.color }}>
                    {coach.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-[24px] font-extrabold text-[#1B365D] mb-1">{coach.title}</h3>
                  <p className="text-[14px] font-semibold" style={{ color: coach.color }}>{coach.subtitle}</p>
                </div>
                <p className="text-[14px] text-gray-500 leading-relaxed">{coach.description}</p>
                <ul className="space-y-2.5">
                  {coach.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-[13px] text-gray-700">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: coach.bgColor }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={coach.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl self-start" style={{ backgroundColor: coach.bgColor }}>
                  <span className="text-[18px] font-extrabold" style={{ color: coach.color }}>{coach.stat.value}</span>
                  <span className="text-[12px] text-gray-500 font-medium">{coach.stat.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-[14px] text-gray-400 mb-4">
            Tüm yapay zeka koçlarımız <span className="font-semibold text-[#1B365D]">app.sphereenglish.com</span> üzerinden erişilebilir.
          </p>
          <a
            href="https://app.sphereenglish.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#1B365D] text-white text-[14px] font-bold hover:bg-[#0ea5e9] transition-colors duration-200"
          >
            Uygulamayı Keşfet
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
