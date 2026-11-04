'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getConsent } from '@/lib/cookieConsent';

/**
 * Site pop-up'ı — admin panelinden (Site Pop-up'ları) yönetilir.
 *  - Duyuru: başlık, metin, görsel, buton
 *  - Bülten: e-posta + onay → kişiye özel tek kullanımlık kupon (ekranda + e-postada)
 * Kurallar: çerez tercihi verilmeden çıkmaz (banner'la üst üste binmesin), sepet/ödeme sayfalarında çıkmaz,
 * kapatılınca admin'de belirlenen gün kadar tekrar gösterilmez, bültene kaydolmuş ziyaretçiye bülten pop-up'ı çıkmaz.
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://app.sphereenglish.com').replace(/\/$/, '');
const SKIP_PATHS = ['/sepet', '/odeme', '/checkout'];
const SUBSCRIBED_KEY = 'sphere_newsletter_subscribed';

interface Popup {
  id: number; kind: 'announcement' | 'newsletter'; title: string; body: string | null; imageUrl: string | null;
  ctaText: string | null; ctaUrl: string | null; delaySeconds: number; frequencyDays: number;
  couponLabel: string | null; consentText: string | null; updatedAt: string;
}

const ls = {
  get(k: string) { try { return window.localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { window.localStorage.setItem(k, v); } catch { /* gizli sekme vb. */ } },
};
const ss = {
  get(k: string) { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { window.sessionStorage.setItem(k, v); } catch { /* yoksay */ } },
};
/** Pop-up içeriği değişirse (updatedAt) eski "kapattım" kaydı geçersiz olsun */
const dismissKey = (p: Popup) => `sphere_popup_${p.id}_${p.updatedAt}`;

function isSuppressed(p: Popup): boolean {
  if (p.kind === 'newsletter' && ls.get(SUBSCRIBED_KEY)) return true;
  if (p.frequencyDays <= 0) return !!ss.get(dismissKey(p)); // her ziyarette bir kez
  const at = Number(ls.get(dismissKey(p)) ?? 0);
  return at > 0 && Date.now() - at < p.frequencyDays * 86400000;
}

function track(id: number, type: 'view' | 'click') {
  fetch(`${API_BASE}/api/popups/${id}/event`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }), keepalive: true,
  }).catch(() => {});
}

