'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLAN_CATALOG, type PlanDefinition } from '@/lib/plans';

const TIER_STYLE: Record<PlanDefinition['tier'], { color: string; bg: string; ring: string; chip: string }> = {
  basic:     { color: '#475569', bg: '#f1f5f9', ring: '#cbd5e1', chip: '#64748b' },
  standard:  { color: '#0284c7', bg: '#e0f2fe', ring: '#7dd3fc', chip: '#0ea5e9' },
  premium:   { color: '#4f46e5', bg: '#eef2ff', ring: '#818cf8', chip: '#6366f1' },
  executive: { color: '#7c3aed', bg: '#faf5ff', ring: '#c4b5fd', chip: '#a855f7' },
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
    q: 'Aylık planı istediğim an iptal edebilir miyim?',
    a: 'Evet. Aboneliğim sayfasından tek tıkla iptal edebilirsin. İptal sonrası mevcut ödeme dönemin sonuna kadar erişimin devam eder, yeni tahsilat yapılmaz.',
  },
  {
    q: 'Peşin paket ile aylık plan arasındaki fark nedir?',
    a: 'Peşin paket (3/6/12 aylık) tek seferlik ödemedir, %5-20 arası indirim sağlar ve otomatik yenilenmez. Aylık plan her ayın aynı gününde otomatik tahsilattır.',
  },
  {
    q: 'KDV dahil mi?',
    a: 'Evet, sayfada gösterilen tüm fiyatlar KDV dahildir. Kurumsal alımlar için fatura e-postanıza otomatik iletilir.',
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
  const [tab, setTab] = useState<'recurring' | 'one-time'>('recurring');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const visiblePlans = PLAN_CATALOG.filter((p) => p.billingType === tab);

  return (
    <>
      {/* Plan kartları */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pt-2 pb-16">
        {/* Tab */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-100">
            <button
              onClick={() => setTab('recurring')}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                tab === 'recurring' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
              }`}
            >
              Aylık (Otomatik Yenilenir)
            </button>
            <button
              onClick={() => setTab('one-time')}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all relative ${
                tab === 'one-time' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
              }`}
            >
              Peşin Paket
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">%20'ye varan indirim</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visiblePlans.map((p) => {
            const style = TIER_STYLE[p.tier];
            return (
              <div
                key={p.code}
                className="relative rounded-2xl p-6 border-2 flex flex-col bg-white transition-all hover:shadow-lg"
                style={{
                  borderColor: p.popular ? style.color : style.ring,
                  background: p.popular ? style.bg : '#fff',
                  boxShadow: p.popular ? '0 10px 32px rgba(79, 70, 229, 0.12)' : undefined,
                }}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-white" style={{ background: style.color }}>
                    ⭐ En Popüler
                  </span>
                )}
                {p.discountPercent && (
                  <span className="self-start text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded mb-2 bg-yellow-100 text-yellow-800">
                    %{p.discountPercent} indirim
                  </span>
                )}
                <h3 className="font-bold text-[18px] text-[#1B365D] mb-1">{p.label}</h3>
                <div className="text-[34px] font-extrabold leading-none mb-1" style={{ color: style.color }}>
                  {formatTRY(p.amount)}
                </div>
                <div className="text-[12px] text-gray-500 mb-5">
                  {p.billingType === 'recurring' ? 'her ay · KDV dahil' : `${p.durationMonths} ay süreyle · KDV dahil`}
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
                  Hemen Başla
                </Link>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[13px] text-gray-500 mt-8">
          Tüm planlar Oxford University Press müfredatı, AI Studio ve sertifika programı içerir.
        </p>
      </section>

      {/* Karşılaştırma tablosu */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <h2 className="text-[28px] lg:text-[34px] font-extrabold text-[#1B365D] text-center mb-3">
          Planları Karşılaştır
        </h2>
        <p className="text-[15px] text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Her planda neler var? Sana en uygun olanı seçmek için aşağıdaki tabloya göz at.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-[12px] font-bold tracking-wider uppercase text-gray-500 border-b border-gray-200">Özellik</th>
                <th className="p-4 text-center border-b border-gray-200">
                  <div className="text-[14px] font-bold text-[#1B365D]">Basic</div>
                  <div className="text-[11px] text-gray-500">599 ₺/ay</div>
                </th>
                <th className="p-4 text-center border-b border-gray-200">
                  <div className="text-[14px] font-bold text-[#1B365D]">Standard</div>
                  <div className="text-[11px] text-gray-500">1.799 ₺/ay</div>
                </th>
                <th className="p-4 text-center border-b-2 border-[#4f46e5] bg-[#eef2ff]">
                  <div className="text-[14px] font-bold text-[#4f46e5]">Premium ⭐</div>
                  <div className="text-[11px] text-[#4f46e5]/70">4.499 ₺/ay</div>
                </th>
                <th className="p-4 text-center border-b border-gray-200">
                  <div className="text-[14px] font-bold text-[#1B365D]">Executive</div>
                  <div className="text-[11px] text-gray-500">9.999 ₺/ay</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-gray-700">
              {[
                ['AI Studio temel modüller', '✓', '✓', '✓', '✓'],
                ['Tüm AI Studio modülleri', '—', '✓', '✓', '✓'],
                ['Telaffuz Koçu (Whisper analizi)', '✓', '✓', '✓', '✓'],
                ['İş Senaryoları + Mülakat Simülatörü', '—', '✓', '✓', '✓'],
                ['Sunum Simülatörü + Yazma Koçu', '—', '—', '✓', '✓'],
                ['Aylık birebir koç oturumu', '—', '2', '4', '8'],
                ['Aylık ilerleme raporu', '—', '✓', '✓', '✓'],
                ['Öncelikli destek', '—', '—', '✓', '✓'],
                ['Sertifikalı program çıktısı', '—', '—', '✓', '✓'],
                ['Dedicated success manager', '—', '—', '—', '✓'],
                ['C-suite / liderlik senaryoları', '—', '—', '—', '✓'],
                ['Kişiye özel öğrenme planı', '—', '—', '—', '✓'],
              ].map(([feature, ...cells], i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="p-3.5 font-medium">{feature}</td>
                  {cells.map((c, j) => (
                    <td
                      key={j}
                      className={`p-3.5 text-center ${j === 2 ? 'bg-[#eef2ff]/40' : ''} ${
                        c === '✓' ? 'text-emerald-600 font-bold' : c === '—' ? 'text-gray-300' : 'text-[#1B365D] font-semibold'
                      }`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            <a href="/iletisim" className="text-[#0ea5e9] font-semibold underline">İletişim sayfasından</a>{' '}
            ulaş, en kısa sürede dönelim.
          </p>
        </div>
      </section>
    </>
  );
}
