import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import {
  getIyzicoClient,
  iyzicoCall,
  newConversationId,
  paymentBaseUrl,
} from "@/lib/iyzico";

/**
 * Iyzico Checkout Form Initialize.
 *
 * Body:
 *   { planCode, email, name, phone? }
 *
 * Response:
 *   { token, checkoutFormContent, paymentPageUrl, conversationId }
 *
 * Akış:
 *   1) Kullanıcı /abonelik'te plan seçer ve email/isim girer
 *   2) Bu route'a POST atılır
 *   3) Iyzico'dan checkoutFormContent (HTML+script) alınır
 *   4) Frontend bunu modal'da render eder, Iyzico kart formunu açar
 *   5) Kullanıcı ödedikten sonra Iyzico /api/payment/callback'a yönlendirir
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const planCode = String(body?.planCode ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const fullName = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim() || "+905000000000";

  if (!planCode) return NextResponse.json({ error: "planCode gerekli" }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Geçerli bir e-posta gerekli" }, { status: 400 });
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: "Ad Soyad gerekli" }, { status: 400 });

  const plan = getPlan(planCode);
  if (!plan) return NextResponse.json({ error: "Bilinmeyen plan kodu" }, { status: 400 });

  const conversationId = newConversationId("www");
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "Sphere";
  const lastName = nameParts.slice(1).join(" ") || "Kullanıcı";

  // Kullanıcının IP'si — Iyzico fraud/risk için kullanır
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "127.0.0.1";

  const callbackUrl = `${paymentBaseUrl()}/api/payment/callback`;

  const request = {
    locale: "tr",
    conversationId,
    price: plan.amount.toFixed(2),
    paidPrice: plan.amount.toFixed(2),
    currency: "TRY",
    basketId: `B-${Date.now()}`,
    paymentGroup: plan.billingType === "recurring" ? "SUBSCRIPTION" : "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: email,                              // Iyzico'da kullanıcı kimliği — email'i kullanıyoruz
      name: firstName,
      surname: lastName,
      gsmNumber: phone,
      email,
      identityNumber: "11111111111",          // TC opsiyonel ama dummy şart
      registrationAddress: "Sphere English - Dijital eğitim hizmeti",
      ip,
      city: "Balıkesir",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: fullName,
      city: "Balıkesir",
      country: "Turkey",
      address: "Dijital ürün — fiziksel teslimat yok",
    },
    billingAddress: {
      contactName: fullName,
      city: "Balıkesir",
      country: "Turkey",
      address: "Dijital ürün — fatura e-posta ile gönderilir",
    },
    basketItems: [
      {
        id: plan.code,
        name: plan.label,
        category1: "Eğitim",
        itemType: "VIRTUAL",
        price: plan.amount.toFixed(2),
      },
    ],
  };

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutFormInitialize.create.bind(iyzipay.checkoutFormInitialize),
      request,
    );

    if (result?.status !== "success") {
      console.error("[payment/initialize] Iyzico başarısız:", result);
      return NextResponse.json(
        {
          error: result?.errorMessage || "Ödeme formu oluşturulamadı",
          errorCode: result?.errorCode,
        },
        { status: 502 },
      );
    }

    // Iyzico conversationId → email + planCode eşlemesini şimdilik state'siz tutuyoruz.
    // Callback'te Iyzico paymentResult içinde basketItem ve buyer.email zaten dönüyor,
    // o yüzden ek bir DB tutmaya gerek yok (MVP). Sonraki fazda payments tablosu eklenebilir.

    return NextResponse.json({
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      conversationId,
    });
  } catch (e: any) {
    console.error("[payment/initialize] HATA:", e?.message ?? e);
    return NextResponse.json(
      { error: "Ödeme başlatılamadı: " + (e?.message ?? "Bilinmeyen hata") },
      { status: 500 },
    );
  }
}
