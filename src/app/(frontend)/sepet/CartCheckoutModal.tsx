'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { CartItem } from '@/lib/cart/cart-context';
import { trackInitiateCheckout, trackMetaEvent } from '@/lib/analytics/meta-pixel';

interface Props {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  couponCode: string | null;
  finalTotal: number;
}

type InvoiceType = 'individual' | 'corporate';

interface FormData {
  name: string;
  email: string;
  phone: string;
  invoiceType: InvoiceType;
  taxId: string;
  taxOffice: string;
  companyName: string;
  billingAddress: string;
  billingCity: string;
  billingDistrict: string;
  billingPostalCode: string;
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

function formatTRY(amount: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Sepet checkout modal — 2 adım (alıcı → fatura), sonra Iyzico modal.
 * BuyEbookButton pattern'inin cart versiyonu.
 */
export default function CartCheckoutModal({
  open,
  onClose,
  items,
  couponCode,
  finalTotal,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // Modal açıldığında localStorage'daki son bilgileri yükle
  useEffect(() => {
    if (!open) return;
    try {
      const savedRaw = localStorage.getItem('sphere_last_buyer_v1');
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        setForm((f) => ({
          ...f,
          name: saved.name ?? '',
          email: saved.email ?? '',
          phone: saved.phone ?? '',
          invoiceType: saved.invoiceType ?? 'individual',
          taxId: saved.taxId ?? '',
          taxOffice: saved.taxOffice ?? '',
          companyName: saved.companyName ?? '',
          billingAddress: saved.billingAddress ?? '',
          billingCity: saved.billingCity ?? '',
          billingDistrict: saved.billingDistrict ?? '',
          billingPostalCode: saved.billingPostalCode ?? '',
        }));
      }
    } catch {
      /* ignore */
    }
  }, [open]);

  // Iyzico checkout HTML'ini sayfaya inject et
  useEffect(() => {
    if (!checkoutHtml) return;
    const container = document.getElementById('iyzipay-cart-checkout-form');
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
    if (!form.billingCity || form.billingCity.trim().length < 2) return 'İl girin.';
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

    if (items.length === 0) {
      setError('Sepet boş');
      return;
    }

    setBusy(true);

    // Alıcı bilgilerini localStorage'a kaydet (bir sonraki alışverişte hızlı doldurma için)
    try {
      localStorage.setItem(
        'sphere_last_buyer_v1',
        JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          invoiceType: form.invoiceType,
          taxId: form.taxId,
          taxOffice: form.taxOffice,
          companyName: form.companyName,
          billingAddress: form.billingAddress,
          billingCity: form.billingCity,
          billingDistrict: form.billingDistrict,
          billingPostalCode: form.billingPostalCode,
        }),
      );
    } catch {
      /* quota veya storage yok */
    }

    // Meta Pixel — InitiateCheckout
    trackInitiateCheckout({
      productId: items.map((i) => `${i.type}-${i.slug}`).join(','),
      priceTry: finalTotal,
      type: 'ebook',
    });

    try {
      const r = await fetch('/api/payment/cart/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ type: i.type, slug: i.slug })),
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          invoiceType: form.invoiceType,
          taxId: form.taxId.replace(/\D/g, ''),
          taxOffice:
            form.invoiceType === 'corporate' ? form.taxOffice.trim() : undefined,
          companyName:
            form.invoiceType === 'corporate' ? form.companyName.trim() : undefined,
          billingAddress: form.billingAddress.trim(),
          billingCity: form.billingCity.trim(),
          billingDistrict: form.billingDistrict.trim(),
          billingPostalCode: form.billingPostalCode.trim() || undefined,
          couponCode: couponCode ?? undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data?.error || 'Ödeme başlatılamadı');
        setBusy(false);
        return;
      }
      setCheckoutHtml(data.checkoutFormContent);

      // Meta Pixel — AddPaymentInfo
      trackMetaEvent('AddPaymentInfo', {
        content_ids: items.map((i) => `${i.type}-${i.slug}`),
        content_category: 'ebook',
        num_items: items.length,
        value: finalTotal,
        currency: 'TRY',
      });
    } catch (err: any) {
      setError(err?.message || 'Beklenmedik hata');
    } finally {
      setBusy(false);
    }
  }

  function closeAll() {
    setStep(1);
    setError(null);
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-cart-checkout-form');
    if (c) c.innerHTML = '';
    onClose();
  }

  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-cart-checkout-form');
    if (c) c.innerHTML = '';
  }

  if (!open) return null;

  const inputCls =
    'w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px] outline-none transition-colors';
  const labelCls = 'block text-[12px] font-semibold text-[#1B365D] mb-1';

  // Iyzico checkout aktifse form'u gösterme, sadece Iyzico modal
  if (checkoutHtml) {
    return (
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
            <X className="w-4 h-4" />
          </button>
          <div id="iyzipay-cart-checkout-form" className="p-4" />
        </div>
      </div>
    );
  }

  return (
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
        {/* Başlık */}
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

        {/* Progress bar */}
        <div className="flex gap-2 mb-5">
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step >= 1 ? 'bg-[#0ea5e9]' : 'bg-gray-200'
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full ${
              step >= 2 ? 'bg-[#0ea5e9]' : 'bg-gray-200'
            }`}
          />
        </div>

        {/* Sipariş özeti */}
        <div className="mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Sipariş Özeti — {items.length} ürün
          </p>
          <div className="space-y-1 max-h-24 overflow-y-auto text-[12px] text-gray-700 mb-2">
            {items.map((it, idx) => (
              <div key={it.key} className="flex justify-between gap-2">
                <span className="truncate">
                  {idx + 1}. {it.title}
                  {it.type === 'bundle' ? ' 📦' : ''}
                </span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  {formatTRY(it.priceTry)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-[13px] font-bold text-[#1B365D]">Toplam</span>
            <span className="text-[18px] font-extrabold text-emerald-700">
              {formatTRY(finalTotal)}
            </span>
          </div>
          {couponCode && (
            <div className="mt-1.5 text-[10px] text-emerald-700 font-semibold">
              ✓ Kupon uygulandı: {couponCode}
            </div>
          )}
        </div>

        {/* Adım 1 */}
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
                Tüm indirme bağlantıları ve faturanız bu adrese gönderilir.
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

        {/* Adım 2 */}
        {step === 2 && (
          <div className="space-y-3 mb-5">
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

            <div className="grid grid-cols-3 gap-2">
              <div>
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
              <div>
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
              <div>
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

        {/* Hata */}
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
          <button
            type="submit"
            disabled={busy}
            className="flex-[2] py-3 rounded-xl font-bold text-[13px] text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Hazırlanıyor…
              </>
            ) : step === 1 ? (
              'Devam Et → Fatura Bilgileri'
            ) : (
              `Iyzico ile Öde — ${formatTRY(finalTotal)}`
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-500 mt-3">
          🔒 3D Secure · Iyzico altyapısı · Kart bilgisi bize ulaşmaz
        </p>
      </form>
    </div>
  );
}
