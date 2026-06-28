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

export default function AbonelikClient({ initialPlanCode, initialEmail, initialName }: Props) {
  const [plans, setPlans] = useState<PlanDefinition[]>([]);
  const [tab, setTab] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedCode, setSelectedCode] = useState<string | null>(initialPlanCode ?? null);
  const [email, setEmail] = useState(initialEmail ?? '');
  const [name, setName] = useState(initialName ?? '');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // ── Fatura bilgileri ──
  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual');
  const [taxId, setTaxId] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingDistrict, setBillingDistrict] = useState('');
  const [billingPostalCode, setBillingPostalCode] = useState('');
  const [agreeKvkk, setAgreeKvkk] = useState(false);
  const [agreeEArchive, setAgreeEArchive] = useState(false);
  // ── Kupon / Affiliate kodu ──
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponAffiliate, setCouponAffiliate] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  async function applyCoupon() {
    if (!selectedPlan) return;
    const code = couponInput.trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '');
    if (!code || code.length < 3) {
      setCouponError('Kod en az 3 karakter olmalı');
      return;
    }
    setCouponBusy(true); setCouponError(null); setCouponMessage(null);
    try {
      const scope = selectedPlan.billingType === 'monthly' ? 'subscription_monthly' : 'subscription_yearly';
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, scope, amountKurus: Math.round(selectedPlan.amount * 100) }),
      });
      const data = await r.json();
      if (data?.ok) {
        if (data.type === 'coupon') {
          setCouponCode(data.code);
          setCouponDiscount(Number(data.discountKurus ?? 0) / 100);
          setCouponMessage(data.message || 'Kupon uygulandı');
          setCouponAffiliate(null);
        } else if (data.type === 'affiliate') {
          setCouponCode(null);
          setCouponDiscount(0);
          setCouponAffiliate(data.affiliateCode);
          setCouponMessage(`Partner kodu: ${data.partnerName}`);
        }
      } else {
        setCouponError(data?.error || 'Geçersiz kod');
        setCouponCode(null); setCouponDiscount(0); setCouponAffiliate(null);
      }
    } catch (e: any) {
      setCouponError('Doğrulama hatası: ' + e?.message);
    } finally {
      setCouponBusy(false);
    }
  }

  function clearCoupon() {
    setCouponInput(''); setCouponCode(null); setCouponDiscount(0);
    setCouponAffiliate(null); setCouponMessage(null); setCouponError(null);
  }


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
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Geçerli bir telefon numarası girin (en az 10 hane).');
      return;
    }

    // ── Fatura validasyonu ──
    const taxIdDigits = taxId.replace(/\D/g, '');
    if (invoiceType === 'individual') {
      if (taxIdDigits.length !== 11) {
        setError('TC kimlik numarası 11 hane olmalı.');
        return;
      }
    } else {
      if (taxIdDigits.length !== 10) {
        setError('Vergi numarası (VKN) 10 hane olmalı.');
        return;
      }
      if (!taxOffice || taxOffice.trim().length < 2) {
        setError('Vergi dairesi girin.');
        return;
      }
      if (!companyName || companyName.trim().length < 2) {
        setError('Şirket unvanı girin.');
        return;
      }
    }
    if (!billingAddress || billingAddress.trim().length < 10) {
      setError('Açık adres girin (en az 10 karakter).');
      return;
    }
    if (!billingCity || billingCity.trim().length < 2) {
      setError('İl girin.');
      return;
    }
    if (!billingDistrict || billingDistrict.trim().length < 2) {
      setError('İlçe girin.');
      return;
    }
    if (!agreeKvkk) {
      setError('KVKK aydınlatma metnini onaylamanız gerekir.');
      return;
    }
    if (!agreeEArchive) {
      setError('e-Arşiv fatura onayı vermeniz gerekir.');
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
          phone: phone.trim(),
          // Fatura bilgileri
          invoiceType,
          taxId: taxIdDigits,
          taxOffice: invoiceType === 'corporate' ? taxOffice.trim() : undefined,
          companyName: invoiceType === 'corporate' ? companyName.trim() : undefined,
          billingAddress: billingAddress.trim(),
          billingCity: billingCity.trim(),
          billingDistrict: billingDistrict.trim(),
          billingPostalCode: billingPostalCode.trim() || undefined,
          couponCode: couponCode || couponAffiliate || undefined,
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
      {/* Tab — Aylık / Yıllık (2 ay bedava) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-100">
          <button
            type="button"
            onClick={() => setTab('monthly')}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
              tab === 'monthly' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
            }`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setTab('yearly')}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-all relative ${
              tab === 'yearly' ? 'bg-white text-[#1B365D] shadow-sm' : 'text-gray-500 hover:text-[#1B365D]'
            }`}
          >
            Yıllık
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
              2 ay bedava
            </span>
          </button>
        </div>
      </div>

      {/* Plan kartları — 3 sütun (Core / Pro / Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-4xl mx-auto">
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
                {p.billingType === 'monthly' ? 'aylık' : 'yıllık'} · KDV dahil
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
            {selectedPlan.billingType === 'monthly' ? '/ ay' : '/ yıl'}
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
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+90 5xx xxx xx xx"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>
          </div>

          {/* ─── Fatura Bilgileri ─────────────────────────────────── */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-[16px] font-bold text-[#1B365D] mb-1">Fatura Bilgileri</h3>
            <p className="text-[12px] text-gray-500 mb-4">e-Arşiv fatura için gerekli — KDV dahil tutara işlenir.</p>

            {/* Fatura Tipi */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Fatura Tipi</label>
              <div className="grid grid-cols-2 gap-2">
                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                  invoiceType === 'individual' ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === 'individual'}
                    onChange={() => setInvoiceType('individual')}
                    className="accent-[#0ea5e9]"
                  />
                  <span className="text-[13px] font-semibold text-[#1B365D]">Bireysel</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer transition-colors ${
                  invoiceType === 'corporate' ? 'border-[#0ea5e9] bg-[#0ea5e9]/5' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="invoiceType"
                    checked={invoiceType === 'corporate'}
                    onChange={() => setInvoiceType('corporate')}
                    className="accent-[#0ea5e9]"
                  />
                  <span className="text-[13px] font-semibold text-[#1B365D]">Kurumsal</span>
                </label>
              </div>
            </div>

            {/* TC veya VKN */}
            <div className="mb-3">
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">
                {invoiceType === 'individual' ? 'TC Kimlik No' : 'Vergi Numarası (VKN)'}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={invoiceType === 'individual' ? 11 : 10}
                value={taxId}
                onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                required
                placeholder={invoiceType === 'individual' ? '11 hane' : '10 hane'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>

            {/* Kurumsal alanlar */}
            {invoiceType === 'corporate' && (
              <>
                <div className="mb-3">
                  <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Vergi Dairesi</label>
                  <input
                    type="text"
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    required
                    placeholder="Ankara Kurumlar"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Şirket Unvanı</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="ABC İletişim Hizmetleri A.Ş."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                  />
                </div>
              </>
            )}

            {/* Açık Adres */}
            <div className="mb-3">
              <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">Açık Adres</label>
              <textarea
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                required
                rows={2}
                placeholder="Mahalle, cadde/sokak, bina no, daire no"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
              />
            </div>

            {/* İl / İlçe / Posta Kodu */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">İl</label>
                <input
                  type="text"
                  value={billingCity}
                  onChange={(e) => setBillingCity(e.target.value)}
                  required
                  placeholder="Ankara"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">İlçe</label>
                <input
                  type="text"
                  value={billingDistrict}
                  onChange={(e) => setBillingDistrict(e.target.value)}
                  required
                  placeholder="Çankaya"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1.5">
                  Posta Kodu <span className="text-gray-400 font-normal">(ops.)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={billingPostalCode}
                  onChange={(e) => setBillingPostalCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="06520"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
              </div>
            </div>

            {/* Onaylar */}
            <div className="pt-3 border-t border-gray-100 space-y-2.5">
              <label className="flex items-start gap-2 cursor-pointer text-[12px] text-gray-700">
                <input
                  type="checkbox"
                  checked={agreeKvkk}
                  onChange={(e) => setAgreeKvkk(e.target.checked)}
                  className="mt-0.5 accent-[#0ea5e9]"
                />
                <span>
                  <a href="/gizlilik-politikasi" target="_blank" className="text-[#0ea5e9] underline">KVKK Aydınlatma Metni</a>
                  ,{' '}
                  <a href="/kullanim-kosullari" target="_blank" className="text-[#0ea5e9] underline">Kullanım Koşulları</a>
                  {' '}ve{' '}
                  <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="text-[#0ea5e9] underline">Mesafeli Satış Sözleşmesi</a>
                  ni okudum, kabul ediyorum.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-[12px] text-gray-700">
                <input
                  type="checkbox"
                  checked={agreeEArchive}
                  onChange={(e) => setAgreeEArchive(e.target.checked)}
                  className="mt-0.5 accent-[#0ea5e9]"
                />
                <span>
                  Bu sipariş için <strong>e-Arşiv fatura</strong>nın e-posta adresime iletilmesini kabul ediyorum.
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-900">
              {error}
            </div>
          )}

          {/* ── Kupon Kodu ── */}
          <div className="mt-4 mb-2 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <label className="text-sm font-semibold text-slate-700 block mb-2">Kupon kodun var mı?</label>
            {!couponCode && !couponAffiliate ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="ÖRN: HOSGELDIN10"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm font-mono uppercase focus:ring-2 focus:ring-[#082567] focus:border-transparent"
                  disabled={couponBusy}
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponBusy || !couponInput.trim()}
                  className="px-4 py-2 bg-[#082567] text-white rounded-md text-sm font-semibold hover:bg-[#051840] disabled:opacity-50"
                >
                  {couponBusy ? '...' : 'Uygula'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded">
                <div className="text-sm">
                  <strong className="text-emerald-800">
                    {couponCode ? `Kupon: ${couponCode}` : `Partner Kodu: ${couponAffiliate}`}
                  </strong>
                  {couponMessage && <div className="text-xs text-emerald-700 mt-0.5">{couponMessage}</div>}
                </div>
                <button type="button" onClick={clearCoupon} className="text-xs text-red-600 hover:text-red-800">
                  Kaldır
                </button>
              </div>
            )}
            {couponError && <div className="text-xs text-red-600 mt-2">{couponError}</div>}
            {couponDiscount > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Plan tutarı:</span>
                  <span className="line-through">{formatTRY(selectedPlan.amount)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>İndirim:</span>
                  <span>-{formatTRY(couponDiscount)}</span>
                </div>
                <div className="flex justify-between text-[#082567] font-bold text-base pt-2 border-t border-slate-200 mt-2">
                  <span>Ödenecek tutar:</span>
                  <span>{formatTRY(selectedPlan.amount - couponDiscount)}</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-6 py-3.5 rounded-xl font-bold text-[14px] text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: TIER_STYLE[selectedPlan.tier].color }}
          >
            {busy ? 'Hazırlanıyor…' : `Iyzico ile Güvenli Öde — ${formatTRY(selectedPlan.amount - couponDiscount)}`}
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
