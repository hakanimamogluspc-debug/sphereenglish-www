/**
 * Iyzico SDK wrapper — pazarlama sitesi (Next.js) için.
 *
 * Iyzico API çağrıları bu modülden yapılır. iyzipay callback-based API
 * sunduğu için her metod Promise'e sarılıyor.
 *
 * Gerekli env (Easypanel → sphere-www → Environment):
 *   IYZICO_API_KEY              sandbox-... veya production
 *   IYZICO_SECRET_KEY           sandbox-... veya production
 *   IYZICO_BASE_URL             https://sandbox-api.iyzipay.com | https://api.iyzipay.com
 *   PAYMENT_PUBLIC_BASE_URL     Callback için (örn. https://www.sphereenglish.com)
 *   INTERNAL_API_BASE_URL       api-server adresi (LMS abonelik aktivasyonu için)
 *   INTERNAL_API_SHARED_SECRET  api-server ile paylaşılan HMAC anahtar
 */

// @ts-ignore — iyzipay'in @types paketi yok
import Iyzipay from "iyzipay";
import crypto from "node:crypto";

let _client: any | null = null;

export function getIyzicoClient(): any {
  if (_client) return _client;

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";

  if (!apiKey || !secretKey) {
    throw new Error("Iyzico ortam değişkenleri eksik: IYZICO_API_KEY ve IYZICO_SECRET_KEY tanımlı olmalı.");
  }

  _client = new (Iyzipay as any)({ apiKey, secretKey, uri: baseUrl });
  return _client;
}

export function newConversationId(prefix = "www"): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${ts}_${rand}`;
}

export function iyzicoCall<T = any>(
  fn: (req: any, cb: (err: any, result: T) => void) => void,
  req: any,
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      fn(req, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function paymentBaseUrl(): string {
  const u = process.env.PAYMENT_PUBLIC_BASE_URL ?? "https://www.sphereenglish.com";
  return u.replace(/\/$/, "");
}

/**
 * api-server'a internal abonelik aktivasyon çağrısı için HMAC imzası üretir.
 * api-server tarafında aynı SECRET ile imza doğrulanır — ortadaki saldırgan
 * sahte abonelik aktivasyonu gönderemesin diye.
 */
export function signInternalPayload(body: object): string {
  const secret = process.env.INTERNAL_API_SHARED_SECRET ?? "";
  if (!secret) throw new Error("INTERNAL_API_SHARED_SECRET tanımlı değil.");
  return crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");
}

/**
 * Başarılı bir ödeme sonrası api-server'a kullanıcı/abonelik aktivasyonu bildirir.
 * api-server: user yoksa oluşturur, subscription'ı active yapar, magic-link gönderir.
 */
export async function notifyApiServerOfPayment(payload: {
  email: string;
  name: string;
  planCode: string;
  amount: number;
  currency: string;
  iyzicoPaymentId: string;
  iyzicoConversationId: string;
  paidAt: string;
}): Promise<{ ok: boolean; userId?: number; magicLinkSent?: boolean; error?: string }> {
  const base = process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000";
  const signature = signInternalPayload(payload);

  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/api/internal/payment/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Signature": signature,
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error("[iyzico] api-server activate hata:", r.status, data);
      return { ok: false, error: (data as any)?.error ?? `HTTP ${r.status}` };
    }
    return { ok: true, ...(data as object) };
  } catch (e: any) {
    console.error("[iyzico] api-server activate ağ hatası:", e?.message);
    return { ok: false, error: e?.message ?? "Bilinmeyen hata" };
  }
}
