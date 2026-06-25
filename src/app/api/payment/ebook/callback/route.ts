import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from "@/lib/iyzico";

/**
 * Iyzico'dan e-kitap ödemesi sonrası dönüş.
 *
 * Iyzico, ödeme tamamlanınca bu URL'a POST atar (body: { token }).
 * Token ile gerçek ödeme sonucunu çekeriz. Başarılı ise:
 *   1) api-server'a internal HTTP çağrısı ile ebook_purchases satırı oluştur
 *   2) Download token üret
 *   3) Kullanıcıyı /odeme/basarili sayfasına yönlendir (token URL'de)
 *
 * Subscription callback'i ile aynı yapı, ama farklı tipte aktivasyon endpoint.
 */
const INTERNAL_API = process.env.INTERNAL_API_BASE_URL ?? "http://sphere-english_sphere-english-app:3000";

async function handle(req: NextRequest) {
  let token: string | undefined;
  const contentType = req.headers.get("content-type") ?? "";

  if (req.method === "POST") {
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => ({}));
      token = (json as any)?.token;
    } else {
      const form = await req.formData().catch(() => null);
      token = form ? String(form.get("token") ?? "") : undefined;
    }
  } else {
    token = req.nextUrl.searchParams.get("token") ?? undefined;
  }

  if (!token) {
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?reason=token_eksik`,
      { status: 303 },
    );
  }

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm),
      { locale: "tr", token },
    );

    const isSuccess = result?.status === "success" && result?.paymentStatus === "SUCCESS";
    const conversationId: string = result?.conversationId ?? "";

    // Conversation id formatı: "ebook_<id>_<ts>_<rand>"
    // E-kitap ID'sini ayıkla
    const ebookIdMatch = conversationId.match(/^ebook_(\d+)_/);
    if (!ebookIdMatch) {
      console.error("[payment/ebook/callback] Geçersiz conversationId:", conversationId);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?reason=oturum_hatasi`,
        { status: 303 },
      );
    }
    const ebookId = parseInt(ebookIdMatch[1], 10);

    if (!isSuccess) {
      const reason = encodeURIComponent(
        result?.errorMessage ?? result?.errorCode ?? "odeme_basarisiz",
      );
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?reason=${reason}`,
        { status: 303 },
      );
    }

    // Email, isim için Iyzico response'dan oku
    const buyerEmail: string | undefined = result?.buyer?.email;
    const buyerName = `${result?.buyer?.name ?? ""} ${result?.buyer?.surname ?? ""}`.trim() || "Kullanıcı";

    // Download token üret (32 bytes random base64url)
    const downloadToken = crypto.randomBytes(32).toString("base64url");

    // api-server'a kaydet (HMAC imzalı)
    const payload = {
      ebookId,
      buyerEmail: buyerEmail ?? "",
      buyerName,
      amountPaid: Number(result.paidPrice ?? 0),
      currency: result.currency ?? "TRY",
      iyzicoPaymentId: String(result.paymentId ?? ""),
      iyzicoConversationId: conversationId,
      downloadToken,
      paidAt: new Date().toISOString(),
    };
    const signature = signInternalPayload(payload);

    const activate = await fetch(`${INTERNAL_API.replace(/\/$/, "")}/api/internal/ebook-purchase/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Signature": signature,
      },
      body: JSON.stringify(payload),
    });

    if (!activate.ok) {
      const errBody = await activate.json().catch(() => ({}));
      console.error("[payment/ebook/callback] activate hata:", activate.status, errBody);
      // Yine de başarı sayfasını göster + warning
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarili?type=ebook&token=${downloadToken}&warn=manuel`,
        { status: 303 },
      );
    }

    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarili?type=ebook&token=${downloadToken}`,
      { status: 303 },
    );
  } catch (e: any) {
    console.error("[payment/ebook/callback] HATA:", e?.message ?? e);
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?reason=sistem_hatasi`,
      { status: 303 },
    );
  }
}

export const POST = handle;
export const GET = handle;
