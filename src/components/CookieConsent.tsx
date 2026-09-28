'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getConsent, saveConsent, acceptAll, rejectAll, initConsentOnLoad,
  type CookieConsent as ConsentT,
} from '@/lib/cookieConsent';

/**
 * KVKK/GDPR uyumlu çerez rıza banner'ı.
 *
 * - İlk ziyarette banner altta çıkar (sticky).
 * - "Kabul Et" / "Sadece Zorunlu" / "Ayarlar" 3 buton.
 * - Ayarlar modalı: analytics / marketing toggle.
 * - Rıza verildikten sonra 12 ay saklanır, tekrar sorulmaz.
 *
 * Footer'daki "Çerez Ayarları" linki `?cookie-settings=1` ile modal'ı yeniden açar.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    // Kayıtlı consent'i uygula (varsa)
    initConsentOnLoad();

    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setPrefs({ analytics: existing.analytics, marketing: existing.marketing });
    }

    // URL parametresi ile yeniden aç
    if (new URLSearchParams(window.location.search).get('cookie-settings') === '1') {
      setShowSettings(true);
      setVisible(true);
    }

    // Footer link'ten trigger
    const handler = () => {
      const c = getConsent();
      if (c) setPrefs({ analytics: c.analytics, marketing: c.marketing });
      setShowSettings(true);
      setVisible(true);
    };
    window.addEventListener('open-cookie-settings', handler);
    return () => window.removeEventListener('open-cookie-settings', handler);
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setVisible(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setVisible(false);
  };

  const handleSaveSelection = () => {
    saveConsent({ analytics: prefs.analytics, marketing: prefs.marketing });
    setVisible(false);
    setShowSettings(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Ana Banner */}
      {!showSettings && (
        <div
          role="dialog"
          aria-labelledby="cookie-banner-title"
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[100] bg-white rounded-2xl shadow-2xl border border-slate-200 p-5"
          style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.25)' }}
        >
          <h2 id="cookie-banner-title" className="font-bold text-[#1B365D] text-base mb-2">
            🍪 Çerez Kullanımı
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Web sitemizde deneyiminizi geliştirmek, kullanımı analiz etmek ve pazarlama içeriklerini
            kişiselleştirmek için çerezler kullanıyoruz. "Kabul Et" ile tümüne izin verebilir, ayarlardan
            seçim yapabilirsiniz.{' '}
            <Link href="/gizlilik-politikasi" className="text-[#0ea5e9] underline hover:no-underline">
              Detaylar
            </Link>
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-2.5 px-4 rounded-full text-sm transition"
            >
              Kabul Et
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-full text-sm transition"
            >
              Sadece Zorunlu
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-slate-500 hover:text-[#1B365D] text-xs font-semibold py-2.5 px-3 underline"
            >
              Ayarlar
            </button>
          </div>
        </div>
      )}

      {/* Detay Ayarlar Modalı */}
      {showSettings && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1B365D]">Çerez Ayarları</h2>
                <button
                  onClick={() => { setVisible(false); setShowSettings(false); }}
                  className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
                  aria-label="Kapat"
                >×</button>
              </div>

              <p className="text-sm text-slate-600 mb-5">
                Hangi çerez kategorilerini kabul ettiğinizi seçin. Zorunlu çerezler site işleyişi için
                gereklidir ve kapatılamaz.
              </p>

              <div className="space-y-3 mb-5">
                {/* Zorunlu */}
                <div className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 pr-3">
                    <div className="font-semibold text-[#1B365D] text-sm">🔒 Zorunlu Çerezler</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Oturum, sepet, güvenlik. Site çalışması için şart. Kapatılamaz.
                    </div>
                  </div>
                  <div className="w-11 h-6 bg-emerald-500 rounded-full relative shrink-0 mt-1">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                  </div>
                </div>

                {/* Analitik */}
                <label className="flex items-start justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div className="flex-1 pr-3">
                    <div className="font-semibold text-[#1B365D] text-sm">📊 Analitik Çerezler</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Google Analytics, Google Tag Manager. Site kullanımını anonim analiz eder.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={prefs.analytics}
                    onChange={(v) => setPrefs({ ...prefs, analytics: v })}
                  />
                </label>

                {/* Reklam */}
                <label className="flex items-start justify-between p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                  <div className="flex-1 pr-3">
                    <div className="font-semibold text-[#1B365D] text-sm">🎯 Pazarlama Çerezleri</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Meta Pixel, retargeting reklamları. Reklamları daha alakalı hale getirir.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={prefs.marketing}
                    onChange={(v) => setPrefs({ ...prefs, marketing: v })}
                  />
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold py-2.5 px-4 rounded-full text-sm transition"
                >
                  Tümünü Kabul Et
                </button>
                <button
                  onClick={handleSaveSelection}
                  className="flex-1 bg-[#1B365D] hover:bg-[#12213e] text-white font-semibold py-2.5 px-4 rounded-full text-sm transition"
                >
                  Seçimimi Kaydet
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500 text-center">
                <Link href="/gizlilik-politikasi" className="text-[#0ea5e9] underline">
                  Gizlilik Politikası
                </Link>
                {' · '}
                <Link href="/kvkk" className="text-[#0ea5e9] underline">
                  KVKK Aydınlatma
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      className={`relative shrink-0 mt-1 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
