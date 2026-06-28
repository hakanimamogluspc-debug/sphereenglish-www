import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import {
  getIyzicoClient,
  iyzicoCall,
  newConversationId,
  paymentBaseUrl,
  signInternalPayload,
} from "@/lib/iyzico";

/**
 * E-kitap Iyzico Checkout Form Initialize.
 *
 * Body:
 *   {
 *     slug, email, name, phone,
 *     invoiceType: 'individual' | 'corporate',
 *     taxId, taxOffice?, companyName?,
 *     billingAddress, billingCity, billingDistrict, billingPostalCode?
 *   }
 *
 * Response:
 *   { token, checkoutFormContent, paymentPageUrl, conversationId }
 *
 * Akış:
 *   1) api-server'dan ebook bilgisini çek
 *   2) Conversation ID üret: ebook_<id>_<ts>_<rand>
 *   3) api-server'a /internal/ebook-purchase/pre-create ile pending kayıt yaz (billing info dahil)
 *   4) Iyzico checkout form initialize et — gerçek billing adresi ile
 *   5) checkoutFormContent ile client'a dön
 */
const API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://sphere-english_sphere-english-app:3000";

interface PublicEbook {
  id: number;
  slug: string;
  title: string;
  author: string;
  price_try: string;
  currency: string;
}

