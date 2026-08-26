/**
 * GA4 Measurement Protocol — server-side event gönderimi.
 *
 * Callback route'larında (ebook/cart/course payment success) purchase eventi
 * doğrudan GA4'e gönderir. Client-side pageview'e bağımlı değil.
 *
 * ENV gerekli:
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID    — G-XXXXXXX (public — client & server aynı)
 *   GA4_MEASUREMENT_PROTOCOL_SECRET  — GA4 admin → Data Streams → Measurement Protocol
 *
 * Env eksikse fonksiyon log atar ama exception fırlatmaz — ödeme akışını bozmaz.
 *
 * Docs: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

interface Ga4Item {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

interface Ga4PurchaseParams {
  transactionId: string;
  value: number;
  currency?: string;
  items: Ga4Item[];
  /** Client ID (GA cookie _ga'dan gelir, yoksa random). Aynı kullanıcıyı eşleştirmek için önemli. */
  clientId?: string;
  /** Kullanıcı email hash (opsiyonel — GA4 User-ID / Enhanced Conversions için). */
  userId?: string;
}

const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ELDF1FF5S1';
const API_SECRET = process.env.GA4_MEASUREMENT_PROTOCOL_SECRET;

function randomClientId(): string {
  return `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
}

/**
 * GA4'e server-side purchase event gönder. Fire-and-forget.
 */
export async function sendGa4Purchase(params: Ga4PurchaseParams): Promise<{ ok: boolean; error?: string }> {
  if (!API_SECRET) {
    console.warn('[ga4-server] GA4_MEASUREMENT_PROTOCOL_SECRET tanımlı değil — event atlanıyor');
    return { ok: false, error: 'no_api_secret' };
  }
  if (!MEASUREMENT_ID) {
    return { ok: false, error: 'no_measurement_id' };
  }

  const clientId = params.clientId || randomClientId();
  const payload: Record<string, unknown> = {
    client_id: clientId,
    non_personalized_ads: false,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: params.transactionId,
          currency: params.currency ?? 'TRY',
          value: params.value,
          items: params.items,
        },
      },
    ],
  };
  if (params.userId) {
    payload.user_id = params.userId;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    MEASUREMENT_ID,
  )}&api_secret=${encodeURIComponent(API_SECRET)}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => '');
      console.warn('[ga4-server] purchase send hata:', r.status, txt.slice(0, 200));
      return { ok: false, error: `http_${r.status}` };
    }
    return { ok: true };
  } catch (e: any) {
    console.warn('[ga4-server] purchase send exception:', e?.message);
    return { ok: false, error: e?.message ?? 'unknown' };
  }
}

/**
 * NextRequest'ten _ga cookie okuyup GA4 client_id çıkar.
 * Cookie formatı: GA1.2.1234567890.1234567890 → client_id: 1234567890.1234567890
 */
export function ga4ClientIdFromCookie(cookieValue: string | null | undefined): string | undefined {
  if (!cookieValue) return undefined;
  const parts = cookieValue.split('.');
  if (parts.length < 4) return undefined;
  return `${parts[2]}.${parts[3]}`;
}
