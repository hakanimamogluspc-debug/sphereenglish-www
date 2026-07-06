import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import {
  getIyzicoClient,
  iyzicoCall,
  notifyApiServerOfPayment,
  paymentBaseUrl,
} from "@/lib/iyzico";
import { getPlan } from "@/lib/plans";

/**
 * Iyzico callback handler.
 *
 * Iyzico, ödeme tamamlanınca (başarılı veya başarısız) bu URL'a POST atar:
 *   body: { token: "..." }
 *
 * Biz token ile gerçek ödeme sonucunu Iyzico'dan çekeriz. Başarılı ise
 * api-server'a internal webhook gönderir (kullanıcı oluştur + abonelik aktive et).
 * Sonra kullanıcıyı /odeme/basarili veya /odeme/basarisiz sayfasına yönlendiririz.
 *
 * Iyzico bu URL'a hem GET (kullanıcı dönüşü) hem POST gönderebilir — ikisini de
 * destekliyoruz.
 */
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
    // Iyzico response'da conversationId her zaman dönmüyor, basketId güvenilir
    const conversationId: string = result?.conversationId || result?.basketId || "";
    const buyerEmail: string = result?.itemTransactions?.[0]?.subMerchantPayoutRate
      ? "" // ihtiyaç yok
      : "";
    // Iyzico response'unda buyer email itemTransactions altında değil, paymentItems'da da değil.
    // result.itemTransactions[0].itemId = planCode (basketItem.id olarak gönderdik)
    const planCode: string = result?.itemTransactions?.[0]?.itemId ?? "";
    const plan = getPlan(planCode);

    if (!isSuccess) {
      const reason = encodeURIComponent(
        result?.errorMessage ?? result?.errorCode ?? "bilinmeyen_hata",
      );
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?reason=${reason}`,
        { status: 303 },
      );
    }

    if (!plan) {
      // Bu callback ABONELİK için. E-kitap basketId'si "ebook_<id>" formatında gelir
      // → erken çık, ebook callback handle eder. Hata değil, yanlış callback'e gelmiş.
      if (/^ebook_/i.test(planCode) || /^EBOOK-/i.test(String(result?.basketId ?? ""))) {
        console.info(
          "[payment/callback] E-kitap ödemesi yanlış callback'e geldi, ebook callback'e yönlendir:",
          planCode,
        );
        return NextResponse.redirect(
          `${paymentBaseUrl()}/api/payment/ebook/callback?token=${encodeURIComponent(token)}`,
          { status: 307 }, // 307: method preserve (POST kalır)
        );
      }
      console.error("[payment/callback] Plan bulunamadı:", planCode, result);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?reason=plan_bulunamadi`,
        { status: 303 },
      );
    }

    // Iyzico paymentItems[0] içinde buyer alanı, ama bazı versiyonlarda result.buyer
    // dönmüyor. Initialize'da buyer.email gönderdiğimiz için, retrieve sonucunda
    // genellikle result içinde buyer obj var değil. Email'i basketId/conversationId ile
    // ileteceğiz — initialize'da conversationId'yi storage'a yazmadığımız için MVP'de
    // email'i Iyzico'nun pricing data'sından alacağız.
    //
    // Iyzico'nun çoğu versiyonda retrieve yanıtında "buyer" alanı yok; bu yüzden
    // basketItems üzerinden ya da conversationId'yi karşılayan bir kayıt üzerinden
    // bilgiyi alıyoruz. MVP'de "buyer email"i URL parametresi olarak callback'a
    // dahil edilmediği için, api-server'a sadece paymentId + conversationId + planCode
    // bilgisini gönderiyoruz. api-server tarafında bu conversationId ile eşleşmeyi
    // bizim taraftan tutmadığımız için, email'i Iyzico'dan ayrıca retrieve etmemiz
    // gerekirdi. ALTERNATİF: initialize sırasında conversationId'yi DB'ye yazıp
    // callback'te lookup ederiz.
    //
    // Şimdilik MVP: paymentResponse içinde varsa "buyer" alanını kullan, yoksa
    // başarı sayfasına direkt yönlendir, kullanıcıdan e-postasını doğrulamasını iste.
    const buyerEmailFromIyzico: string | undefined =
      result?.buyer?.email || result?.buyerEmail;

    // Başarılı — api-server'a HER ZAMAN bildir.
    // Iyzico bazen buyer.email döndürmüyor, ama api-server pre-create draft'ından
    // conversationId ile email'i resolve edebilir. Bu sayede ödeme alındığı halde
    // abonelik aktif olmama riski ortadan kalkar.
    {
      const _cookieStore = await cookies();
      const _affRef = _cookieStore.get('sphere_ref')?.value ?? null;
      const activate = await notifyApiServerOfPayment({
        email: buyerEmailFromIyzico ?? "", // boşsa server pre-create'ten alacak
        name: `${result?.buyer?.name ?? ""} ${result?.buyer?.surname ?? ""}`.trim() || "Kullanıcı",
        planCode,
        amount: Number(result.paidPrice ?? plan.amount),
        currency: result.currency ?? "TRY",
        iyzicoPaymentId: String(result.paymentId ?? ""),
        iyzicoConversationId: conversationId,
        paidAt: new Date().toISOString(),
        affiliateCode: _affRef,
      });

      if (!activate.ok) {
        console.warn("[payment/callback] api-server activate başarısız:", activate.error, {
          hasEmailFromIyzico: !!buyerEmailFromIyzico,
          conversationId,
        });
        // Yine de kullanıcıya başarı sayfasını gösterelim ama "manuel inceleme gerek" uyarısıyla
        return NextResponse.redirect(
          `${paymentBaseUrl()}/odeme/basarili?conv=${conversationId}&warn=manuel`,
          { status: 303 },
        );
      }
    }

    // Meta Pixel Purchase event için value/product params
    const priceTry = Number(result.paidPrice ?? plan.amount ?? 0);
    const purchaseUrl =
      `${paymentBaseUrl()}/odeme/basarili?conv=${conversationId}` +
      `&value=${priceTry}` +
      `&productId=${encodeURIComponent('subscription-' + planCode)}` +
      `&productName=${encodeURIComponent(plan.label ?? plan.code ?? 'Pro Abonelik')}`;

    return NextResponse.redirect(purchaseUrl, { status: 303 });
  } catch (e: any) {
    console.error("[payment/callback] HATA:", e?.message ?? e);
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?reason=sistem_hatasi`,
      { status: 303 },
    );
  }
}

export const POST = handle;
export const GET = handle;
