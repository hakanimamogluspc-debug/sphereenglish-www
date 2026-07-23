/**
 * Meta Conversions API (CAPI) — server-side event forwarding.
 *
 * Neden CAPI?
 * - Meta Pixel (client-side) iOS 14+ ATT ve adblock nedeniyle event'lerin
 *   %30-50'sini kaybediyor. CAPI ile aynı event'i server-side Meta'ya
 *   göndererek kaybı telafi ediyoruz.
 *
 * Deduplication:
 * - Her event'e deterministik `event_id` veriyoruz (örn: `purchase_ORDER123`)
 * - Client Pixel de aynı event_id'yi `fbq('track', ..., {eventID})` ile gönderiyor
 * - Meta iki taraftan gelen aynı event_id'yi TEK sayıyor
 *
 * Kurulum:
 * - env: META_CAPI_ACCESS_TOKEN (Meta Events Manager → Settings → Generate Token)
 * - env: NEXT_PUBLIC_META_PIXEL_ID (mevcut, aynısı kullanılır)
 *
 * Kullanım:
 *   await sendCapiEvent({
 *     eventName: 'Purchase',
 *     eventId: `purchase_${orderId}`,
 *     eventSourceUrl: 'https://www.sphereenglish.com/odeme/basarili',
 *     userData: { email, phone, clientIpAddress, clientUserAgent, fbp, fbc },
 *     customData: { value: 199, currency: 'TRY', contentIds: ['ebook-42'] },
 *   });
 */

import { createHash } from 'node:crypto';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2156406151837976';
// Yeni tercih: META_CAPI_ACCESS_TOKEN. Eski contact route eski adı kullanıyordu,
// geri uyumluluk için fallback ekli.
const ACCESS_TOKEN =
  process.env.META_CAPI_ACCESS_TOKEN || process.env.META_CONVERSIONS_API_TOKEN || '';
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE || ''; // Events Manager → Test Events'te göstermek için

const CAPI_ENDPOINT = `https://graph.facebook.com/v20.0/${PIXEL_ID}/events`;

// ─── Types ────────────────────────────────────────────────────────────
export type MetaCapiEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Subscribe'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact';

export interface CapiUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string; // ISO 3166-1 alpha-2 (TR)
  clientIpAddress?: string;
  clientUserAgent?: string;
  /** Facebook browser ID cookie (_fbp) — client tarafından geliyor */
  fbp?: string;
  /** Facebook click ID cookie (_fbc) — client tarafından geliyor */
  fbc?: string;
  /** Event Manager Advanced Matching için — ilgili user'ın FB ID'si */
  externalId?: string;
}

export interface CapiCustomData {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: 'product' | 'product_group';
  contentName?: string;
  contentCategory?: string;
  numItems?: number;
  orderId?: string;
  /** Predicted LTV — Subscribe için */
  predictedLtv?: number;
}

export interface CapiEventInput {
  eventName: MetaCapiEventName;
  /** Deduplication anahtarı — client Pixel'de aynı ID kullanılmalı */
  eventId: string;
  /** Ziyaretçinin bulunduğu sayfa URL'i */
  eventSourceUrl: string;
  userData: CapiUserData;
  customData?: CapiCustomData;
  /** Event zamanı — default: şimdi (unix seconds) */
  eventTime?: number;
  /** Meta'nın "action_source" alanı: web (default), email, phone_call, chat, physical_store, system_generated, other */
  actionSource?: 'website' | 'email' | 'phone_call' | 'chat' | 'system_generated' | 'other';
}

