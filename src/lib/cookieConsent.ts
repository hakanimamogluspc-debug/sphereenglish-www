/**
 * Çerez rızası yönetimi — KVKK/GDPR uyumlu.
 *
 * Google Consent Mode v2 + Meta Pixel consent + LinkedIn (ileride).
 *
 * Kategoriler:
 *   - necessary : session/cart/auth (opt-out yok, her zaman açık)
 *   - analytics : GA4, GTM analytics tag'leri
 *   - marketing : Meta Pixel, LinkedIn Ads, retargeting
 *
 * Kullanıcının seçimi localStorage'da 12 ay tutulur.
 * Yeni versiyonda yeniden onay: CONSENT_VERSION bump.
 */

export const CONSENT_STORAGE_KEY = 'sphere_cookie_consent_v1';
export const CONSENT_VERSION = 1;
export const CONSENT_TTL_DAYS = 365;

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing';

export interface CookieConsent {
  version: number;
  timestamp: number;
  necessary: true; // zorunlu, hep true
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_DENY: CookieConsent = {
  version: CONSENT_VERSION,
  timestamp: 0,
  necessary: true,
  analytics: false,
  marketing: false,
};

const ACCEPT_ALL: Omit<CookieConsent, 'version' | 'timestamp'> = {
  necessary: true,
  analytics: true,
  marketing: true,
};

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CookieConsent;
    // Version farkı → tekrar sor
    if (c.version !== CONSENT_VERSION) return null;
    // 12 aydan eskiyse tekrar sor
    const ageDays = (Date.now() - c.timestamp) / (1000 * 60 * 60 * 24);
    if (ageDays > CONSENT_TTL_DAYS) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConsent(partial: Partial<Omit<CookieConsent, 'version' | 'timestamp' | 'necessary'>>): CookieConsent {
  const consent: CookieConsent = {
    ...DEFAULT_DENY,
    ...partial,
    necessary: true,
    version: CONSENT_VERSION,
    timestamp: Date.now(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  }
  applyConsent(consent);
  return consent;
}

export function acceptAll(): CookieConsent {
  return saveConsent(ACCEPT_ALL);
}

export function rejectAll(): CookieConsent {
  return saveConsent({ analytics: false, marketing: false });
}

/**
 * Consent değişikliğini Google Consent Mode v2 + Meta Pixel'e uygula.
 */
export function applyConsent(consent: CookieConsent) {
  if (typeof window === 'undefined') return;

  // ─── Google Consent Mode v2 ──────────────────────────────
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  const gtag = (...args: any[]) => w.dataLayer.push(args);

  gtag('consent', 'update', {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted', // necessary
    personalization_storage: consent.marketing ? 'granted' : 'denied',
    security_storage: 'granted', // her zaman
  });

  // ─── Meta Pixel Consent ──────────────────────────────────
  if (typeof w.fbq === 'function') {
    w.fbq('consent', consent.marketing ? 'grant' : 'revoke');
  }

  // ─── LinkedIn Ads (ileride) ─────────────────────────────
  // if (typeof w._lintrk === 'function') { ... }

  // Custom event — diğer script'ler dinleyebilir
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: consent }));
}

/**
 * Sayfa yüklenirken — kayıtlı consent varsa uygula.
 * Yoksa hâlâ default deny state'te kalır (Consent Mode init'te set edildi).
 */
export function initConsentOnLoad() {
  if (typeof window === 'undefined') return;
  const existing = getConsent();
  if (existing) applyConsent(existing);
}
