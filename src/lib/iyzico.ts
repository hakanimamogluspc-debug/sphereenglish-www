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
 * E-posta yazım hatası yakalayıcı. Kitap e-postayla teslim edildiği için "gmail.con" gibi bir
 * hata, ödeme olsa bile kitabın hiç ulaşmaması demek. Şüpheli adreste düzeltme önerisi döner.
 */
const DOMAIN_FIXES: Record<string, string> = {
  "gmail.con": "gmail.com", "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.om": "gmail.com", "gmail.comm": "gmail.com",
  "gmail.c": "gmail.com", "gmial.com": "gmail.com", "gmal.com": "gmail.com", "gmaill.com": "gmail.com", "gamil.com": "gmail.com",
  "gnail.com": "gmail.com", "gmail.com.tr": "gmail.com",
  "hotmail.con": "hotmail.com", "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmail.co": "hotmail.com",
  "outlook.con": "outlook.com", "outlok.com": "outlook.com", "yahoo.con": "yahoo.com", "yaho.com": "yahoo.com",
  "icloud.con": "icloud.com", "yandex.con": "yandex.com",
};
export function emailTypoSuggestion(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const domain = email.slice(at + 1).toLowerCase();
  const fix = DOMAIN_FIXES[domain] ?? (domain.endsWith(".con") ? domain.slice(0, -4) + ".com" : null);
  return fix ? `${email.slice(0, at)}@${fix}` : null;
}

/**
 * E-kitap/sepet: iyzico ödeme formu AÇILAMADIYSA (initialize hata verdi) pre-create ile yazılmış
 * "bekleyen" satırları hemen "başarısız"a çevirir ve iyzico'nun hata mesajını kaydeder.
 * Eskiden bu satırlar sonsuza dek BEKLEYEN kalıyordu; müşteri her denemede yeni bir bekleyen satır üretiyordu
 * ve admin panelinde gerçek hatanın ne olduğu görünmüyordu.
 */
export async function markEbookCheckoutFailed(conversationId: string, errorMsg: string): Promise<void> {
  const base = (process.env.INTERNAL_API_BASE_URL ?? "http://sphere-english_sphere-english-app:3000").replace(/\/$/, "");
  try {
    const payload = { iyzicoConversationId: conversationId, iyzicoPaymentId: "", paymentError: `Ödeme formu açılamadı: ${errorMsg}`.slice(0, 500) };
    const r = await fetch(`${base}/api/internal/ebook-purchase/mark-failed`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Signature": signInternalPayload(payload) },
      body: JSON.stringify(payload),
    });
    if (!r.ok) console.error("[iyzico] mark-failed HTTP", r.status);
  } catch (e: any) {
    console.error("[iyzico] mark-failed hata:", e?.message);
  }
}

/**
 * Abonelik formu sonrası, Iyzico'ya request atmadan ÖNCE çağrılır.
 * api-server'a fatura bilgilerini draft olarak yazar. Callback'te activate
 * aynı conversationId ile bu draft'tan fatura bilgilerini okur.
 */
export async function notifyApiServerOfPreCreate(payload: {
  conversationId: string;
  planCode: string;
  email: string;
  name: string;
  phone: string;
  invoiceType: "individual" | "corporate";
  taxId: string;
  taxOffice?: string;
  companyName?: string;
  billingAddress: string;
  billingCity: string;
  billingDistrict: string;
  billingPostalCode?: string;
  couponCode?: string | null;
  couponDiscountKurus?: number;
  affiliateCode?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const base = process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000";
  const signature = signInternalPayload(payload);
  try {
    const r = await fetch(`${base.replace(/\/$/, "")}/api/internal/subscription/pre-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Signature": signature,
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (data as any)?.error ?? `HTTP ${r.status}` };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "pre-create bağlantı hatası" };
  }
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
  affiliateCode?: string | null;
  couponCode?: string | null;
  couponDiscountKurus?: number;
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
