'use client';

import { useEffect } from 'react';
import { getConsent, type CookieConsent } from '@/lib/cookieConsent';
import { isLinkedInEnabled, loadLinkedInInsight } from '@/lib/analytics/linkedin';

/**
 * LinkedIn Insight Tag — rıza kapılı yükleyici.
 *
 * Sayfa açılışında kayıtlı rızada `marketing: true` ise SDK'yı yükler;
 * değilse CookieConsent'in yaydığı `cookie-consent-updated` olayını bekler.
 * Performans: ThirdPartyScripts ile aynı mantık (ilk etkileşim / 3.5 sn) yerine
 * doğrudan rızaya bağlı — rıza banner'ına tıklamak zaten bir etkileşim.
 */
export default function LinkedInInsight() {
  useEffect(() => {
    if (!isLinkedInEnabled()) return;

    const maybeLoad = (c: CookieConsent | null) => {
      if (c?.marketing) loadLinkedInInsight();
    };

    maybeLoad(getConsent());

    const onUpdate = (e: Event) => maybeLoad((e as CustomEvent<CookieConsent>).detail ?? null);
    window.addEventListener('cookie-consent-updated', onUpdate);
    return () => window.removeEventListener('cookie-consent-updated', onUpdate);
  }, []);

  return null;
}