// ─── Helpers ──────────────────────────────────────────────────────────
function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Meta'nın istediği normalize + hash şekli */
function hashEmail(email?: string): string | undefined {
  if (!email) return undefined;
  const norm = email.trim().toLowerCase();
  if (!norm) return undefined;
  return sha256(norm);
}
function hashPhone(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  return sha256(digits);
}
function hashName(name?: string): string | undefined {
  if (!name) return undefined;
  const norm = name.trim().toLowerCase();
  if (!norm) return undefined;
  return sha256(norm);
}
function hashLower(v?: string): string | undefined {
  if (!v) return undefined;
  const norm = v.trim().toLowerCase();
  if (!norm) return undefined;
  return sha256(norm);
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────
/**
 * Meta CAPI'ye event gönder — sessizce başarısız olur (event kaybı > uygulama akışını kırma).
 * Response beklenmez (fire-and-forget), ama Promise döner (istenirse await edilebilir).
 */
export async function sendCapiEvent(input: CapiEventInput): Promise<{ ok: boolean; error?: string; response?: any }> {
  if (!ACCESS_TOKEN) {
    return { ok: false, error: 'META_CAPI_ACCESS_TOKEN missing' };
  }

  const eventTime = input.eventTime ?? Math.floor(Date.now() / 1000);

  const user_data: Record<string, unknown> = {};
  const em = hashEmail(input.userData.email);
  const ph = hashPhone(input.userData.phone);
  const fn = hashName(input.userData.firstName);
  const ln = hashName(input.userData.lastName);
  const ct = hashLower(input.userData.city);
  const co = hashLower(input.userData.country);

  if (em) user_data.em = [em];
  if (ph) user_data.ph = [ph];
  if (fn) user_data.fn = [fn];
  if (ln) user_data.ln = [ln];
  if (ct) user_data.ct = [ct];
  if (co) user_data.country = [co];
  if (input.userData.clientIpAddress) user_data.client_ip_address = input.userData.clientIpAddress;
  if (input.userData.clientUserAgent) user_data.client_user_agent = input.userData.clientUserAgent;
  if (input.userData.fbp) user_data.fbp = input.userData.fbp;
  if (input.userData.fbc) user_data.fbc = input.userData.fbc;
  if (input.userData.externalId) user_data.external_id = [sha256(input.userData.externalId)];

  const custom_data: Record<string, unknown> = {};
  const c = input.customData;
  if (c) {
    if (c.value !== undefined) custom_data.value = c.value;
    if (c.currency) custom_data.currency = c.currency;
    if (c.contentIds?.length) custom_data.content_ids = c.contentIds;
    if (c.contentType) custom_data.content_type = c.contentType;
    if (c.contentName) custom_data.content_name = c.contentName;
    if (c.contentCategory) custom_data.content_category = c.contentCategory;
    if (c.numItems !== undefined) custom_data.num_items = c.numItems;
    if (c.orderId) custom_data.order_id = c.orderId;
    if (c.predictedLtv !== undefined) custom_data.predicted_ltv = c.predictedLtv;
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: eventTime,
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: input.actionSource ?? 'website',
        user_data,
        ...(Object.keys(custom_data).length > 0 ? { custom_data } : {}),
      },
    ],
    access_token: ACCESS_TOKEN,
  };

  if (TEST_EVENT_CODE) {
    payload.test_event_code = TEST_EVENT_CODE;
  }

  try {
    const res = await fetch(CAPI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.warn('[capi] Meta CAPI hata:', res.status, data?.error?.message || data);
      return { ok: false, error: data?.error?.message || `HTTP ${res.status}`, response: data };
    }
    // Başarılı — events_received: 1 döner
    return { ok: true, response: data };
  } catch (e: any) {
    console.warn('[capi] CAPI network hata:', e?.message);
    return { ok: false, error: e?.message ?? 'network error' };
  }
}

// ─── Request context'ten user_data çıkart ─────────────────────────────
/**
 * Next.js API route içinde request'ten CAPI user_data hazırla.
 * IP, User-Agent + Facebook cookie'lerini (fbp, fbc) çıkarır.
 */
export function userDataFromRequest(req: Request | { headers: Headers; cookies?: any }): CapiUserData {
  const headers = 'headers' in req ? req.headers : new Headers();
  const clientUserAgent = headers.get('user-agent') || undefined;
  const forwardedFor = headers.get('x-forwarded-for') || '';
  const realIp = headers.get('x-real-ip') || '';
  const clientIpAddress = forwardedFor.split(',')[0]?.trim() || realIp || undefined;

  // Cookie'leri parse et
  const cookieHeader = headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }),
  );

  return {
    clientIpAddress,
    clientUserAgent,
    fbp: cookies._fbp || undefined,
    fbc: cookies._fbc || undefined,
  };
}

// ─── Kısayollar ───────────────────────────────────────────────────────
/** E-com Purchase — en kritik CAPI event'i */
export async function sendCapiPurchase(opts: {
  orderId: string;
  value: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  userData: CapiUserData;
  eventSourceUrl: string;
}) {
  return sendCapiEvent({
    eventName: 'Purchase',
    eventId: `purchase_${opts.orderId}`,
    eventSourceUrl: opts.eventSourceUrl,
    userData: opts.userData,
    customData: {
      value: opts.value,
      currency: opts.currency ?? 'TRY',
      contentIds: opts.contentIds,
      contentType: 'product',
      contentName: opts.contentName,
      orderId: opts.orderId,
    },
  });
}

/** Subscribe (abonelik başlatıldı) */
export async function sendCapiSubscribe(opts: {
  orderId: string;
  planCode: string;
  value: number;
  predictedLtv?: number;
  userData: CapiUserData;
  eventSourceUrl: string;
}) {
  return sendCapiEvent({
    eventName: 'Subscribe',
    eventId: `subscribe_${opts.orderId}`,
    eventSourceUrl: opts.eventSourceUrl,
    userData: opts.userData,
    customData: {
      value: opts.value,
      currency: 'TRY',
      contentIds: [opts.planCode],
      contentType: 'product',
      contentName: opts.planCode,
      predictedLtv: opts.predictedLtv ?? opts.value * 12,
      orderId: opts.orderId,
    },
  });
}

/** Lead (form gönderildi) */
export async function sendCapiLead(opts: {
  leadId: string;
  source?: string;
  userData: CapiUserData;
  eventSourceUrl: string;
}) {
  return sendCapiEvent({
    eventName: 'Lead',
    eventId: `lead_${opts.leadId}`,
    eventSourceUrl: opts.eventSourceUrl,
    userData: opts.userData,
    customData: {
      contentCategory: opts.source ?? 'contact_form',
      currency: 'TRY',
    },
  });
}
