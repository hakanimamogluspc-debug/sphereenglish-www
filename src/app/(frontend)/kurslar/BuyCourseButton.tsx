"use client";

import { useState } from "react";
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
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Tüm alanları doldur");
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
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Ödeme başlatılamadı");
      // Iyzico checkout form'unu inject et
      const div = document.createElement("div");
      div.id = "iyzipay-checkout-form";
      div.className = "responsive";
      document.body.appendChild(div);
      const scriptContainer = document.createElement("div");
      scriptContainer.innerHTML = data.checkoutFormContent;
      const scriptEl = scriptContainer.querySelector("script");
      if (scriptEl) {
        const s = document.createElement("script");
        s.type = scriptEl.type || "text/javascript";
        if (scriptEl.src) s.src = scriptEl.src;
        else s.text = scriptEl.textContent || "";
        document.body.appendChild(s);
      }
      setOpen(false);
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
    </>
  );
}
