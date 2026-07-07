'use client';

import { useEffect, useState } from 'react';
import { trackAddToCart, trackInitiateCheckout, trackMetaEvent } from '@/lib/analytics/meta-pixel';
import AddToCartButton from '@/components/AddToCartButton';

interface Props {
  slug: string;
  title: string;
  subtitle?: string | null;
  coverImageUrl?: string | null;
  price: string;
  listPriceTry?: string | null;
}

interface CheckoutResponse {
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
  conversationId: string;
}

type InvoiceType = 'individual' | 'corporate';

interface FormData {
  // Adım 1 — alıcı
  name: string;
  email: string;
  phone: string;
  // Adım 2 — fatura
  invoiceType: InvoiceType;
  taxId: string;
  taxOffice: string;
  companyName: string;
  billingAddress: string;
  billingCity: string;
  billingDistrict: string;
  billingPostalCode: string;
  // Onaylar
  agreeKvkk: boolean;
  agreeEArchive: boolean;
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  invoiceType: 'individual',
  taxId: '',
  taxOffice: '',
  companyName: '',
  billingAddress: '',
  billingCity: '',
  billingDistrict: '',
  billingPostalCode: '',
  agreeKvkk: false,
  agreeEArchive: false,
};

function formatTRY(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BuyEbookButton({ slug, title, subtitle, coverImageUrl, price, listPriceTry }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kupon
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponAffiliate, setCouponAffiliate] = useState<string | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const priceNum = parseFloat(price);

  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '');
    if (!code || code.length < 3) { setCouponError('Kod en az 3 karakter'); return; }
    setCouponBusy(true); setCouponError(null); setCouponMessage(null);
    try {
      const r = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, scope: 'ebook', amountKurus: Math.round(priceNum * 100) }),
      });
      const data = await r.json();
      if (data?.ok) {
        if (data.type === 'coupon') {
          setCouponCode(data.code);
          setCouponDiscount(Number(data.discountKurus ?? 0) / 100);
          setCouponMessage(data.message || 'Kupon uygulandı');
          setCouponAffiliate(null);
        } else if (data.type === 'affiliate') {
          setCouponCode(null); setCouponDiscount(0);
          setCouponAffiliate(data.affiliateCode);
          setCouponMessage(`Partner kodu: ${data.partnerName}`);
        }
      } else {
        setCouponError(data?.error || 'Geçersiz kod');
        setCouponCode(null); setCouponDiscount(0); setCouponAffiliate(null);
      }
    } catch (e: any) {
      setCouponError('Hata: ' + e?.message);
    } finally { setCouponBusy(false); }
  }

  function clearCoupon() {
    setCouponInput(''); setCouponCode(null); setCouponDiscount(0);
    setCouponAffiliate(null); setCouponMessage(null); setCouponError(null);
  }

  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // Iyzico checkout HTML'ini sayfaya inject et
  useEffect(() => {
    if (!checkoutHtml) return;
    const container = document.getElementById('iyzipay-ebook-checkout-form');
    if (!container) return;
    container.innerHTML = checkoutHtml;
    container.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [checkoutHtml]);

  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function validateStep1(): string | null {
    if (!form.name || form.name.trim().length < 2) return 'Ad Soyad girin.';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      return 'Geçerli bir e-posta adresi girin.';
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10)
      return 'Geçerli bir telefon numarası girin (en az 10 hane).';
    return null;
  }

  function validateStep2(): string | null {
    if (form.invoiceType === 'individual') {
      const tc = form.taxId.replace(/\D/g, '');
      if (tc.length !== 11) return 'TC kimlik numarası 11 hane olmalı.';
    } else {
      const vkn = form.taxId.replace(/\D/g, '');
      if (vkn.length !== 10) return 'Vergi numarası (VKN) 10 hane olmalı.';
      if (!form.taxOffice || form.taxOffice.trim().length < 2)
        return 'Vergi dairesi girin.';
      if (!form.companyName || form.companyName.trim().length < 2)
        return 'Şirket unvanı girin.';
    }
    if (!form.billingAddress || form.billingAddress.trim().length < 10)
      return 'Açık adres girin (en az 10 karakter).';
    if (!form.billingCity || form.billingCity.trim().length < 2)
      return 'İl girin.';
    if (!form.billingDistrict || form.billingDistrict.trim().length < 2)
      return 'İlçe girin.';
    if (!form.agreeKvkk) return 'KVKK aydınlatma metnini onaylamanız gerekir.';
    if (!form.agreeEArchive) return 'e-Arşiv fatura onayı vermeniz gerekir.';
    return null;
  }

  function goToStep2() {
    const err = validateStep1();
    if (err) return setError(err);
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const err = validateStep2();
    if (err) return setError(err);

    setBusy(true);

    // Meta Pixel — Iyzico checkout başlatılıyor = InitiateCheckout
    const finalPrice = Number(price ?? 0) - Number(couponDiscount ?? 0);
    trackInitiateCheckout({
      productId: `ebook-${slug}`,
      priceTry: finalPrice > 0 ? finalPrice : Number(price ?? 0),
      type: 'ebook',
    });

    try {
      const r = await fetch('/api/payment/ebook/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          invoiceType: form.invoiceType,
          taxId: form.taxId.replace(/\D/g, ''),
          taxOffice: form.invoiceType === 'corporate' ? form.taxOffice.trim() : undefined,
          companyName: form.invoiceType === 'corporate' ? form.companyName.trim() : undefined,
          billingAddress: form.billingAddress.trim(),
          billingCity: form.billingCity.trim(),
          billingDistrict: form.billingDistrict.trim(),
          billingPostalCode: form.billingPostalCode.trim() || undefined,
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
      // Meta Pixel — Iyzico modal başarıyla açıldı = AddPaymentInfo
      // (kullanıcı ödeme bilgilerini girmeye hazır)
      trackMetaEvent('AddPaymentInfo', {
        content_ids: [`ebook-${slug}`],
        content_category: 'ebook',
        value: Number(price ?? 0) - Number(couponDiscount ?? 0),
        currency: 'TRY',
      });
    } catch (err: any) {
      setError(err?.message || 'Beklenmedik hata');
    } finally {
      setBusy(false);
    }
  }

  function closeAll() {
    setOpen(false);
    setStep(1);
    setForm(INITIAL_FORM);
    setError(null);
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-ebook-checkout-form');
    if (c) c.innerHTML = '';
  }

  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-ebook-checkout-form');
    if (c) c.innerHTML = '';
  }

  const inputCls =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px] outline-none transition-colors';
  const labelCls = 'block text-[12px] font-semibold text-[#1B365D] mb-1';

  return (
    <>
      <div className="space-y-2">
        {/* Sepete Ekle — birden fazla kitap alacaklar için */}
        <AddToCartButton
          type="ebook"
          slug={slug}
          title={title}
          subtitle={subtitle}
          coverImageUrl={coverImageUrl}
          price={Number(price ?? 0)}
          listPrice={listPriceTry ? Number(listPriceTry) : null}
          variant="full"
          className="w-full"
        />

        {/* Ya da doğrudan tekil ödeme (mevcut modal akışı) */}
        <button
          onClick={() => {
            setOpen(true);
            trackAddToCart({
              productId: `ebook-${slug}`,
              productName: title,
              priceTry: Number(price ?? 0),
              type: 'ebook',
            });
          }}
          className="w-full py-3 rounded-xl font-bold text-[13px] text-[#0ea5e9] border-2 border-[#0ea5e9] hover:bg-[#0ea5e9]/5 transition-colors"
        >
          Ya da Hemen Satın Al — {formatTRY(price)}
        </button>
      </div>

      {/* Form modal */}
      {open && !checkoutHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={closeAll}
        >
          <form
            onSubmit={(e) => {
              if (step === 1) {
                e.preventDefault();
                goToStep2();
              } else {
                handleSubmit(e);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 my-8 max-h-[92vh] overflow-y-auto"
          >
            {/* Başlık + adım göstergesi */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-bold text-[#1B365D]">
                  {step === 1 ? 'Alıcı Bilgileri' : 'Fatura Bilgileri'}
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Adım {step}/2 — {step === 1 ? 'İletişim bilgileri' : 'Faturanız için gerekli'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeAll}
                className="text-gray-400 hover:text-gray-700 text-[20px] leading-none"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Adım göstergesi bar */}
            <div className="flex gap-2 mb-5">
              <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`} />
              <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#0ea5e9]' : 'bg-gray-200'}`} />
            </div>

            <p className="text-[13px] text-gray-600 mb-5">
              <strong className="text-[#1B365D]">{title}</strong> —{' '}
              <span className="text-[#0ea5e9] font-bold">{formatTRY(price)}</span>
            </p>

            {/* ─── Adım 1: Alıcı bilgileri ─────────────────────── */}
            {step === 1 && (
              <div className="space-y-3 mb-5">
                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>E-posta *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="ornek@email.com"
                    className={inputCls}
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    İndirme bağlantısı ve faturanız bu adrese gönderilir.
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Telefon *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="+90 5xx xxx xx xx"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* ─── Adım 2: Fatura bilgileri ────────────────────── */}
            {step === 2 && (
              <div className="space-y-3 mb-5">
                {/* Fatura tipi */}
                <div>
                  <label className={labelCls}>Fatura Tipi *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors ${
                        form.invoiceType === 'individual'
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="invoiceType"
                        checked={form.invoiceType === 'individual'}
                        onChange={() => update('invoiceType', 'individual')}
                        className="accent-[#0ea5e9]"
                      />
                      <span className="text-[13px] font-semibold text-[#1B365D]">Bireysel</span>
                    </label>
                    <label
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-colors ${
                        form.invoiceType === 'corporate'
                          ? 'border-[#0ea5e9] bg-[#0ea5e9]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="invoiceType"
                        checked={form.invoiceType === 'corporate'}
                        onChange={() => update('invoiceType', 'corporate')}
                        className="accent-[#0ea5e9]"
                      />
                      <span className="text-[13px] font-semibold text-[#1B365D]">Kurumsal</span>
                    </label>
                  </div>
                </div>

                {/* Bireysel: TC */}
                {form.invoiceType === 'individual' && (
                  <div>
                    <label className={labelCls}>TC Kimlik No *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={11}
                      required
                      value={form.taxId}
                      onChange={(e) => update('taxId', e.target.value.replace(/\D/g, ''))}
                      placeholder="11 hane"
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Kurumsal: VKN + Vergi Dairesi + Unvan */}
                {form.invoiceType === 'corporate' && (
                  <>
                    <div>
                      <label className={labelCls}>Vergi Numarası (VKN) *</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        required
                        value={form.taxId}
                        onChange={(e) => update('taxId', e.target.value.replace(/\D/g, ''))}
                        placeholder="10 hane"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Vergi Dairesi *</label>
                      <input
                        type="text"
                        required
                        value={form.taxOffice}
                        onChange={(e) => update('taxOffice', e.target.value)}
                        placeholder="Ankara Kurumlar"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Şirket Unvanı *</label>
                      <input
                        type="text"
                        required
                        value={form.companyName}
                        onChange={(e) => update('companyName', e.target.value)}
                        placeholder="ABC İletişim Hizmetleri A.Ş."
                        className={inputCls}
                      />
                    </div>
                  </>
                )}

                {/* Adres */}
                <div>
                  <label className={labelCls}>Açık Adres *</label>
                  <textarea
                    required
                    value={form.billingAddress}
                    onChange={(e) => update('billingAddress', e.target.value)}
                    placeholder="Mahalle, cadde/sokak, bina no, daire no"
                    rows={2}
                    className={inputCls}
                  />
                </div>

                {/* İl + İlçe + Posta kodu */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className={labelCls}>İl *</label>
                    <input
                      type="text"
                      required
                      value={form.billingCity}
                      onChange={(e) => update('billingCity', e.target.value)}
                      placeholder="Ankara"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className={labelCls}>İlçe *</label>
                    <input
                      type="text"
                      required
                      value={form.billingDistrict}
                      onChange={(e) => update('billingDistrict', e.target.value)}
                      placeholder="Çankaya"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-1">
                    <label className={labelCls}>Posta Kodu</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={form.billingPostalCode}
                      onChange={(e) =>
                        update('billingPostalCode', e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="06520"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Onaylar */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2.5">
                  <label className="flex items-start gap-2 cursor-pointer text-[12px] text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.agreeKvkk}
                      onChange={(e) => update('agreeKvkk', e.target.checked)}
                      className="mt-0.5 accent-[#0ea5e9]"
                    />
                    <span>
                      <a
                        href="/gizlilik-politikasi"
                        target="_blank"
                        className="text-[#0ea5e9] underline"
                      >
                        KVKK Aydınlatma Metni
                      </a>{' '}
                      okudum ve kabul ediyorum. *
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer text-[12px] text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.agreeEArchive}
                      onChange={(e) => update('agreeEArchive', e.target.checked)}
                      className="mt-0.5 accent-[#0ea5e9]"
                    />
                    <span>
                      Bu sipariş için bana <strong>e-Arşiv fatura</strong>nın e-posta adresime
                      iletilmesini kabul ediyorum. *
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Hata mesajı */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-900">
                {error}
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                  className="flex-1 py-3 rounded-xl font-bold text-[13px] text-[#1B365D] bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  ← Geri
                </button>
              )}
              <div className="mt-4 mb-2 p-3 border border-slate-200 rounded-md bg-slate-50">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Kupon kodun var mı?</label>
                {!couponCode && !couponAffiliate ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="HOSGELDIN10"
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs font-mono uppercase"
                      disabled={couponBusy}
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponBusy || !couponInput.trim()}
                      className="px-3 py-1.5 bg-[#082567] text-white rounded text-xs font-semibold disabled:opacity-50">
                      {couponBusy ? '...' : 'Uygula'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2 rounded">
                    <div className="text-xs">
                      <strong className="text-emerald-800">{couponCode ? `Kupon: ${couponCode}` : `Partner: ${couponAffiliate}`}</strong>
                      {couponMessage && <div className="text-[10px] text-emerald-700 mt-0.5">{couponMessage}</div>}
                    </div>
                    <button type="button" onClick={clearCoupon} className="text-[10px] text-red-600 hover:text-red-800">Kaldır</button>
                  </div>
                )}
                {couponError && <div className="text-[10px] text-red-600 mt-1.5">{couponError}</div>}
                {couponDiscount > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                    <div className="flex justify-between"><span>Fiyat:</span><span className="line-through">{priceNum.toFixed(2)} TL</span></div>
                    <div className="flex justify-between text-emerald-700"><span>İndirim:</span><span>-{couponDiscount.toFixed(2)} TL</span></div>
                    <div className="flex justify-between font-bold text-sm pt-1 mt-1 border-t border-slate-200"><span>Ödenecek:</span><span>{(priceNum - couponDiscount).toFixed(2)} TL</span></div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex-[2] py-3 rounded-xl font-bold text-[13px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {busy
                  ? 'Hazırlanıyor…'
                  : step === 1
                    ? 'Devam Et → Fatura Bilgileri'
                    : `Iyzico ile Güvenli Öde — ${formatTRY(price)}`}
              </button>
            </div>

            <p className="text-center text-[10px] text-gray-500 mt-3">
              🔒 3D Secure · Iyzico altyapısı · Kart bilgisi bize ulaşmaz
            </p>
          </form>
        </div>
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
            >
              ✕
            </button>
            <div id="iyzipay-ebook-checkout-form" className="p-4" />
          </div>
        </div>
      )}
    </>
  );
}
