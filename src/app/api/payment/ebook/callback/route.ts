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
      `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=token_eksik`,
      { status: 303 },
    );
  }

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm),
      { locale: "tr", token },
    );

    // TÜM RESPONSE'U LOGA YAZ — bu sayede sunucu loglarında ne döndüğünü görebileceğiz
    console.log("[payment/ebook/callback] Iyzico response:", JSON.stringify({
      status: result?.status,
      paymentStatus: result?.paymentStatus,
      conversationId: result?.conversationId,
      errorCode: result?.errorCode,
      errorMessage: result?.errorMessage,
      errorGroup: result?.errorGroup,
      mdStatus: result?.mdStatus,
      paymentId: result?.paymentId,
    }, null, 2));

    const conversationId: string = result?.conversationId ?? "";

    // İlk olarak Iyzico tarafında ödeme başarılı oldu mu? Bu kontrol önce gelmeli —
    // başarısız ödemelerde Iyzico bazen conversationId'yi boş veya kısaltılmış döner
    if (result?.status !== "success") {
      const reason = encodeURIComponent(
        result?.errorMessage ?? result?.errorCode ?? "iyzico_baglanti_hatasi",
      );
      console.error("[payment/ebook/callback] Iyzico status başarısız:", result?.status, result?.errorMessage);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=${reason}`,
        { status: 303 },
      );
    }

    if (result?.paymentStatus !== "SUCCESS") {
      // 3DS başarısız / kart reddedildi / iptal
      const mdStatusReasons: Record<string, string> = {
        "0": "3ds_dogrulama_basarisiz",
        "2": "3ds_kart_sahibi_dogrulanamadi",
        "3": "3ds_banka_sistem_hatasi",
        "4": "3ds_kayitli_degil",
        "5": "3ds_banka_sistem_hatasi",
        "6": "3ds_genel_hata",
        "7": "3ds_sistem_hatasi",
        "8": "3ds_bilinmeyen_kart",
      };
      const reasonCode = mdStatusReasons[String(result?.mdStatus ?? "")] ?? "kart_reddedildi";
      const errorMsg = encodeURIComponent(
        result?.errorMessage ?? result?.errorCode ?? reasonCode,
      );
      console.error("[payment/ebook/callback] paymentStatus başarısız:", result?.paymentStatus, "mdStatus:", result?.mdStatus);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=${errorMsg}`,
        { status: 303 },
      );
    }

    // Conversation id formatı: "ebook_<id>_<ts>_<rand>"
    // E-kitap ID'sini ayıkla
    const ebookIdMatch = conversationId.match(/^ebook_(\d+)_/);
    if (!ebookIdMatch) {
      console.error("[payment/ebook/callback] Beklenmeyen conversationId:", conversationId, "tam response:", result);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=conversation_id_uyumsuz`,
        { status: 303 },
      );
    }
    const ebookId = parseInt(ebookIdMatch[1], 10);

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
      `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=sistem_hatasi`,
      { status: 303 },
    );
  }
}

export const POST = handle;
export const GET = handle;
