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
 * Kurs "Ön Kayıt Ol" butonu — 2 adımlı modal.
 * Adım 1: Alıcı bilgileri (Ad, Email, Telefon)
 * Adım 2: Fatura bilgileri (TC, Açık Adres, İl, İlçe, Posta Kodu, KVKK)
 * → Iyzico checkout başlatır → yönlendirir.
 *
 * NOT: Kurumsal (VKN'li) fatura desteklenmiyor — WhatsApp "İletişime Geç" var.
 */
export default function BuyCourseButton({
  programmeSlug, programmeTitle, price, className, variant = "primary",
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2
  const [tc, setTc] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
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
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value),
      );
      newScript.text = oldScript.text;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [checkoutHtml]);

  function closeAll() {
    setOpen(false);
    setStep(1);
    setError(null);
    setCheckoutHtml(null);
    const c = document.getElementById("iyzipay-course-checkout-form");
    if (c) c.innerHTML = "";
  }
  function closeCheckout() {
    setCheckoutHtml(null);
    const c = document.getElementById("iyzipay-course-checkout-form");
    if (c) c.innerHTML = "";
  }

  function validateStep1(): string | null {
    if (!name.trim() || name.trim().length < 2) return "Ad Soyad girin.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return "Geçerli e-posta adresi girin.";
    if (phone.replace(/\D/g, "").length < 10) return "Geçerli telefon numarası (10+ hane).";
    return null;
  }
  function validateStep2(): string | null {
    if (!/^\d{11}$/.test(tc)) return "TC Kimlik No 11 haneli olmalı.";
    if (address.trim().length < 10) return "Açık adres girin (en az 10 karakter).";
    if (city.trim().length < 2) return "İl girin.";
    if (district.trim().length < 2) return "İlçe girin.";
    if (!agree) return "KVKK aydınlatma metnini kabul etmelisin.";
    return null;
  }

  function goToStep2() {
    const err = validateStep1();
    if (err) return setError(err);
    setError(null);
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) return goToStep2();
    setError(null);
    const err = validateStep2();
    if (err) return setError(err);

    setBusy(true);
    const priceTry = parseFloat(price.replace(/[^\d,.]/g, "").replace(",", ".")) || 0;
    analytics.beginCheckout(
      [{ item_id: `course-${programmeSlug}`, item_name: programmeTitle, item_category: "Kurs", price: priceTry, quantity: 1 }],
      priceTry,
    );

    try {
      const r = await fetch(`/api/payment/course/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeSlug,
          buyerName: name.trim(),
          buyerEmail: email.trim().toLowerCase(),
          buyerPhone: phone.trim(),
          tcKimlik: tc.trim(),
          billingAddress: address.trim(),
          billingCity: city.trim(),
          billingDistrict: district.trim(),
          billingPostalCode: postalCode.trim() || undefined,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Ödeme başlatılamadı");

      const paymentPageUrl = (data as any)?.paymentPageUrl as string | undefined;
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (isMobile && paymentPageUrl) {
        window.location.href = paymentPageUrl;
        return;
      }
      setOpen(false);
      setCheckoutHtml(data.checkoutFormContent);
    } catch (e: any) {
      setError(e?.message || "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  const btnBase = variant === "primary" ? "bg-[#0ea5e9] hover:bg-[#0284c7]" : "bg-[#1B365D] hover:bg-[#0F2547]";
  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none";
  const labelCls = "text-xs font-semibold text-gray-600 block mb-1";

  return (
    <>
      <button
        onClick={() => {
          analytics.courseCtaClick({ course_slug: programmeSlug, cta_location: "course_detail", cta_label: "buy_now" });
          setOpen(true);
        }}
        className={`block w-full text-center py-3.5 rounded-xl font-bold text-white ${btnBase} transition-colors ${className ?? ""}`}
      >
        Şimdi Kayıt Ol · {price}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
          onClick={closeAll}
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
          onKeyDown={(e) => { if (e.key === "Escape") closeAll(); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden my-8" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#0ea5e9]">
                  {step === 1 ? "ADIM 1 · ALICI BİLGİLERİ" : "ADIM 2 · FATURA BİLGİLERİ"}
                </div>
                <div id="course-modal-title" className="font-bold text-[#1B365D] text-lg leading-tight">{programmeTitle}</div>
              </div>
              <button
                onClick={closeAll}
                className="text-gray-400 hover:text-gray-600 text-xl focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] rounded p-1"
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1.5 px-5 pt-3">
              <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-[#0ea5e9]" : "bg-gray-200"}`} />
              <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-[#0ea5e9]" : "bg-gray-200"}`} />
            </div>

            <form onSubmit={submit} className="p-5 space-y-3">
              {step === 1 && (
                <>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Ödemeni tamamla — sonrasında birkaç soruya cevap ver, <b>24 saat içinde</b> seninle iletişime geçelim.
                  </p>
                  <div className="rounded-lg bg-[#f0f7ff] border border-[#0ea5e9]/20 p-3 text-[11px] text-gray-600 leading-relaxed">
                    <strong className="text-[#1B365D]">Bireysel e-Arşiv fatura</strong> otomatik kesilir. Kurumsal (VKN'li) fatura için{" "}
                    <a
                      href="https://wa.me/905066085810?text=Kurumsal%20kurs%20kayd%C4%B1%20i%C3%A7in%20fatura%20bilgi%20almak%20istiyorum."
                      target="_blank" rel="noreferrer"
                      className="text-[#0ea5e9] font-semibold underline"
                    >iletişime geçin</a>.
                  </div>

                  <div>
                    <label className={labelCls}>Ad Soyad *</label>
                    <input required type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className={inputCls} placeholder="Ayşe Yıldız" />
                  </div>
                  <div>
                    <label className={labelCls}>E-posta *</label>
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className={inputCls} placeholder="ayse@ornek.com" />
                  </div>
                  <div>
                    <label className={labelCls}>Telefon *</label>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className={inputCls} placeholder="+90 5XX XXX XX XX" />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    Fatura ve 3D Secure doğrulaması için gerekli bilgiler. Kart bilgin bize ulaşmaz.
                  </p>
                  <div>
                    <label className={labelCls}>TC Kimlik No *</label>
                    <input required type="text" inputMode="numeric" maxLength={11}
                      value={tc} onChange={(e) => setTc(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className={inputCls + " font-mono"} placeholder="11 haneli" />
                  </div>
                  <div>
                    <label className={labelCls}>Açık Adres *</label>
                    <textarea required value={address} onChange={(e) => setAddress(e.target.value)}
                      rows={2} className={inputCls}
                      placeholder="Mahalle, cadde/sokak, bina no, daire no" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>İl *</label>
                      <input required type="text" value={city} onChange={(e) => setCity(e.target.value)}
                        className={inputCls} placeholder="Ankara" />
                    </div>
                    <div>
                      <label className={labelCls}>İlçe *</label>
                      <input required type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                        className={inputCls} placeholder="Çankaya" />
                    </div>
                    <div>
                      <label className={labelCls}>Posta Kodu</label>
                      <input type="text" inputMode="numeric" maxLength={5}
                        value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                        className={inputCls} placeholder="06520" />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed pt-2 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#0ea5e9]" />
                    <span>
                      <a href="/kvkk" target="_blank" className="text-[#0ea5e9] hover:underline">KVKK Aydınlatma Metni</a>'ni okudum,
                      verilerimin kayıt, ödeme ve iletişim amacıyla işlenmesini kabul ediyorum.
                    </span>
                  </label>
                </>
              )}

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">{error}</div>
              )}

              {/* Butonlar */}
              <div className="pt-2 flex gap-2">
                {step === 2 && (
                  <button type="button" onClick={() => { setStep(1); setError(null); }}
                    className="flex-1 py-3 rounded-xl font-bold text-[13px] text-[#1B365D] bg-gray-100 hover:bg-gray-200 transition-colors">
                    ← Geri
                  </button>
                )}
                <button type="submit" disabled={busy}
                  className="flex-[2] py-3 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold text-[13px] transition-colors">
                  {busy ? "Hazırlanıyor..." : step === 1 ? "Devam Et → Fatura Bilgileri" : `Güvenli Ödemeye Geç · ${price}`}
                </button>
              </div>
              <p className="text-[11px] text-center text-gray-400 pt-1">
                🔒 Iyzico 3D Secure · Kart bilgileri bize ulaşmaz
              </p>
            </form>
          </div>
        </div>
      )}

      {checkoutHtml && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          role="dialog" aria-modal="true" aria-label="Iyzico güvenli ödeme"
          onKeyDown={(e) => { if (e.key === "Escape") closeCheckout(); }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto overflow-x-hidden">
            <button onClick={closeCheckout}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]"
              aria-label="Ödemeyi kapat">✕</button>
            <div id="iyzipay-course-checkout-form" className="p-3 sm:p-4" />
          </div>
        </div>
      )}
    </>
  );
}
