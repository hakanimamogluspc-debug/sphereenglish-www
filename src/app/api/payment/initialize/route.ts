import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import { getPlan } from "@/lib/plans";
import {
  getIyzicoClient,
  iyzicoCall,
  newConversationId,
  notifyApiServerOfPreCreate,
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
  const couponCodeRaw = String(body?.couponCode ?? "").trim().toUpperCase().replace(/[^A-Z0-9-_]/g, "");
  // Cookie'den affiliate kodu (alternatif)
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get("sphere_ref")?.value ?? null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const fullName = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  // ── Fatura bilgileri ──
  const invoiceType: "individual" | "corporate" =
    String(body?.invoiceType ?? "individual") === "corporate" ? "corporate" : "individual";
  const taxId = String(body?.taxId ?? "").replace(/\D/g, "").trim();
  const taxOffice = String(body?.taxOffice ?? "").trim();
  const companyName = String(body?.companyName ?? "").trim();
  const billingAddress = String(body?.billingAddress ?? "").trim();
  const billingCity = String(body?.billingCity ?? "").trim();
  const billingDistrict = String(body?.billingDistrict ?? "").trim();
  const billingPostalCode = String(body?.billingPostalCode ?? "").trim();

  if (!planCode) return NextResponse.json({ error: "planCode gerekli" }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Geçerli bir e-posta gerekli" }, { status: 400 });
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: "Ad Soyad gerekli" }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "Geçerli telefon gerekli (10+ hane)" }, { status: 400 });

  // Fatura validasyonu (server-side)
  if (invoiceType === "individual") {
    if (taxId.length !== 11)
      return NextResponse.json({ error: "TC kimlik no 11 hane olmalı" }, { status: 400 });
  } else {
    if (taxId.length !== 10)
      return NextResponse.json({ error: "VKN 10 hane olmalı" }, { status: 400 });
    if (!taxOffice) return NextResponse.json({ error: "Vergi dairesi gerekli" }, { status: 400 });
    if (!companyName)
      return NextResponse.json({ error: "Şirket unvanı gerekli" }, { status: 400 });
  }
  if (!billingAddress || billingAddress.length < 10)
    return NextResponse.json({ error: "Açık adres gerekli (10+ karakter)" }, { status: 400 });
  if (!billingCity) return NextResponse.json({ error: "İl gerekli" }, { status: 400 });
  if (!billingDistrict) return NextResponse.json({ error: "İlçe gerekli" }, { status: 400 });

  const plan = getPlan(planCode);
  if (!plan) return NextResponse.json({ error: "Bilinmeyen plan kodu" }, { status: 400 });

  // ── Kupon / Affiliate validate (varsa) ──
  let finalAmount = plan.amount;
  let appliedCouponCode: string | null = null;
  let appliedAffiliateCode: string | null = cookieRef;
  let couponDiscountKurus = 0;

  if (couponCodeRaw) {
    try {
      const scope = plan.billingType === "recurring" ? "subscription_monthly" : "subscription_yearly";
      const r = await fetch(`${process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000"}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCodeRaw,
          scope,
          amountKurus: Math.round(plan.amount * 100),
        }),
      });
      const data: any = await r.json().catch(() => ({}));
      if (data?.ok) {
        if (data.type === "coupon") {
          finalAmount = (data.finalAmountKurus ?? Math.round(plan.amount * 100)) / 100;
          couponDiscountKurus = Number(data.discountKurus ?? 0);
          appliedCouponCode = data.code;
        } else if (data.type === "affiliate") {
          appliedAffiliateCode = data.affiliateCode;
        }
      } else if (data?.error) {
        return NextResponse.json({ error: `Kupon: ${data.error}` }, { status: 400 });
      }
    } catch (e: any) {
      console.error("[payment/initialize] coupon validate err:", e?.message);
      // Kupon hatasında ödemeye geçme — kullanıcı şaşırır
      return NextResponse.json({ error: "Kupon doğrulanamadı" }, { status: 502 });
    }
  }

  // conversationId ve basketId aynı string — Iyzico response'da conversationId
  // boş gelirse basketId'yi fallback olarak kullanmak için
  const conversationId = `SUB-${plan.code}-${Date.now()}`;
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "Sphere";
  const lastName = nameParts.slice(1).join(" ") || "Kullanıcı";

  // Kullanıcının IP'si — Iyzico fraud/risk için kullanır
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "127.0.0.1";

  // ── api-server'a pre-create yaz (fatura draft) ──
  // Callback'te activate aynı conversationId ile bu draft'tan fatura bilgilerini okuyacak
  const preCreate = await notifyApiServerOfPreCreate({
    conversationId,
    planCode,
    email,
    name: fullName,
    phone: phone || "+905000000000",
    invoiceType,
    taxId,
    taxOffice: invoiceType === "corporate" ? taxOffice : undefined,
    companyName: invoiceType === "corporate" ? companyName : undefined,
    billingAddress,
    billingCity,
    billingDistrict,
    billingPostalCode: billingPostalCode || undefined,
    couponCode: appliedCouponCode,
    couponDiscountKurus,
    affiliateCode: appliedAffiliateCode,
  });
  if (!preCreate.ok) {
    console.error("[payment/initialize] pre-create başarısız:", preCreate.error);
    return NextResponse.json(
      { error: "Sipariş kaydı oluşturulamadı: " + (preCreate.error ?? "bilinmeyen") },
      { status: 500 },
    );
  }

  const callbackUrl = `${paymentBaseUrl()}/api/payment/callback`;
  const fullAddressLine = `${billingAddress}, ${billingDistrict}/${billingCity}`.slice(0, 200);
  const cleanCity = billingCity || "İstanbul";

  const request = {
    locale: "tr",
    conversationId,
    price: finalAmount.toFixed(2),
    paidPrice: finalAmount.toFixed(2),
    currency: "TRY",
    basketId: conversationId, // conversationId ile aynı string — callback fallback için
    paymentGroup: plan.billingType === "recurring" ? "SUBSCRIPTION" : "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: email,                              // Iyzico'da kullanıcı kimliği — email'i kullanıyoruz
      name: firstName,
      surname: lastName,
      gsmNumber: phone || "+905000000000",
      email,
      identityNumber: invoiceType === "individual" ? taxId : "11111111111",
      registrationAddress: fullAddressLine,
      ip,
      city: cleanCity,
      country: "Turkey",
      zipCode: billingPostalCode || undefined,
    },
    shippingAddress: {
      contactName: invoiceType === "corporate" ? companyName : fullName,
      city: cleanCity,
      country: "Turkey",
      address: fullAddressLine,
      zipCode: billingPostalCode || undefined,
    },
    billingAddress: {
      contactName: invoiceType === "corporate" ? companyName : fullName,
      city: cleanCity,
      country: "Turkey",
      address: fullAddressLine,
      zipCode: billingPostalCode || undefined,
    },
    basketItems: [
      {
        id: plan.code,
        name: plan.label,
        category1: "Eğitim",
        itemType: "VIRTUAL",
        price: finalAmount.toFixed(2),
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
