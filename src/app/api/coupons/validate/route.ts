import { NextRequest, NextResponse } from "next/server";

/**
 * Kupon kodu doğrulama proxy'si.
 *
 * www tarafından BuyEbookButton ve AbonelikClient çağırır:
 *   POST /api/coupons/validate
 *   { code, scope: 'ebook' | 'subscription_monthly' | 'subscription_yearly', amountKurus }
 *
 * Bu route isteği api-server'a forward eder ve cevabı geri döner.
 * CORS karmaşası önlemek için tarayıcı doğrudan app.sphereenglish.com'a istek atmaz.
 *
 * INTERNAL_API_BASE_URL env var:
 *   - Easypanel iç network: http://<servis-adı>:3000  (önerilen)
 *   - Public fallback: https://app.sphereenglish.com
 */

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = `${API_BASE.replace(/\/$/, "")}/api/coupons/validate`;

    const r = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Kupon validate'i public — auth header forward etmiyoruz
    });

    const data = await r.json().catch(() => ({ ok: false, error: "Sunucu yanıtı okunamadı" }));
    return NextResponse.json(data, { status: r.status });
  } catch (err: any) {
    console.error("[coupons/validate proxy] HATA:", err?.message);
    return NextResponse.json(
      { ok: false, error: "Kupon doğrulanırken sunucu hatası" },
      { status: 500 },
    );
  }
}
