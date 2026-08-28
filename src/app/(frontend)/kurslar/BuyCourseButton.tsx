"use client";

import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics/gtm";

interface Props {
  programmeSlug: string;
  programmeTitle: string;
  price: string;
  className?: string;
  variant?: "primary" | "secondary";
}

/**
 * Kurs "Ön Kayıt Ol" butonu — tıklanınca minimal iyzico form modal açar.
 * Ad + email + telefon alır → Iyzico checkout başlatır (www /api/payment/course/initialize) → yönlendirir.
 * TC, yaş, sektör, cinsiyet ödeme sonrası ayrı sayfada toplanır.
 *
 * MİMARİ: Kurs ödemesi artık www tarafında (ebook/cart pattern'i ile aynı).
 * Backend sadece DB owner + HMAC internal endpoint'ler.
 */
export default function BuyCourseButton({
  programmeSlug, programmeTitle, price, className, variant = "primary",
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tc, setTc] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);

  // Iyzico checkout HTML'i modal içindeki container'a inject et
  useEffect(() => {
    if (!checkoutHtml) return;
    const container = document.getElementById("iyzipay-course-checkout-form");
    if (!container) return;
    container.innerHTML = checkoutHtml;
    // Iyzico script'lerini yeniden çalıştır (innerHTML script'leri execute etmez)
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [checkoutHtml]);

  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById("iyzipay-course-checkout-form");
    if (c) c.innerHTML = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Tüm alanları doldur");
      return;
    }
    if (!/^\d{11}$/.test(tc)) {
      setError("TC Kimlik No 11 haneli olmalı — fatura ve banka doğrulaması için gerekli");
      return;
    }
    if (!agree) {
      setError("KVKK aydınlatma metnini kabul etmelisin");
      return;
    }
    setBusy(true);
    // GA4: begin_checkout for course
    const priceTry = parseFloat(price.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
    analytics.beginCheckout(
      [{
        item_id: `course-${programmeSlug}`,
        item_name: programmeTitle,
        item_category: 'Kurs',
        price: priceTry,
        quantity: 1,
      }],
      priceTry,
    );
    try {
      // www route: /api/payment/course/initialize (Iyzico + backend pre-create HMAC)
      const r = await fetch(`/api/payment/course/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeSlug,
          buyerName: name.trim(),
          buyerEmail: email.trim().toLowerCase(),
          buyerPhone: phone.trim(),
          tcKimlik: tc.trim(),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Ödeme başlatılamadı");

      // Mobilde tam sayfa Iyzico hosted checkout — modal responsive değil, direkt hosted URL
      const paymentPageUrl = (data as any)?.paymentPageUrl as string | undefined;
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile && paymentPageUrl) {
        window.location.href = paymentPageUrl;
        return;
      }

      // Desktop: modal içinde inline iyzico form göster
      setOpen(false);
      setCheckoutHtml(data.checkoutFormContent);
    } catch (e: any) {
      setError(e?.message || "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  const btnBase =
    variant === "primary"
      ? "bg-[#0ea5e9] hover:bg-[#0284c7]"
      : "bg-[#1B365D] hover:bg-[#0F2547]";

  return (
    <>
      <button
        onClick={() => {
          analytics.courseCtaClick({
            course_slug: programmeSlug,
            cta_location: 'course_detail',
            cta_label: 'buy_now',
          });
          setOpen(true);
        }}
        className={`block w-full text-center py-3.5 rounded-xl font-bold text-white ${btnBase} transition-colors ${className ?? ""}`}
      >
        Şimdi Kayıt Ol · {price}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9]">KAYIT</div>
                <div id="course-modal-title" className="font-bold text-[#1B365D] text-lg leading-tight">{programmeTitle}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] rounded p-1"
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-3">
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Ödemeni tamamla — sonrasında birkaç soruya cevap ver, <b>24 saat içinde</b> seninle iletişime geçelim.
              </p>

              {/* Kurumsal fatura bilgilendirme */}
              <div className="rounded-lg bg-[#f0f7ff] border border-[#0ea5e9]/20 p-3 text-[11px] text-gray-600 leading-relaxed">
                <strong className="text-[#1B365D]">Bireysel e-Arşiv fatura</strong> otomatik kesilir. Kurumsal (VKN'li) fatura için{' '}
                <a
                  href="https://wa.me/905066085810?text=Kurumsal%20kurs%20kayd%C4%B1%20i%C3%A7in%20fatura%20bilgi%20almak%20istiyorum."
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0ea5e9] font-semibold underline"
                >
                  iletişime geçin
                </a>.
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Ad Soyad *</label>
                <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" placeholder="Ayşe Yıldız" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">E-posta *</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" placeholder="ayse@ornek.com" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Telefon *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm" placeholder="+90 5XX XXX XX XX" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">TC Kimlik No *</label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={tc}
                  onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono"
                  placeholder="11 haneli"
                />
                <p className="text-[10px] text-gray-400 mt-1">Fatura ve 3D Secure doğrulaması için gerekli. Güvenli iletim, sadece Iyzico'ya gider.</p>
              </div>

              <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed pt-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
                <span>
                  <a href="/kvkk-aydinlatma" target="_blank" className="text-[#0ea5e9] hover:underline">KVKK Aydınlatma Metni</a>
                  'ni okudum, verilerimin kayıt ve iletişim amacıyla işlenmesini kabul ediyorum.
                </span>
              </label>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{error}</div>
              )}

              <div className="pt-2 space-y-2">
                <button type="submit" disabled={busy}
                  className="w-full rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold py-3 transition-colors">
                  {busy ? "Ödeme başlatılıyor..." : `Güvenli Ödemeye Geç · ${price}`}
                </button>
                <p className="text-[11px] text-center text-gray-400">
                  🔒 Iyzico 3D Secure ile korumalı ödeme
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Iyzico checkout modal — fixed, ortalanmış, scroll'lu */}
      {checkoutHtml && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Iyzico güvenli ödeme"
          onKeyDown={(e) => { if (e.key === "Escape") closeCheckout(); }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto overflow-x-hidden">
            <button
              onClick={closeCheckout}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              aria-label="Ödemeyi kapat"
            >
              ✕
            </button>
            <div id="iyzipay-course-checkout-form" className="p-3 sm:p-4" />
          </div>
        </div>
      )}
    </>
  );
}
