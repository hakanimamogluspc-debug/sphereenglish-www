import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from "@/lib/iyzico";
import { sendCapiPurchase, userDataFromRequest } from "@/lib/analytics/meta-capi";
import { sendGa4Purchase, ga4ClientIdFromCookie } from "@/lib/analytics/ga4-server";

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

    // Iyzico bazen conversationId döndürmüyor ama basketId her zaman geliyor.
    // Aynı string olduğu için ikisini de aynı amaçla kullanabiliriz.
    const conversationId: string = result?.conversationId || result?.basketId || "";

    // Iyzico response'unda conversationId varsa - başarısız durumlarda pending kaydı failed olarak işaretle
    // NOT: Iyzico bazen conversationId'yi boş döndürüyor (özellikle 3DS iptal/red durumlarında)
    // ama basketId her zaman geliyor. initialize'da conversationId === basketId yaptığımız için
    // basketId fallback ile pending satırı yakalayabiliriz.
    async function markFailedIfPossible(errorMsg: string) {
      const convId = result?.conversationId || result?.basketId;
      if (!convId) return;
      try {
        const payload = {
          iyzicoConversationId: convId, // basketId fallback dahil
          iyzicoPaymentId: String(result?.paymentId ?? ""),
          paymentError: errorMsg,
        };
        const signature = signInternalPayload(payload);
        await fetch(`${INTERNAL_API.replace(/\/$/, "")}/api/internal/ebook-purchase/mark-failed`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Signature": signature,
          },
          body: JSON.stringify(payload),
        });
      } catch (e: any) {
        console.error("[payment/ebook/callback] mark-failed çağrısı hata:", e?.message);
      }
    }

    // İlk olarak Iyzico tarafında ödeme başarılı oldu mu? Bu kontrol önce gelmeli —
    // başarısız ödemelerde Iyzico bazen conversationId'yi boş veya kısaltılmış döner
    if (result?.status !== "success") {
      const errorMsg = result?.errorMessage ?? result?.errorCode ?? "iyzico_baglanti_hatasi";
      await markFailedIfPossible(errorMsg);
      const reason = encodeURIComponent(errorMsg);
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
      const errorMsg = result?.errorMessage ?? result?.errorCode ?? reasonCode;
      await markFailedIfPossible(errorMsg);
      console.error("[payment/ebook/callback] paymentStatus başarısız:", result?.paymentStatus, "mdStatus:", result?.mdStatus);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=${encodeURIComponent(errorMsg)}`,
        { status: 303 },
      );
    }

    // ebookId resolve — 3 katmanlı fallback chain:
    //   1) conversationId formatından (eski format: "ebook_<id>_<ts>_<rand>")
    //   2) basketId formatından (Iyzico response'da garantili: "EBOOK-<id>-<ts>")
    //   3) itemTransactions[0].itemId formatından ("ebook_<id>")
    // Iyzico checkoutForm.retrieve response'u conversationId'yi her zaman döndürmez,
    // ama basketId + itemTransactions her başarılı ödemede gelir.
    let ebookId: number | null = null;

    const convMatch = conversationId.match(/^ebook_(\d+)_/i);
    if (convMatch) ebookId = parseInt(convMatch[1], 10);

    if (!ebookId && result?.basketId) {
      const basketMatch = String(result.basketId).match(/^EBOOK-(\d+)-/i);
      if (basketMatch) {
        ebookId = parseInt(basketMatch[1], 10);
        console.info(
          `[payment/ebook/callback] ebookId basketId'den resolve edildi: ${ebookId} (basketId=${result.basketId})`,
        );
      }
    }

    if (!ebookId && Array.isArray(result?.itemTransactions) && result.itemTransactions[0]?.itemId) {
      const itemMatch = String(result.itemTransactions[0].itemId).match(/^ebook_(\d+)$/i);
      if (itemMatch) {
        ebookId = parseInt(itemMatch[1], 10);
        console.info(
          `[payment/ebook/callback] ebookId itemTransactions'tan resolve edildi: ${ebookId}`,
        );
      }
    }

    if (!ebookId) {
      console.error(
        "[payment/ebook/callback] ebookId 3 yöntemle de bulunamadı. conversationId:",
        JSON.stringify(conversationId),
        "basketId:",
        result?.basketId,
        "itemTransactions:",
        result?.itemTransactions,
      );
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=ebook&reason=ebook_id_bulunamadi`,
        { status: 303 },
      );
    }
    const _cookieStore = await cookies();
    const _affRef = _cookieStore.get('sphere_ref')?.value ?? null;

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
      affiliateCode: _affRef,
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

    // Meta Pixel Purchase event için value/product params
    const priceTry = Number(result.paidPrice ?? 0);
    const productId = `ebook-${ebookId}`;
    // Deduplication için deterministik event ID — hem client Pixel hem CAPI aynısını kullanır
    const eventId = `purchase_${conversationId || result?.paymentId || crypto.randomUUID()}`;

    // CAPI Purchase — server-side event (ATT kaybını telafi eder)
    // Fire-and-forget — CAPI hatası ödeme başarısını etkilemez
    sendCapiPurchase({
      orderId: eventId.replace(/^purchase_/, ""),
      value: priceTry,
      currency: result.currency ?? "TRY",
      contentIds: [productId],
      contentName: `E-Kitap #${ebookId}`,
      eventSourceUrl: `${paymentBaseUrl()}/odeme/basarili?type=ebook`,
      userData: {
        ...userDataFromRequest(req),
        email: buyerEmail,
        firstName: result?.buyer?.name,
        lastName: result?.buyer?.surname,
        phone: result?.buyer?.gsmNumber,
        city: result?.buyer?.city,
        country: "TR",
      },
    }).then((r) => {
      if (!r.ok) console.warn("[capi] ebook Purchase send hata:", r.error);
    });

    // GA4 Measurement Protocol Purchase — server-side (client pageview'e bağımlı değil)
    sendGa4Purchase({
      transactionId: eventId.replace(/^purchase_/, ""),
      value: priceTry,
      currency: result.currency ?? "TRY",
      clientId: ga4ClientIdFromCookie(req.cookies.get("_ga")?.value),
      items: [
        {
          item_id: productId,
          item_name: `E-Kitap #${ebookId}`,
          item_category: "E-Kitap",
          price: priceTry,
          quantity: 1,
        },
      ],
    }).then((r) => {
      if (!r.ok) console.warn("[ga4] ebook purchase hata:", r.error);
    });

    const purchaseUrl =
      `${paymentBaseUrl()}/odeme/basarili?type=ebook&token=${downloadToken}` +
      `&value=${priceTry}` +
      `&productId=${encodeURIComponent(productId)}` +
      `&eventId=${encodeURIComponent(eventId)}`;

    return NextResponse.redirect(purchaseUrl, { status: 303 });
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
