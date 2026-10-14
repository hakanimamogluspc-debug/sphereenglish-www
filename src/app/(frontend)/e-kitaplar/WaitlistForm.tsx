'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://app.sphereenglish.com').replace(/\/$/, '');

export interface InterestOption { key: string; label: string }

export default function WaitlistForm({ interests }: { interests: InterestOption[] }) {
  const [email, setEmail] = useState('');
  const [area, setArea] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'loading') return;
    const em = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) {
      setState('error'); setMsg('Geçerli bir e-posta adresi girin.'); return;
    }
    setState('loading');
    try {
      const r = await fetch(`${API_BASE}/api/ebook-marketing/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: em, interestArea: area || undefined, source: 'ekitaplar-page', website }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { setState('error'); setMsg(data.error || 'Kayıt alınamadı, lütfen tekrar deneyin.'); return; }
      setState('ok');
      setMsg(data.alreadySubscribed
        ? 'Bu e-posta zaten listede. Yeni kitap çıkınca haber vereceğiz.'
        : 'Teşekkürler! Kaydınız alındı — onay e-postası gönderdik.');
    } catch {
      setState('error'); setMsg('Bağlantı hatası. Lütfen tekrar deneyin.');
    }
  }

  if (state === 'ok') {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 flex items-start gap-3" role="status">
        <span className="w-8 h-8 rounded-full bg-emerald-500 text-white grid place-items-center flex-shrink-0"><Check size={16} /></span>
        <div>
          <b className="text-[#1B365D] text-[15px]">Kaydınız alındı</b>
          <p className="text-[13px] text-gray-600 mt-1">{msg}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl bg-white border border-[#e6ebf2] p-6 shadow-sm grid gap-3">
      <b className="text-[#1B365D] text-[17px] leading-tight">Yeni kitaplardan ilk siz haberdar olun</b>
      <div>
        <label htmlFor="wl-email" className="block text-[12px] font-semibold text-gray-600 mb-1">E-posta adresiniz</label>
        <input id="wl-email" type="email" autoComplete="email" placeholder="ad@sirket.com" required
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ebf2] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 focus:border-[#0ea5e9]" />
      </div>
      <div>
        <label htmlFor="wl-area" className="block text-[12px] font-semibold text-gray-600 mb-1">İlgilendiğiniz alan</label>
        <select id="wl-area" value={area} onChange={(e) => setArea(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#e6ebf2] text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/40 focus:border-[#0ea5e9]">
          <option value="">Tüm yeni kitaplar</option>
          {interests.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
        </select>
      </div>
      {/* Honeypot — görünmez, botlar doldurur */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)}
        className="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
      <button type="submit" disabled={state === 'loading'}
        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1B365D] hover:bg-[#24467a] text-white font-bold text-[14px] transition-colors disabled:opacity-60">
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : null} Haber ver
      </button>
      {state === 'error' && <p className="text-[12px] text-red-600" role="alert">{msg}</p>}
      <small className="text-[11px] text-gray-500">Sadece yeni kitap duyuruları gönderilir. KVKK kapsamında korunur.</small>
    </form>
  );
}