async function getEbook(slug: string): Promise<PublicEbook | null> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, "")}/api/ebooks/${slug}`, {
      cache: "no-store",
    });
    if (!r.ok) return null;
    const d = await r.json();
    return d.ebook ?? null;
  } catch {
    return null;
  }
}

async function preCreatePurchase(payload: any): Promise<{ ok: boolean; purchaseId?: number; error?: string }> {
  try {
    const signature = signInternalPayload(payload);
    const r = await fetch(`${API_BASE.replace(/\/$/, "")}/api/internal/ebook-purchase/pre-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Signature": signature,
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.error || `pre-create ${r.status}` };
    return { ok: true, purchaseId: data?.purchaseId };
  } catch (e: any) {
    return { ok: false, error: e?.message || "pre-create bağlantı hatası" };
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  // ── Alıcı bilgileri ──
  const slug = String(body?.slug ?? "").trim();
  const couponCodeRaw = String(body?.couponCode ?? "").trim().toUpperCase().replace(/[^A-Z0-9-_]/g, "");
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get("sphere_ref")?.value ?? null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const fullName = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  // ── Fatura bilgileri ──
  const invoiceType = (String(body?.invoiceType ?? "individual").trim() === "corporate"
    ? "corporate"
    : "individual") as "individual" | "corporate";
  const taxId = String(body?.taxId ?? "").replace(/\D/g, "").trim();
  const taxOffice = String(body?.taxOffice ?? "").trim();
  const companyName = String(body?.companyName ?? "").trim();
  const billingAddress = String(body?.billingAddress ?? "").trim();
  const billingCity = String(body?.billingCity ?? "").trim();
  const billingDistrict = String(body?.billingDistrict ?? "").trim();
  const billingPostalCode = String(body?.billingPostalCode ?? "").trim();

  // ── Server-side validasyon ──
  if (!slug) return NextResponse.json({ error: "slug gerekli" }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Geçerli e-posta gerekli" }, { status: 400 });
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: "Ad Soyad gerekli" }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10)
    return NextResponse.json({ error: "Geçerli telefon gerekli (10+ hane)" }, { status: 400 });

  if (invoiceType === "individual") {
    if (taxId.length !== 11)
      return NextResponse.json({ error: "TC kimlik no 11 hane olmalı" }, { status: 400 });
  } else {
    if (taxId.length !== 10)
      return NextResponse.json({ error: "VKN 10 hane olmalı" }, { status: 400 });
    if (!taxOffice)
      return NextResponse.json({ error: "Vergi dairesi gerekli" }, { status: 400 });
    if (!companyName)
      return NextResponse.json({ error: "Şirket unvanı gerekli" }, { status: 400 });
  }

  if (!billingAddress || billingAddress.length < 10)
    return NextResponse.json({ error: "Açık adres gerekli (10+ karakter)" }, { status: 400 });
  if (!billingCity) return NextResponse.json({ error: "İl gerekli" }, { status: 400 });
  if (!billingDistrict) return NextResponse.json({ error: "İlçe gerekli" }, { status: 400 });

  // ── Kitabı al ──
  const ebook = await getEbook(slug);
  if (!ebook) return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });

  const price = parseFloat(ebook.price_try);
  if (!(price > 0)) return NextResponse.json({ error: "Kitap fiyatı geçersiz" }, { status: 500 });

  // Kupon / Affiliate validate
  let finalAmount = price;
  let appliedCouponCode: string | null = null;
  let appliedAffiliateCode: string | null = cookieRef;
  let couponDiscountKurus = 0;

  if (couponCodeRaw) {
    try {
      const r = await fetch(`${process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000"}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCodeRaw, scope: "ebook", amountKurus: Math.round(price * 100) }),
      });
      const data: any = await r.json().catch(() => ({}));
      if (data?.ok) {
        if (data.type === "coupon") {
          finalAmount = (data.finalAmountKurus ?? Math.round(price * 100)) / 100;
          couponDiscountKurus = Number(data.discountKurus ?? 0);
          appliedCouponCode = data.code;
        } else if (data.type === "affiliate") {
          appliedAffiliateCode = data.affiliateCode;
        }
      } else if (data?.error) {
        return NextResponse.json({ error: `Kupon: ${data.error}` }, { status: 400 });
      }
    } catch (e: any) {
      console.error("[ebook/initialize] coupon validate err:", e?.message);
      return NextResponse.json({ error: "Kupon doğrulanamadı" }, { status: 502 });
    }
  }

  // ── Conversation ID + buyer parse ──
  const conversationId = newConversationId("ebook_" + ebook.id);
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "Sphere";
  const lastName = nameParts.slice(1).join(" ") || "Kullanıcı";

  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "127.0.0.1";

  // ── api-server'a pre-create yaz (pending purchase) ──
  const preCreate = await preCreatePurchase({
    ebookId: ebook.id,
    buyerEmail: email,
    buyerName: fullName,
    buyerPhone: phone,
    amountPaid: finalAmount,
    currency: "TRY",
    iyzicoConversationId: conversationId,
    invoiceType,
    taxId,
    taxOffice: invoiceType === "corporate" ? taxOffice : null,
    companyName: invoiceType === "corporate" ? companyName : null,
    billingAddress,
    billingCity,
    billingDistrict,
    billingPostalCode: billingPostalCode || null,
    couponCode: appliedCouponCode,
    couponDiscountKurus,
    affiliateCode: appliedAffiliateCode,
    originalPriceKurus: Math.round(price * 100),
  });

  if (!preCreate.ok) {
    console.error("[payment/ebook/initialize] pre-create başarısız:", preCreate.error);
    return NextResponse.json(
      { error: "Sipariş kaydı oluşturulamadı: " + (preCreate.error ?? "bilinmeyen hata") },
      { status: 500 },
    );
  }

  // ── Iyzico için gerçek adres bilgisi ──
  // Hem buyer hem shipping/billing address gerçek olsun — fatura ve risk skoru için önemli
  const cleanCity = billingCity || "İstanbul";
  const fullAddressLine = `${billingAddress}, ${billingDistrict}/${billingCity}`.slice(0, 200);

  const callbackUrl = `${paymentBaseUrl()}/api/payment/ebook/callback`;

  const request = {
    locale: "tr",
    conversationId,
    price: finalAmount.toFixed(2),
    paidPrice: finalAmount.toFixed(2),
    currency: "TRY",
    basketId: `EBOOK-${ebook.id}-${Date.now()}`,
    paymentGroup: "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6],
    buyer: {
      id: email,
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
        id: `ebook_${ebook.id}`,
        name: ebook.title,
        category1: "Dijital Kitap",
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
      console.error("[payment/ebook/initialize] Iyzico başarısız:", result);
      return NextResponse.json(
        {
          error: result?.errorMessage || "Ödeme formu oluşturulamadı",
          errorCode: result?.errorCode,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      conversationId,
    });
  } catch (e: any) {
    console.error("[payment/ebook/initialize] HATA:", e?.message ?? e);
    return NextResponse.json(
      { error: "Ödeme başlatılamadı: " + (e?.message ?? "Bilinmeyen hata") },
      { status: 500 },
    );
  }
}
