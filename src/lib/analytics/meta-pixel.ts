/**
 * Meta Pixel Event Helper
 *
 * Type-safe wrapper — window.fbq'nin yükleme durumunu kontrol eder,
 * yoksa sessizce atlayıp uygulama akışını bozmaz.
 *
 * Örnek:
 *   trackMetaEvent('Purchase', {
 *     value: 199,
 *     currency: 'TRY',
 *     content_ids: ['ebook-67'],
 *     content_type: 'product',
 *   });
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Meta'nın standart event isimleri */
export type MetaStandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe';

/**
 * Meta Pixel standart event tetikle.
 * Client-side (browser) çağrılmalı. SSR'de sessizce hiçbir şey yapmaz.
 */
export function trackMetaEvent(
  event: MetaStandardEvent,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;
  try {
    if (params) {
      fbq('track', event, params);
    } else {
      fbq('track', event);
    }
  } catch {
    /* Pixel yüklenmedi veya devre dışı — sessizce geç */
  }
}

/**
 * Custom (özel) event tetikle. Meta panelinde "Custom Conversion" olarak görür.
 * Örnek: 'LandingPageCTAClick', 'PlacementTestStart'
 */
export function trackMetaCustomEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  const fbq = window.fbq;
  if (typeof fbq !== 'function') return;
  try {
    if (params) {
      fbq('trackCustom', eventName, params);
    } else {
      fbq('trackCustom', eventName);
    }
  } catch {
    /* ignore */
  }
}

// ─── Sphere için hazır kısayollar ────────────────────────────────────────

/** E-kitap detay sayfası görüntülendi */
export function trackViewEbook(opts: { ebookId: number | string; title: string; priceTry: number }) {
  trackMetaEvent('ViewContent', {
    content_ids: [`ebook-${opts.ebookId}`],
    content_type: 'product',
    content_name: opts.title,
    content_category: 'e-book',
    value: opts.priceTry,
    currency: 'TRY',
  });
}

/** "Satın Al" butonuna tıklandı (e-kitap veya abonelik) */
export function trackAddToCart(opts: {
  productId: string;
  productName: string;
  priceTry: number;
  type: 'ebook' | 'subscription';
}) {
  trackMetaEvent('AddToCart', {
    content_ids: [opts.productId],
    content_type: 'product',
    content_name: opts.productName,
    content_category: opts.type,
    value: opts.priceTry,
    currency: 'TRY',
  });
}

/** Iyzico checkout başlatıldı */
export function trackInitiateCheckout(opts: {
  productId: string;
  priceTry: number;
  type: 'ebook' | 'subscription';
}) {
  trackMetaEvent('InitiateCheckout', {
    content_ids: [opts.productId],
    content_type: 'product',
    content_category: opts.type,
    value: opts.priceTry,
    currency: 'TRY',
    num_items: 1,
  });
}

/** Ödeme tamamlandı — EN KRİTİK EVENT */
export function trackPurchase(opts: {
  productId: string;
  productName: string;
  priceTry: number;
  type: 'ebook' | 'subscription';
  orderId?: string;
}) {
  trackMetaEvent('Purchase', {
    content_ids: [opts.productId],
    content_type: 'product',
    content_name: opts.productName,
    content_category: opts.type,
    value: opts.priceTry,
    currency: 'TRY',
    order_id: opts.orderId,
  });
}

/** İletişim formu / lead ads dolduruldu */
export function trackLead(opts?: { source?: string; value?: number }) {
  trackMetaEvent('Lead', {
    content_category: opts?.source ?? 'contact_form',
    value: opts?.value ?? 0,
    currency: 'TRY',
  });
}

/** Yeni hesap kaydı tamamlandı */
export function trackRegistration(opts?: { method?: string }) {
  trackMetaEvent('CompleteRegistration', {
    content_name: opts?.method ?? 'email',
    status: true,
  });
}
