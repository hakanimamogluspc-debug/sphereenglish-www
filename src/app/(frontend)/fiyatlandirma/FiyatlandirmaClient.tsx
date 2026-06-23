'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PLAN_CATALOG, COMPARISON_TABLE, type PlanDefinition } from '@/lib/plans';

const TIER_STYLE: Record<PlanDefinition['tier'], { color: string; bg: string; ring: string }> = {
  core:    { color: '#475569', bg: '#f8fafc', ring: '#cbd5e1' },
  pro:     { color: '#4f46e5', bg: '#eef2ff', ring: '#818cf8' },
  premium: { color: '#7c3aed', bg: '#faf5ff', ring: '#c4b5fd' },
};

function formatTRY(amount: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

const FAQS = [
  {
    q: 'Ödeme nasıl alınıyor? Kart bilgilerim güvende mi?',
    a: 'Tüm ödemeler Iyzico üzerinden 3D Secure korumalı olarak alınır. Kart bilgileri Iyzico\'nun PCI-DSS uyumlu altyapısında işlenir, Sphere English sunucularına asla ulaşmaz.',
  },
  {
    q: 'Aboneliği istediğim an iptal edebilir miyim?',
    a: 'Evet. Aboneliğim sayfasından tek tıkla iptal edebilirsin. İptal sonrası mevcut ödeme dönemin sonuna kadar erişimin devam eder, yeni tahsilat yapılmaz.',
  },
  {
    q: 'Yıllık planda %17 indirim nasıl hesaplanıyor?',
    a: 'Aylık fiyatınızı 12 ay yerine 10 ay üzerinden ödersiniz. Aylık planla karşılaştırıldığında %17 (yaklaşık 2 ay) tasarruf sağlar. Uzun vadeli öğrenme planı yapanlar için ideal.',
  },
  {
    q: 'KDV dahil mi?',
    a: 'Evet, sayfada gösterilen tüm fiyatlar KDV dahildir. E-fatura kayıtlı e-posta adresine otomatik iletilir.',
  },
  {
    q: 'Plan değiştirebilir miyim?',
    a: 'Evet. Aboneliğim sayfasından üst plana geçebilirsin. Aradaki fark mevcut dönem üzerinden orantısal hesaplanır. Alt plana geçiş bir sonraki dönemde geçerli olur.',
  },
  {
    q: '14 gün iade hakkı nasıl çalışıyor?',
    a: 'Aktif kullanım olmayan abonelikler için ödeme tarihinden itibaren 14 gün içinde tam iade. Kullanım başlamışsa orantısal iade uygulanır. info@sphereenglish.com adresinden talep iletilir.',
  },
  {
    q: '10+ çalışanlı şirketim için kurumsal indirim var mı?',
    a: 'Evet. Kurumsal teklif için /iletisim sayfasından bize ulaşabilirsin. Ekip büyüklüğüne göre %15-40 arası indirim, dedicated success manager ve kurumsal sertifika programı sunuyoruz.',
  },
  {
    q: 'Hangi cihazlarda kullanabilirim?',
    a: 'Sphere English platformu web (Chrome, Safari, Firefox, Edge) ve mobil (iOS Safari, Android Chrome) üzerinde tam fonksiyonel çalışır. Bir hesap, tüm cihazlarda senkron.',
  },
];

export default function FiyatlandirmaClient() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Gösterilecek 3 plan (seçili faturalama döneminden)
  const visiblePlans = useMemo(
    () => PLAN_CATALOG.filter((p) => p.billingType === billing),
    [billing],
  );

  return (
    <>
      {/* Plan kartları */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-2 pb-16">
        {/* Tab */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-100">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                billing === 'monthly' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all relative ${
                billing === 'yearly' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
              }`}
            >
              Yıllık
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                %17 indirim
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {visiblePlans.map((p) => {
            const style = TIER_STYLE[p.tier];
            const monthlyEquivalent = p.billingType === 'yearly' ? Math.round(p.amount / 12) : null;
            // Yıllık planlar için "ne olurdu" kıyas fiyatı: aylık eşdeğer plan × 12.
            // Plans kataloğunda aylık fiyatı: aynı tier'ın monthly versiyonu.
            const monthlyTwin = p.billingType === 'yearly'
              ? PLAN_CATALOG.find(x => x.tier === p.tier && x.billingType === 'monthly')
              : null;
            const yearlyComparisonPrice = monthlyTwin ? monthlyTwin.amount * 12 : null;
            return (
              <div
                key={p.code}
                className="relative rounded-2xl p-7 border-2 flex flex-col bg-white transition-all hover:shadow-lg"
                style={{
                  borderColor: p.popular ? style.color : style.ring,
                  background: p.popular ? style.bg : '#fff',
                  boxShadow: p.popular ? '0 10px 32px rgba(79, 70, 229, 0.12)' : undefined,
                }}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-white inline-flex items-center gap-1" style={{ background: style.color }}>
                    ⭐ En Popüler
                  </span>
                )}
                <h3 className="font-bold text-[20px] text-[#1B365D] mb-1">{p.label}</h3>
                <p className="text-[12px] text-gray-500 mb-5">
                  {p.tier === 'core' && 'Başlangıç için ideal'}
                  {p.tier === 'pro' && 'En çok tercih edilen'}
                  {p.tier === 'premium' && 'Profesyoneller için'}
                </p>

                <div className="mb-5">
                  {/* Yıllık'ta üstü çizili kıyas fiyat */}
                  {yearlyComparisonPrice && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[15px] text-gray-400 line-through">
                        {formatTRY(yearlyComparisonPrice)}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        %17 indirim
                      </span>
                    </div>
                  )}
                  <div className="text-[36px] font-extrabold leading-none mb-1" style={{ color: style.color }}>
                    {formatTRY(p.amount)}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {p.billingType === 'monthly' ? 'aylık' : 'yıllık'} · KDV dahil
                  </div>
                  {monthlyEquivalent && (
                    <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                      ≈ ayda {formatTRY(monthlyEquivalent)}
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 text-[13px] text-gray-700 mb-6 flex-1">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: style.color }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/abonelik?plan=${p.code}`}
                  className="block w-full text-center py-3 rounded-xl font-bold text-[13px] text-white transition-all hover:opacity-90"
                  style={{ background: style.color }}
                >
                  {p.tier === 'core' ? 'Hemen Başla' : p.tier === 'pro' ? 'Pro\'ya Geç' : 'Premium\'a Geç'}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-8">
          Tüm planlar Oxford University Press müfredatı ve AI destekli koçluk içerir.{' '}
          <Link href="/iletisim" className="text-[#0ea5e9] font-semibold underline">Kurumsal teklif</Link>{' '}
          için bize ulaşın.
        </p>
      </section>

      {/* Karşılaştırma tablosu */}
      <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-16">
        <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#1B365D] text-center mb-3">
          Planları Karşılaştır
        </h2>
        <p className="text-[15px] text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Hangi plan sana en uygun? Özellikleri yan yana gör.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-[12px] font-bold tracking-wider uppercase text-gray-500 border-b border-gray-200"></th>
                <th className="p-4 text-center border-b border-gray-200">
                  <div className="text-[15px] font-bold text-[#1B365D]">Sphere Core</div>
                </th>
                <th className="p-4 text-center border-b-2 border-[#4f46e5] bg-[#eef2ff]">
                  <div className="text-[15px] font-bold text-[#4f46e5] inline-flex items-center gap-1">
                    Sphere Pro <span>⭐</span>
                  </div>
                </th>
                <th className="p-4 text-center border-b border-gray-200">
                  <div className="text-[15px] font-bold text-[#1B365D]">Sphere Premium</div>
                </th>
              </tr>
              {/* Fiyat satırı */}
              <tr className="text-[12px]">
                <th className="text-left p-3 font-bold text-[#1B365D] border-b border-gray-100 align-top">
                  <div>Aylık</div>
                  <div className="text-[10px] font-normal text-gray-500 mt-1">Yıllık (2 ay bedava)</div>
                </th>
                <td className="p-3 text-center border-b border-gray-100">
                  <div className="font-bold text-[#1B365D]">349 TL</div>
                  <div className="text-[10px] text-gray-500 mt-1">3.490 TL</div>
                </td>
                <td className="p-3 text-center border-b border-gray-100 bg-[#eef2ff]/40">
                  <div className="font-bold text-[#4f46e5]">699 TL</div>
                  <div className="text-[10px] text-[#4f46e5]/70 mt-1">6.990 TL</div>
                </td>
                <td className="p-3 text-center border-b border-gray-100">
                  <div className="font-bold text-[#1B365D]">1.199 TL</div>
                  <div className="text-[10px] text-gray-500 mt-1">11.990 TL</div>
                </td>
              </tr>
            </thead>
            <tbody className="text-[13px] text-gray-700">
              {COMPARISON_TABLE.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-4 font-semibold text-[#1B365D]">{row.feature}</td>
                  <td className="p-4 text-center text-gray-700">
                    {row.core === '—' ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      row.core
                    )}
                  </td>
                  <td className="p-4 text-center bg-[#eef2ff]/40 text-[#1B365D] font-medium">
                    {row.pro}
                  </td>
                  <td className="p-4 text-center text-gray-700">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-[12px] text-gray-500 mt-6">
          * Premium aylık canlı koçluk: ayda 1 birebir 30 dakikalık koç oturumu dahildir.
        </p>
      </section>

      {/* SSS */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-2 text-center">SSS</p>
          <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#1B365D] text-center mb-10">
            Sıkça Sorulan Sorular
          </h2>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-[15px] text-[#1B365D]">{f.q}</span>
                  <span className={`flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: '#0ea5e9' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-[14px] text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="text-center text-[14px] text-gray-500 mt-10">
            Aklında başka soru var mı?{' '}
            <Link href="/iletisim" className="text-[#0ea5e9] font-semibold underline">İletişim sayfasından</Link>{' '}
            ulaş, en kısa sürede dönelim.
          </p>
        </div>
      </section>
    </>
  );
}