export default function SitePopup() {
  const pathname = usePathname() ?? '/';
  const [popup, setPopup] = useState<Popup | null>(null);
  const [open, setOpen] = useState(false);
  const shownRef = useRef(false);
  const skip = SKIP_PATHS.some((p) => pathname.startsWith(p));

  // Uygun pop-up'ı bir kez seç
  useEffect(() => {
    if (skip || shownRef.current) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/popups/active`)
      .then((r) => (r.ok ? r.json() : { popups: [] }))
      .then((d: { popups: Popup[] }) => {
        if (cancelled) return;
        const p = (d.popups ?? []).find((x) => !isSuppressed(x));
        if (p) setPopup(p);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [skip]);

  // Gecikme + çerez tercihi verildikten sonra aç
  useEffect(() => {
    if (!popup || skip || shownRef.current) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startTimer = () => {
      timer = setTimeout(() => {
        shownRef.current = true;
        setOpen(true);
        track(popup.id, 'view');
      }, Math.max(0, popup.delaySeconds) * 1000);
    };
    if (getConsent()) { startTimer(); return () => clearTimeout(timer); }
    const poll = setInterval(() => { if (getConsent()) { clearInterval(poll); startTimer(); } }, 1500);
    return () => { clearInterval(poll); clearTimeout(timer); };
  }, [popup, skip]);

  const close = useCallback(() => {
    if (popup) {
      if (popup.frequencyDays <= 0) ss.set(dismissKey(popup), '1');
      else ls.set(dismissKey(popup), String(Date.now()));
    }
    setOpen(false);
  }, [popup]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open || !popup) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="site-popup-title">
      <div className="absolute inset-0 bg-[#0b1f3a]/55" onClick={close} aria-hidden="true" />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <button onClick={close} aria-label="Kapat"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1e3a6e] grid place-items-center shadow text-xl leading-none">×</button>
        {popup.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={popup.imageUrl} alt="" className="w-full max-h-56 object-cover" />
        )}
        <div className="p-6">
          <h2 id="site-popup-title" className="text-[21px] font-extrabold text-[#1e3a6e] leading-snug pr-8">{popup.title}</h2>
          {popup.body && <p className="mt-2 text-[14.5px] text-gray-600 leading-relaxed whitespace-pre-line">{popup.body}</p>}
          {popup.kind === 'newsletter'
            ? <NewsletterForm popup={popup} />
            : popup.ctaText && popup.ctaUrl && (
              <a href={popup.ctaUrl} onClick={() => { track(popup.id, 'click'); ls.set(dismissKey(popup), String(Date.now())); }}
                className="mt-5 block w-full text-center py-3 rounded-xl bg-[#1e3a6e] hover:bg-[#16305c] text-white font-bold text-[15px]">
                {popup.ctaText}
              </a>
            )}
          <button onClick={close} className="mt-3 w-full text-center text-[13px] text-gray-500 hover:text-gray-700">Şimdi değil</button>
        </div>
      </div>
    </div>
  );
}

function NewsletterForm({ popup }: { popup: Popup }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; label: string; validUntil: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'loading') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setState('error'); setMsg('Geçerli bir e-posta adresi gir.'); return; }
    if (!consent) { setState('error'); setMsg('Devam etmek için onay kutusunu işaretle.'); return; }
    setState('loading');
    try {
      const r = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent: true, popupId: popup.id, website }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setState('error'); setMsg(d.error ?? 'Kayıt şu an alınamadı.'); return; }
      ls.set(SUBSCRIBED_KEY, String(Date.now()));
      setCoupon(d.coupon ?? null);
      setMsg(d.alreadySubscribed ? 'Bu adres zaten bültenimizde kayıtlı. Teşekkürler!' : 'Kaydın alındı, teşekkürler!');
      setState('done');
    } catch {
      setState('error'); setMsg('Bağlantı hatası, birazdan tekrar dene.');
    }
  }

  if (state === 'done') {
    return (
      <div className="mt-5" aria-live="polite">
        <p className="text-[14.5px] text-gray-700">{msg}</p>
        {coupon && (
          <>
            <p className="mt-3 text-[14px] text-gray-700">Sana özel <b className="text-[#1e3a6e]">{coupon.label}</b> kuponun:</p>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(coupon.code).then(() => setCopied(true)).catch(() => {}); }}
              className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-[#13a9e0] text-[20px] font-extrabold tracking-wider text-[#1e3a6e]">
              {coupon.code}
            </button>
            <p className="mt-1.5 text-[12px] text-gray-500">
              {copied ? 'Kopyalandı ✓ ' : 'Kopyalamak için dokun · '}
              Tek kullanımlık · {new Date(coupon.validUntil).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} tarihine kadar · E-postana da gönderdik.
            </p>
            <a href="/e-kitaplar" className="mt-4 block w-full text-center py-3 rounded-xl bg-[#1e3a6e] text-white font-bold text-[15px]">E-kitaplara göz at</a>
          </>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-3" noValidate>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta adresin" autoComplete="email"
        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-[15px] focus:outline-none focus:border-[#13a9e0]" />
      <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute -left-[9999px] w-px h-px opacity-0" />
      <label className="flex gap-2 items-start text-[12px] text-gray-600 leading-snug cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 flex-shrink-0" />
        <span>{popup.consentText} <a href="/kvkk" target="_blank" className="text-[#0e7da6] underline">KVKK aydınlatma metni</a></span>
      </label>
      {state === 'error' && <p className="text-[13px] text-red-600" role="alert">{msg}</p>}
      <button type="submit" disabled={state === 'loading'}
        className="w-full py-3 rounded-xl bg-[#1e3a6e] hover:bg-[#16305c] text-white font-bold text-[15px] disabled:opacity-60">
        {state === 'loading' ? 'Gönderiliyor…' : popup.couponLabel ? `Kuponumu al (${popup.couponLabel})` : 'Kaydol'}
      </button>
    </form>
  );
}
