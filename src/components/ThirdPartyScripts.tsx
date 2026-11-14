'use client';

import { useEffect } from 'react';
import { getConsent, type CookieConsent } from '@/lib/cookieConsent';

/**
 * 3. taraf script'leri (GTM, Meta Pixel) yükler.
 *
 * GTM: ertelenmiş — ilk kullanıcı etkileşimi (scroll/touch/klavye/pointer) VEYA en geç DELAY_MS
 * sonra. Mobil PageSpeed'de ~380 KiB kullanılmayan JS + ana iş parçacığı maliyetini önlemek için.
 *
 * Meta Pixel SDK (fbevents.js):
 *   - Pazarlama izni ZATEN varsa beklemeden yüklenir. Asıl yükleme layout <head>'deki stub'da,
 *     React'ten önce yapılır; buradaki kontrol yalnızca yedek (head script'i çalışmadıysa).
 *   - İzin sayfa açıkken verilirse ('cookie-consent-updated'), o anda yüklenir.
 *   - İzin yoksa eskisi gibi ertelenmiş yüklenir; consent 'revoke' durumunda olay göndermez.
 *   Neden: Instagram reklamından gelen ve 3,5 sn dolmadan çıkan kullanıcılar Meta'da
 *   "açılış sayfası görüntüleme" olarak hiç sayılmıyordu.
 *
 * Stub'lar (dataLayer, fbq queue, consent default) layout <head>'de inline kalır → çağrılar kuyruklanır.
 */

const DELAY_MS = 3500;
const EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'keydown', 'scroll', 'wheel'];
const PIXEL_SDK = 'https://connect.facebook.net/en_US/fbevents.js';

declare global {
  interface Window {
    __sphereThirdPartyLoaded?: boolean;
    __spherePixelSdk?: boolean;
  }
}

function injectScript(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

/** Pixel SDK'yı bir kez yükle (head stub zaten yüklediyse tekrar yüklemez) */
function loadPixelSdk(pixelId?: string) {
  if (!pixelId || window.__spherePixelSdk) return;
  window.__spherePixelSdk = true;
  injectScript(PIXEL_SDK);
}

function loadDeferred(gtmId?: string, pixelId?: string) {
  if (window.__sphereThirdPartyLoaded) return;
  window.__sphereThirdPartyLoaded = true;

  if (gtmId) {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
  }
  // İzin yoksa da SDK eskisi gibi ertelenmiş iner (revoke modunda olay göndermez)
  loadPixelSdk(pixelId);
}

export default function ThirdPartyScripts({ gtmId, pixelId }: { gtmId?: string; pixelId?: string }) {
  // Pixel: izin varsa hemen, izin sonradan verilirse o anda
  useEffect(() => {
    if (!pixelId) return;
    if (getConsent()?.marketing) loadPixelSdk(pixelId);
    const onConsent = (e: Event) => {
      if ((e as CustomEvent<CookieConsent>).detail?.marketing) loadPixelSdk(pixelId);
    };
    window.addEventListener('cookie-consent-updated', onConsent);
    return () => window.removeEventListener('cookie-consent-updated', onConsent);
  }, [pixelId]);

  // GTM (ve izinsiz durumda Pixel SDK): ilk etkileşim ya da DELAY_MS
  useEffect(() => {
    if (!gtmId && !pixelId) return;
    // Lighthouse / bot: etkileşim yok → timer ile yine yüklenir (gerçek kullanıcı kaybı olmasın)
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      cleanup();
      loadDeferred(gtmId, pixelId);
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
