'use client';

import { useEffect } from 'react';

/**
 * 3. taraf script'leri (GTM, Meta Pixel) ertelenmiş yükler.
 *
 * Neden: Bu script'ler <head>'de senkron yüklendiğinde mobil PageSpeed'de
 * ~380 KiB kullanılmayan JS + 1.5 sn ana iş parçacığı maliyeti çıkarıyordu.
 *
 * Strateji: ilk kullanıcı etkileşimi (scroll/touch/klavye/pointer) VEYA
 * en geç DELAY_MS sonra yükle — hangisi önce gelirse. Böylece LCP/TBT
 * ölçülürken script'ler yok, ama gerçek kullanıcı için analitik kaybı
 * pratikte sıfır (PageView birkaç saniye gecikir).
 *
 * Stub'lar (dataLayer, fbq queue, consent default) layout <head>'de inline
 * kalır → CookieConsent / MetaPixelRouteTracker / ContactClickTracker
 * script yüklenmeden önce çağırsa bile kuyruklanır, kaybolmaz.
 */

const DELAY_MS = 3500;
const EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];

declare global {
  interface Window {
    __sphereThirdPartyLoaded?: boolean;
  }
}

function injectScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadAll(gtmId?: string, pixelId?: string) {
  if (window.__sphereThirdPartyLoaded) return;
  window.__sphereThirdPartyLoaded = true;

  if (gtmId) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
  }

  if (pixelId) {
    // fbq stub head'de tanımlı; burada sadece asıl SDK'yı indiriyoruz.
    injectScript('https://connect.facebook.net/en_US/fbevents.js');
  }
}

export default function ThirdPartyScripts({ gtmId, pixelId }: { gtmId?: string; pixelId?: string }) {
  useEffect(() => {
    if (!gtmId && !pixelId) return;
    // Lighthouse / bot: etkileşim yok → timer ile yine yüklenir (gerçek kullanıcı kaybı olmasın)
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      cleanup();
      loadAll(gtmId, pixelId);
    };
    const cleanup = () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, fire));
      clearTimeout(timer);
    };
    EVENTS.forEach((ev) => window.addEventListener(ev, fire, { passive: true, once: true }));
    const timer = window.setTimeout(fire, DELAY_MS);
    return cleanup;
  }, [gtmId, pixelId]);

  return null;
}
