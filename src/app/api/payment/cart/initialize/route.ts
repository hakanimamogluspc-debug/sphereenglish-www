import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
  markEbookCheckoutFailed,
  emailTypoSuggestion,
  isIyzicoValidEmail,
  friendlyIyzicoError,
} from '@/lib/iyzico';
import { captureMetaIdentity } from '@/lib/analytics/meta-capi';
import { fetchQuote } from '@/lib/campaign-quote';

/**
 * Sepet (multi-item) Iyzico Checkout Form Initialize.
 *
 * Body:
 *   {
 *     items: [{ type: 'ebook' | 'bundle', slug: string }, ...],
 *     email, name, phone,
 *     invoiceType: 'individual' | 'corporate',
 *     taxId, taxOffice?, companyName?,
 *     billingAddress, billingCity, billingDistrict, billingPostalCode?,
 *     couponCode?
 *   }
 *
 * Akış:
 *   1) api-server'dan her item'ın fiyatını çek (bundle → içerdiği ebook'ları çıkar)
 *   2) Coupon varsa validate et → indirim tut
 *   3) Conversation ID üret: CART-<ts>-<rand>
 *   4) api-server /internal/cart/pre-create → pending purchases yazılır
 *   5) Iyzico checkoutForm initialize (multi-basketItems)
 *   6) checkoutFormContent döndür
 */

const API_BASE =
  process.env.INTERNAL_API_BASE_URL ??
  'http://sphere-english_sphere-english-app:3000';

