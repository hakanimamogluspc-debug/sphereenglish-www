'use client';

import { useEffect, useState } from 'react';

interface Props {
  slug: string;
  title: string;
  price: string;
}

interface CheckoutResponse {
  token: string;
  checkoutFormContent: string;
  paymentPageUrl: string;
  conversationId: string;
}

function formatTRY(amount: number | string) {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BuyEbookButton({ slug, title, price }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // Iyzico checkout HTML'ini sayfaya inject et
  useEffect(() => {
    if (!checkoutHtml) return;
    const container = document.getElementById('iyzipay-ebook-checkout-form');
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
      const r = await fetch('/api/payment/ebook/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
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
    } catch (err: any) {
      setError(err?.message || 'Beklenmedik hata');
    } finally {
      setBusy(false);
    }
  }

  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById('iyzipay-ebook-checkout-form');
    if (c) c.innerHTML = '';
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
      >
        Satın Al &amp; Hemen İndir — {formatTRY(price)}
      </button>

      {/* Form modal */}
      {open && !checkoutHtml && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setOpen(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-bold text-[#1B365D]">Satın Alma Bilgileri</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-[13px] text-gray-600 mb-5">
              <strong className="text-[#1B365D]">{title}</strong> —{' '}
              <span className="text-[#0ea5e9] font-bold">{formatTRY(price)}</span>
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  İndirme bağlantısı bu adrese gönderilir.
                </p>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-[#1B365D] mb-1">
                  Telefon <span className="text-gray-400 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 text-[14px]"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-900">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl font-bold text-[13px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {busy ? 'Hazırlanıyor…' : `Iyzico ile Güvenli Öde — ${formatTRY(price)}`}
            </button>

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
