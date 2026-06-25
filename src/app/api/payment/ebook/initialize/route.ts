import { NextRequest, NextResponse } from "next/server";
import {
  getIyzicoClient,
  iyzicoCall,
  newConversationId,
  paymentBaseUrl,
} from "@/lib/iyzico";

/**
 * E-kitap Iyzico Checkout Form Initialize.
 *
 * Body:
 *   { slug, email, name, phone? }
 *
 * Response:
 *   { token, checkoutFormContent, paymentPageUrl, conversationId }
 *
 * Backend api-server'dan kitap bilgisi (fiyat, başlık) çekilir,
 * Iyzico checkout form üretilir. Conversation id ile callback'te eşleme yapılır.
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

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const slug = String(body?.slug ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const fullName = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim() || "+905000000000";

  if (!slug) return NextResponse.json({ error: "slug gerekli" }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Geçerli e-posta gerekli" }, { status: 400 });
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: "Ad Soyad gerekli" }, { status: 400 });

  const ebook = await getEbook(slug);
  if (!ebook) return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });

  const price = parseFloat(ebook.price_try);
  if (!(price > 0)) return NextResponse.json({ error: "Kitap fiyatı geçersiz" }, { status: 500 });

  // Conversation id: kitap satın alma akışını ayırt etmek için "ebook_" prefix
  const conversationId = newConversationId("ebook_" + ebook.id);
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "Sphere";
  const lastName = nameParts.slice(1).join(" ") || "Kullanıcı";

  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || "127.0.0.1";

  const callbackUrl = `${paymentBaseUrl()}/api/payment/ebook/callback`;

  const request = {
    locale: "tr",
    conversationId,
    price: price.toFixed(2),
    paidPrice: price.toFixed(2),
    currency: "TRY",
    basketId: `EBOOK-${ebook.id}-${Date.now()}`,
    paymentGroup: "PRODUCT",
    callbackUrl,
    enabledInstallments: [1, 2, 3, 6],
    buyer: {
      id: email,
      name: firstName,
      surname: lastName,
      gsmNumber: phone,
      email,
      identityNumber: "11111111111",
      registrationAddress: "Sphere English — Dijital ürün",
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
        id: `ebook_${ebook.id}`,
        name: ebook.title,
        category1: "Dijital Kitap",
        itemType: "VIRTUAL",
        price: price.toFixed(2),
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
