"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://app.sphereenglish.com";

const SECTORS = [
  "Finans / Bankacılık", "Teknoloji / Yazılım", "Otomotiv", "Tekstil / Hazır Giyim",
  "Turizm / Otelcilik", "Sağlık", "İnşaat / Gayrimenkul", "Gıda / Perakende",
  "E-ticaret", "Lojistik / Tedarik", "Üretim / İmalat", "Pazarlama / Reklam",
  "İnsan Kaynakları", "Danışmanlık", "Enerji", "Medya / Yayıncılık",
  "Eğitim", "Hukuk", "Diğer",
];

type Order = {
  order_token: string;
  programme_title: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  status: string;
  registration_completed_at: string | null;
};

export default function RegistrationForm({ orderToken }: { orderToken: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tcKimlik, setTcKimlik] = useState("");
  const [age, setAge] = useState("");
  const [sector, setSector] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!orderToken) { setError("Sipariş tokenı eksik"); setLoading(false); return; }
    fetch(`${API_BASE}/api/course-orders/${orderToken}`)
      .then(r => r.json())
      .then(d => {
        if (d.order) {
          setOrder(d.order);
          if (d.order.status === "registered") setDone(true);
        } else {
          setError(d.error || "Sipariş bulunamadı");
        }
      })
      .catch(() => setError("Sipariş bilgisi alınamadı"))
      .finally(() => setLoading(false));
  }, [orderToken]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{11}$/.test(tcKimlik)) {
      setError("TC Kimlik No 11 haneli olmalı");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (!ageNum || ageNum < 15 || ageNum > 99) {
      setError("Geçerli bir yaş gir");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(`${API_BASE}/api/course-orders/${orderToken}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tcKimlik, age: ageNum, sector, gender }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d?.error || "Form kaydedilemedi");
      setDone(true);
    } catch (e: any) {
      setError(e?.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-rose-900 mb-2">Sipariş Bulunamadı</h1>
        <p className="text-sm text-rose-700">{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-10 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1B365D] mb-3">
          Kaydın Tamamlandı!
        </h1>
        <p className="text-[16px] text-gray-700 leading-relaxed mb-6 max-w-md mx-auto">
          <strong>{order.programme_title}</strong> programına hoş geldin, <strong>{order.buyer_name}</strong>.
        </p>
        <div className="bg-white rounded-xl p-5 max-w-md mx-auto border border-emerald-200 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 mb-2">
            SONRAKİ ADIM
          </div>
          <p className="text-[15px] text-gray-800 leading-relaxed">
            En geç <strong>24 saat içinde</strong> ekibimiz seninle iletişime geçecek.
            Grup ataması, ders takvimi ve giriş bilgileri e-postanla iletilecek.
          </p>
        </div>
        <div className="bg-[#f0f7ff] rounded-xl p-4 max-w-md mx-auto border border-[#0ea5e9]/25 mb-6 text-[12px] text-gray-600 leading-relaxed">
          <strong className="text-[#1B365D]">e-Arşiv faturanız</strong> birkaç dakika içinde e-postanıza gönderilir.
          Kurumsal (VKN'li) fatura mı gerekli?{' '}
          <a
            href="https://wa.me/905066085810?text=Kurumsal%20fatura%20i%C3%A7in%20yard%C4%B1m%20istiyorum."
            target="_blank"
            rel="noreferrer"
            className="text-[#0ea5e9] font-semibold underline"
          >
            WhatsApp ile iletişime geçin
          </a>.
        </div>
        <div className="text-[13px] text-gray-500">
          Sorularin için: <a href="mailto:info@sphereenglish.com" className="text-[#0ea5e9] hover:underline">info@sphereenglish.com</a>
          <br />
          <a href="https://wa.me/905066085810" className="text-[#0ea5e9] hover:underline">WhatsApp: +90 506 608 58 10</a>
        </div>
        <a href="/" className="inline-block mt-8 text-[13px] text-gray-500 hover:text-[#1B365D]">← Ana sayfaya dön</a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#1B365D] to-[#0ea5e9] text-white p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest opacity-90 mb-1">
          ✓ ÖDEME ALINDI · SON ADIM
        </div>
        <h1 className="text-2xl font-extrabold leading-tight mb-2">
          Kayıt Formu
        </h1>
        <p className="text-[14px] opacity-90 leading-relaxed">
          Program: <strong>{order.programme_title}</strong>
        </p>
      </div>

      <form onSubmit={submit} className="p-6 space-y-4">
        <p className="text-[13px] text-gray-600 leading-relaxed border-l-4 border-[#0ea5e9] bg-[#f0f7ff] p-3 rounded">
          Grup ataması için birkaç bilgiye ihtiyacımız var. Bilgiler <strong>gizli</strong> tutulur, sadece grup oluşturma amacıyla kullanılır.
        </p>

        {/* Locked buyer info */}
        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
          <div><span className="text-gray-500">İsim:</span> <strong>{order.buyer_name}</strong></div>
          <div><span className="text-gray-500">E-posta:</span> <strong>{order.buyer_email}</strong></div>
          <div><span className="text-gray-500">Telefon:</span> <strong>{order.buyer_phone}</strong></div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">TC Kimlik No *</label>
          <input required type="text" inputMode="numeric" maxLength={11} value={tcKimlik}
            onChange={(e) => setTcKimlik(e.target.value.replace(/\D/g, "").slice(0, 11))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono"
            placeholder="11 haneli" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Yaş *</label>
            <input required type="number" min={15} max={99} value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
              placeholder="30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Cinsiyet *</label>
            <select required value={gender} onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
              <option value="">Seç</option>
              <option value="kadin">Kadın</option>
              <option value="erkek">Erkek</option>
              <option value="belirtmek_istemiyorum">Belirtmek istemiyorum</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Sektörün *</label>
          <select required value={sector} onChange={(e) => setSector(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm">
            <option value="">Sektör seç</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">{error}</div>
        )}

        <button type="submit" disabled={submitting}
          className="w-full rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] disabled:opacity-50 text-white font-bold py-3.5 transition-colors">
          {submitting ? "Kaydediliyor..." : "Kaydı Tamamla"}
        </button>
      </form>
    </div>
  );
}
