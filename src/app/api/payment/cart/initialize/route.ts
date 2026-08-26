import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from '@/lib/iyzico';

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

async function fetchEbookForBasket(slug: string): Promise<{ id: number; title: string; priceTry: number } | null> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, '')}/api/ebooks/${slug}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d?.ebook) return null;
    return {
      id: Number(d.ebook.id),
      title: String(d.ebook.title),
      priceTry: parseFloat(d.ebook.price_try),
    };
  } catch {
    return null;
  }
}

async function fetchBundleForBasket(slug: string): Promise<{ id: number; title: string; priceTry: number; items: Array<{ id: number; title: string }> } | null> {
  try {
    const r = await fetch(`${API_BASE.replace(/\/$/, '')}/api/bundles/${slug}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    if (!d?.bundle) return null;
    return {
      id: Number(d.bundle.id),
      title: String(d.bundle.title),
      priceTry: parseFloat(d.bundle.price_try),
      items: (d.bundle.items ?? []).map((it: any) => ({
        id: Number(it.id),
        title: String(it.title),
      })),
    };
  } catch {
    return null;
  }
}

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

  // ── Item'ları resolve et (fiyat + Iyzico basketItems) ──
  const basketItems: ResolvedBasketItem[] = [];
  let subtotalTry = 0;

  for (const it of items) {
    if (it.type === 'ebook') {
      const eb = await fetchEbookForBasket(it.slug);
      if (!eb) return NextResponse.json({ error: `Kitap bulunamadı: ${it.slug}` }, { status: 404 });
      basketItems.push({
        id: `ebook_${eb.id}`,
        name: eb.title.slice(0, 100),
        category1: 'Dijital Kitap',
        itemType: 'VIRTUAL',
        price: eb.priceTry.toFixed(2),
      });
      subtotalTry += eb.priceTry;
    } else {
      const bundle = await fetchBundleForBasket(it.slug);
      if (!bundle) return NextResponse.json({ error: `Paket bulunamadı: ${it.slug}` }, { status: 404 });
      if (bundle.items.length === 0)
        return NextResponse.json({ error: `Paket boş: ${it.slug}` }, { status: 400 });

      // Bundle'ı içindeki ebook'lara açalım — Iyzico'da fiyat toplamı = bundle.priceTry olmalı
      const perItem = Math.floor((bundle.priceTry * 100) / bundle.items.length) / 100;
      const remainder = bundle.priceTry - perItem * bundle.items.length;
      bundle.items.forEach((eb, idx) => {
        const price = idx === bundle.items.length - 1 ? perItem + remainder : perItem;
        basketItems.push({
          id: `bundle${bundle.id}_ebook${eb.id}`,
          name: `${bundle.title.slice(0, 40)} — ${eb.title.slice(0, 60)}`,
          category1: 'Dijital Kitap Paketi',
          itemType: 'VIRTUAL',
          price: price.toFixed(2),
        });
      });
      subtotalTry += bundle.priceTry;
    }
  }

  // ── Kupon validate ──
  let finalAmountTry = subtotalTry;
  let appliedCouponCode: string | null = null;
  let appliedAffiliateCode: string | null = cookieRef;
  let couponDiscountKurus = 0;

  if (couponCodeRaw) {
    try {
      const r = await fetch(
        `${API_BASE.replace(/\/$/, '')}/api/coupons/validate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponCodeRaw,
            scope: 'ebook',
            amountKurus: Math.round(subtotalTry * 100),
          }),
        },
      );
      const data: any = await r.json().catch(() => ({}));
      if (data?.ok) {
        if (data.type === 'coupon') {
          finalAmountTry = (data.finalAmountKurus ?? Math.round(subtotalTry * 100)) / 100;
          couponDiscountKurus = Number(data.discountKurus ?? 0);
          appliedCouponCode = data.code;
        } else if (data.type === 'affiliate') {
          appliedAffiliateCode = data.affiliateCode;
        }
      } else if (data?.error) {
        return NextResponse.json({ error: `Kupon: ${data.error}` }, { status: 400 });
      }
    } catch (e: any) {
      console.error('[cart/initialize] coupon validate err:', e?.message);
      return NextResponse.json({ error: 'Kupon doğrulanamadı' }, { status: 502 });
    }
  }

  // İndirim varsa basketItems'ı proratize et — Iyzico toplamının price === paidPrice olması gerek
  if (couponDiscountKurus > 0) {
    const finalKurus = Math.round(finalAmountTry * 100);
    const subtotalKurus = Math.round(subtotalTry * 100);
    if (finalKurus <= 0) {
      return NextResponse.json({ error: '%100 indirim desteklenmiyor' }, { status: 400 });
    }
    // Her basketItem'ın fiyatını finalKurus/subtotalKurus oranıyla küçült
    const ratio = finalKurus / subtotalKurus;
    let accumulated = 0;
    basketItems.forEach((it, idx) => {
      const originalKurus = Math.round(parseFloat(it.price) * 100);
      let newKurus: number;
      if (idx === basketItems.length - 1) {
        // Son item — kalanı ver (rounding artığı burada eğitilir)
        newKurus = finalKurus - accumulated;
      } else {
        newKurus = Math.floor(originalKurus * ratio);
        accumulated += newKurus;
      }
      it.price = (newKurus / 100).toFixed(2);
    });
  }

  // ── Conversation ID ──
  const conversationId = `CART-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Sphere';
  const lastName = nameParts.slice(1).join(' ') || 'Kullanıcı';

  const fwd = req.headers.get('x-forwarded-for') ?? '';
  const ip = fwd.split(',')[0]?.trim() || '127.0.0.1';

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
    affiliateCode: appliedAffiliateCode,
    iyzicoConversationId: conversationId,
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
    // Taksit — Iyzico merchant panel'indeki tüm banka anlaşmalarına izin ver (1-12 arası)
    enabledInstallments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
      console.error('[cart/initialize] Iyzico başarısız:', result);
      return NextResponse.json(
        {
          error: result?.errorMessage || 'Ödeme formu oluşturulamadı',
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
    return NextResponse.json(
      { error: 'Ödeme başlatılamadı: ' + (e?.message ?? 'Bilinmeyen hata') },
      { status: 500 },
    );
  }
}
