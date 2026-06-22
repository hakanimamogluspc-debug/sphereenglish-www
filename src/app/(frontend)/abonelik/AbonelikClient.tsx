'use client';

import { useEffect, useState } from 'react';
import type { PlanDefinition } from '@/lib/plans';

interface CheckoutResponse {
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
  conversationId: string;
}

interface Props {
  initialPlanCode?: string;
  initialEmail?: string;
  initialName?: string;
}

const TIER_STYLE: Record<PlanDefinition['tier'], { color: string; bg: string; ring: string }> = {
  basic: { color: '#475569', bg: '#f1f5f9', ring: '#cbd5e1' },
  standard: { color: '#0284c7', bg: '#e0f2fe', ring: '#7dd3fc' },
  premium: { color: '#4f46e5', bg: '#eef2ff', ring: '#818cf8' },
  executive: { color: '#7c3aed', bg: '#faf5ff', ring: '#c4b5fd' },
};

function formatTRY(amount: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AbonelikClient({ initialPlanCode, initialEmail, initialName }: Props) {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [tab, setTab] = useState<'recurring' | 'one-time'>('recurring');
  const [selectedCode, setSelectedCode] = useState<string | null>(initialPlanCode ?? null);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [name, setName] = useState(initialName ?? '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // Plan kataloğunu çek
  useEffect(() => {
    fetch('/api/payment/plans')
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))
      .catch(() => setError('Planlar yüklenemedi. Sayfayı yenilemeyi deneyin.'));
  }, []);

  // URL'de plan varsa otomatik tab'i ayarla
  useEffect(() => {
    if (!initialPlanCode || plans.length === 0) return;
    const plan = plans.find((p) => p.code === initialPlanCode);
    if (plan) setTab(plan.billingType);
  }, [initialPlanCode, plans]);

  // Iyzico Checkout Form HTML'ini sayfaya inject et
  useEffect(() => {
    if (!checkoutHtml) return;
    const container = document.getElementById('iyzipay-checkout-form');
    if (!container) return;
    container.innerHTML = checkoutHtml;
    container.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [checkoutHtml]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedCode) {
      setError('Lütfen bir plan seçin.');
      return;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Geçerli bir e-posta adresi girin.');
      return;
    }
    if (!name || name.trim().length < 2) {
      setError('Ad Soyad girin.');
      return;
    }

    setBusy(true);
    try {
      const r = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planCode: selectedCode,
          email: email.trim().toLowerCase(),
          name: name.trim(),
          phone: phone.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || 'Ödeme başlatılamadı');
        setBusy(false);
        return;
      }
      setCheckoutHtml((data as CheckoutResponse).checkoutFormContent);
    } catch (e: any) {
      setError(e?.message || 'Bilinmeyen hata');
    } finally {
      setBusy(false);
    }
  }

  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-checkout-form');
    if (c) c.innerHTML = '';
  }

  const visiblePlans = plans.filter((p) => p.billingType === tab);
  const selectedPlan = plans.find((p) => p.code === selectedCode);

  return (
    <div>
      {/* Tab — aylık recurring / peşin paket */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-100">
          <button
            type="button"
            onClick={() => setTab('recurring')}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              tab === 'recurring' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
            }`}
          >
            Aylık (Otomatik Yenilenir)
          </button>
          <button
            type="button"
            onClick={() => setTab('one-time')}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              tab === 'one-time' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
            }`}
          >
            Peşin Paket
          </button>
        </div>
      </div>

      {/* Plan kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {visiblePlans.map((p) => {
          const style = TIER_STYLE[p.tier];
          const isSelected = selectedCode === p.code;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => setSelectedCode(p.code)}
              className={`relative text-left rounded-2xl p-5 transition-all border-2 ${
                isSelected ? 'ring-2 ring-offset-2 ring-[#0ea5e9]' : ''
              }`}
              style={{
                borderColor: isSelected ? style.color : (p.popular ? style.color : style.ring),
                background: p.popular || isSelected ? style.bg : '#fff',
                boxShadow: p.popular || isSelected ? '0 6px 24px rgba(0,0,0,0.06)' : undefined,
              }}
            >
              {p.popular && (
                <span className="absolute -top-2 left-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-white" style={{ background: style.color }}>
                  En Popüler
                </span>
              )}
              {p.discountPercent && (
                <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded mb-2 bg-yellow-100 text-yellow-800">
                  %{p.discountPercent} indirim
                </span>
              )}
              <h3 className="font-bold text-[16px] text-[#1B365D] mb-1">{p.label}</h3>
              <div className="text-[28px] font-extrabold mb-1" style={{ color: style.color }}>
                {formatTRY(p.amount)}
              </div>
              <div className="text-[11px] text-gray-500 mb-3">
                {p.billingType === 'recurring' ? 'her ay' : `${p.durationMonths} ay süreyle`}
              </div>
              <ul className="space-y-1.5 text-[12px] text-gray-700">
                {p.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-0.5" style={{ color: style.color }}>✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Bilgi formu */}
      {selectedPlan && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm border border-[#e8f0fe] p-7">
          <h2 className="text-[20px] font-bold text-[#1B365D] mb-1">
            Seçilen Plan: <span style={{ color: TIER_STYLE[selectedPlan.tier].color }}>{selectedPlan.label}</span>
          </h2>
          <p className="text-[14px] text-gray-500 mb-5">
            Toplam: <strong className="text-[#1B365D]">{formatTRY(selectedPlan.amount)}</strong>{' '}
            {selectedPlan.billingType === 'recurring' ? '/ ay' : `(${selectedPlan.durationMonths} ay peşin)`}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Ad Soyad</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@sirket.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">
                Telefon <span className="text-gray-400 font-normal">(opsiyonel)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 5xx xxx xx xx"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-900">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 py-3.5 rounded-xl font-bold text-[14px] text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: TIER_STYLE[selectedPlan.tier].color }}
          >
            {busy ? 'Hazırlanıyor…' : `Iyzico ile Güvenli Öde — ${formatTRY(selectedPlan.amount)}`}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <span>🔒 3D Secure</span>
            <span>•</span>
            <span>Iyzico altyapısı</span>
            <span>•</span>
            <span>Kart bilgisi bize ulaşmaz</span>
          </div>
        </form>
      )}

      {!selectedPlan && (
        <p className="text-center text-[14px] text-gray-500 mt-6">
          Ödeme adımına geçmek için yukarıdan bir plan seçin.
        </p>
      )}

      {/* Iyzico checkout modal */}
      {checkoutHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <button
              onClick={closeCheckout}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900"
              aria-label="Kapat"
            >
              ✕
            </button>
            <div id="iyzipay-checkout-form" className="p-4" />
          </div>
        </div>
      )}
    </div>
  );
}