async function preCreateCart(payload: any): Promise<{ ok: boolean; orderId?: string; finalKurus?: number; error?: string }> {
  try {
    const signature = signInternalPayload(payload);
    const r = await fetch(
      `${API_BASE.replace(/\/$/, '')}/api/internal/cart/pre-create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Signature': signature,
        },
        body: JSON.stringify(payload),
      },
    );
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.error || `pre-create ${r.status}` };
    return { ok: true, orderId: data?.orderId, finalKurus: data?.finalKurus };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'pre-create bağlantı hatası' };
  }
}

/** Iyzico basketItems için ürün detayı */
type ResolvedBasketItem = {
  id: string;
  name: string;
  category1: string;
  itemType: 'VIRTUAL';
  price: string; // 2 desimal string
};

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  // ── Items ──
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
  }
  if (rawItems.length > 20) {
    return NextResponse.json({ error: 'Sepette en fazla 20 ürün olabilir' }, { status: 400 });
  }

  const items: Array<{ type: 'ebook' | 'bundle'; slug: string }> = rawItems
    .map((it: any) => ({
      type: it?.type === 'bundle' ? 'bundle' : 'ebook',
      slug: String(it?.slug ?? '').trim(),
    }))
    .filter((it: any) => !!it.slug);

  if (items.length === 0) {
    return NextResponse.json({ error: 'Geçerli ürün yok' }, { status: 400 });
  }

  // ── Alıcı ──
  const couponCodeRaw = String(body?.couponCode ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-_]/g, '');
  const cookieStore = await cookies();
  const cookieRef = cookieStore.get('sphere_ref')?.value ?? null;
  const email = String(body?.email ?? '').trim().toLowerCase();
  const fullName = String(body?.name ?? '').trim();
  const phone = String(body?.phone ?? '').trim();

  const invoiceType = (String(body?.invoiceType ?? 'individual').trim() === 'corporate'
    ? 'corporate'
    : 'individual') as 'individual' | 'corporate';
  const taxId = String(body?.taxId ?? '').replace(/\D/g, '').trim();
  const taxOffice = String(body?.taxOffice ?? '').trim();
  const companyName = String(body?.companyName ?? '').trim();
  const billingAddress = String(body?.billingAddress ?? '').trim();
  const billingCity = String(body?.billingCity ?? '').trim();
  const billingDistrict = String(body?.billingDistrict ?? '').trim();
  const billingPostalCode = String(body?.billingPostalCode ?? '').trim();

  // ── Validasyon ──
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: 'Geçerli e-posta gerekli' }, { status: 400 });
  if (!isIyzicoValidEmail(email))
    return NextResponse.json({ error: 'E-posta adresiniz geçersiz görünüyor. Türkçe karakter (ı, ş, ğ, ü, ö, ç) ve boşluk kullanmadan, ör. ad@gmail.com biçiminde girin.' }, { status: 400 });
  const emailFix = emailTypoSuggestion(email);
  if (emailFix)
    return NextResponse.json({ error: `E-posta adresinde yazım hatası var gibi görünüyor: "${emailFix}" mi demek istediniz? Kitabınız bu adrese gönderileceği için lütfen düzeltin.` }, { status: 400 });
  if (!fullName || fullName.length < 2)
    return NextResponse.json({ error: 'Ad Soyad gerekli' }, { status: 400 });
  if (phone.replace(/\D/g, '').length < 10)
    return NextResponse.json({ error: 'Geçerli telefon gerekli (10+ hane)' }, { status: 400 });

  if (invoiceType === 'individual') {
    if (taxId.length !== 11)
      return NextResponse.json({ error: 'TC kimlik no 11 hane olmalı' }, { status: 400 });
  } else {
    if (taxId.length !== 10)
      return NextResponse.json({ error: 'VKN 10 hane olmalı' }, { status: 400 });
    if (!taxOffice) return NextResponse.json({ error: 'Vergi dairesi gerekli' }, { status: 400 });
    if (!companyName) return NextResponse.json({ error: 'Şirket unvanı gerekli' }, { status: 400 });
  }

  if (!billingAddress || billingAddress.length < 10)
    return NextResponse.json({ error: 'Açık adres gerekli (10+ karakter)' }, { status: 400 });
  if (!billingCity) return NextResponse.json({ error: 'İl gerekli' }, { status: 400 });
  if (!billingDistrict) return NextResponse.json({ error: 'İlçe gerekli' }, { status: 400 });

  // ── Fiyat: kampanya motorundan teklif (süreli indirim + sepet kampanyası | kupon, hangisi iyiyse) ──
  const quote = await fetchQuote(items, couponCodeRaw || null);
  if ('error' in quote) return NextResponse.json({ error: quote.error }, { status: quote.status });
  // Kupon girildi ama geçersizse müşteriye söyle (kampanya yine de geçerli kalır, ödeme durdurulmaz)
  if (couponCodeRaw && quote.couponError && !quote.cartCampaign) {
    return NextResponse.json({ error: `Kupon: ${quote.couponError}` }, { status: 400 });
  }
  const appliedCouponCode: string | null = quote.coupon?.code ?? null;
  const appliedAffiliateCode: string | null = quote.affiliateCode ?? cookieRef;
  const couponDiscountKurus = quote.coupon?.discountKurus ?? 0;
  const finalAmountTry = quote.finalKurus / 100;

  // iyzico kalemleri: her satırın indirimli tutarı (toplamı = paidPrice)
  const basketItems: ResolvedBasketItem[] = quote.lines.map((l) => ({
    id: `${l.type}_${l.id}`,
    name: l.title.slice(0, 100),
    category1: l.type === 'bundle' ? 'Dijital Kitap Paketi' : 'Dijital Kitap',
    itemType: 'VIRTUAL',
    price: (l.finalKurus / 100).toFixed(2),
  }));

  // ── Conversation ID ──
  const conversationId = `CART-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Sphere';
  const lastName = nameParts.slice(1).join(' ') || 'Kullanıcı';

  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || '127.0.0.1';

  // Meta Pixel/CAPI kimlik verisi — checkout başlarken YAKALA (Iyzico callback erişemez)
  const metaIdentity = captureMetaIdentity(req);

  // ── Pre-create ──
  const preCreate = await preCreateCart({
    items,
    buyerEmail: email,
    buyerName: fullName,
    buyerPhone: phone,
    invoiceType,
    taxId,
    taxOffice: invoiceType === 'corporate' ? taxOffice : null,
    companyName: invoiceType === 'corporate' ? companyName : null,
    billingAddress,
    billingCity,
    billingDistrict,
    billingPostalCode: billingPostalCode || null,
    couponCode: appliedCouponCode,
    couponDiscountKurus,
    expectedFinalKurus: quote.finalKurus,
    affiliateCode: appliedAffiliateCode,
    iyzicoConversationId: conversationId,
    // Meta kimlik — attribution için kritik
    metaFbp: metaIdentity.fbp ?? null,
    metaFbc: metaIdentity.fbc ?? null,
    metaClientIp: metaIdentity.clientIpAddress ?? null,
    metaClientUserAgent: metaIdentity.clientUserAgent ?? null,
  });

  if (!preCreate.ok) {
    console.error('[cart/initialize] pre-create başarısız:', preCreate.error);
    return NextResponse.json(
      { error: 'Sipariş kaydı oluşturulamadı: ' + (preCreate.error ?? 'bilinmeyen hata') },
      { status: 500 },
    );
  }

  // ── Iyzico initialize ──
  const cleanCity = billingCity || 'İstanbul';
  const fullAddressLine = `${billingAddress}, ${billingDistrict}/${billingCity}`.slice(0, 200);
  const callbackUrl = `${paymentBaseUrl()}/api/payment/cart/callback`;

  const request = {
    locale: 'tr',
    conversationId,
    price: finalAmountTry.toFixed(2),
    paidPrice: finalAmountTry.toFixed(2),
    currency: 'TRY',
    basketId: conversationId,
    paymentGroup: 'PRODUCT',
    callbackUrl,
    // Yalnızca tek çekim: taksitte iyzico vade farkını müşteriye ekliyor, tahsil edilen tutar
    // faturadaki tutardan yüksek çıkıyordu (ör. 799 → 828,52). E-kitap fiyatları taksit gerektirmiyor.
    enabledInstallments: [1],
    buyer: {
      id: email,
      name: firstName,
      surname: lastName,
      gsmNumber: phone || '+905000000000',
      email,
      identityNumber: invoiceType === 'individual' ? taxId : '11111111111',
      registrationAddress: fullAddressLine,
      ip,
      city: cleanCity,
      country: 'Turkey',
      zipCode: billingPostalCode || undefined,
    },
    shippingAddress: {
      contactName: invoiceType === 'corporate' ? companyName : fullName,
      city: cleanCity,
      country: 'Turkey',
      address: fullAddressLine,
      zipCode: billingPostalCode || undefined,
    },
    billingAddress: {
      contactName: invoiceType === 'corporate' ? companyName : fullName,
      city: cleanCity,
      country: 'Turkey',
      address: fullAddressLine,
      zipCode: billingPostalCode || undefined,
    },
    basketItems,
  };

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutFormInitialize.create.bind(iyzipay.checkoutFormInitialize),
      request,
    );

    if (result?.status !== 'success') {
      console.error('[cart/initialize] Iyzico başarısız:', JSON.stringify({
        errorCode: result?.errorCode, errorMessage: result?.errorMessage, errorGroup: result?.errorGroup,
        email, conversationId,
      }));
      await markEbookCheckoutFailed(conversationId, `${result?.errorCode ?? ''} ${result?.errorMessage ?? 'bilinmeyen'}`.trim());
      return NextResponse.json(
        {
          error: friendlyIyzicoError(result),
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
      orderId: preCreate.orderId,
      finalKurus: preCreate.finalKurus,
    });
  } catch (e: any) {
    console.error('[cart/initialize] HATA:', e?.message ?? e);
    await markEbookCheckoutFailed(conversationId, e?.message ?? 'bağlantı hatası');
    return NextResponse.json(
      { error: 'Ödeme başlatılamadı: ' + (e?.message ?? 'Bilinmeyen hata') },
      { status: 500 },
    );
  }
}
