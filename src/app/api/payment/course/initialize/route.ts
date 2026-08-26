import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from '@/lib/iyzico';
import { PROGRAMMES } from '@/lib/courses-catalog';

/**
 * Kurs ödemesi Iyzico Checkout Form Initialize.
 *
 * MİMARİ: Kurs ödemesi artık backend'de değil, burada (www) yapılıyor
 * — ebook/cart flow'u ile aynı pattern. Iyzico credentials tek yerde (www env).
 *
 * Akış:
 *   1. Body validate (programmeSlug, buyerName, buyerEmail, buyerPhone)
 *   2. Programme lookup — priceKurus + title
 *   3. orderToken üret
 *   4. Backend internal /course-orders/pre-create → HMAC ile pending yaz
 *   5. Iyzico checkoutFormInitialize.create
 *   6. Client'a checkoutFormContent + orderToken dön
 *
 * Callback: /api/payment/course/callback → Iyzico retrieve www'da,
 * sonra internal /course-orders/activate veya /mark-failed çağrılır.
 */

const INTERNAL_API =
  process.env.INTERNAL_API_BASE_URL ??
  'http://sphere-english_sphere-english-app:3000';

type Body = {
  programmeSlug?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
};

function newOrderToken(): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(6).toString('hex');
  return `co_${ts}_${rand}`;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(' '), lastName: parts[parts.length - 1] };
}

async function preCreatePending(payload: any): Promise<{ ok: boolean; error?: string }> {
  try {
    const signature = signInternalPayload(payload);
    const r = await fetch(
      `${INTERNAL_API.replace(/\/$/, '')}/api/internal/course-orders/pre-create`,
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
    if (!r.ok) return { ok: false, error: (data as any)?.error || `pre-create ${r.status}` };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'pre-create bağlantı hatası' };
  }
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  const programmeSlug = String(body?.programmeSlug ?? '').trim();
  const buyerName = String(body?.buyerName ?? '').trim();
  const buyerEmail = String(body?.buyerEmail ?? '').trim().toLowerCase();
  const buyerPhone = String(body?.buyerPhone ?? '').trim();

  // ── Validasyon ──
  const programme = PROGRAMMES.find((p) => p.paymentSlug === programmeSlug);
  if (!programme) {
    return NextResponse.json({ error: 'Geçersiz program' }, { status: 400 });
  }
  if (buyerName.length < 2) {
    return NextResponse.json({ error: 'Ad Soyad gerekli' }, { status: 400 });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(buyerEmail)) {
    return NextResponse.json({ error: 'Geçerli e-posta gerekli' }, { status: 400 });
  }
  if (buyerPhone.replace(/\D/g, '').length < 10) {
    return NextResponse.json({ error: 'Geçerli telefon gerekli (10+ hane)' }, { status: 400 });
  }

  // ── IDs ──
  const orderToken = newOrderToken();
  const conversationId = `CO-${orderToken}`;
  const amountTry = programme.priceKurus / 100;
  const { firstName, lastName } = splitName(buyerName);

  // ── Iyzico callback ──
  const callbackUrl = `${paymentBaseUrl()}/api/payment/course/callback?orderToken=${orderToken}`;

  const request = {
    locale: 'tr',
    conversationId,
    price: amountTry.toFixed(2),
    paidPrice: amountTry.toFixed(2),
    currency: 'TRY',
    basketId: conversationId,
    paymentGroup: 'PRODUCT',
    callbackUrl,
    // Taksit — Iyzico merchant panel'indeki tüm banka anlaşmalarına izin ver
    enabledInstallments: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    buyer: {
      id: buyerEmail,
      name: firstName,
      surname: lastName,
      gsmNumber: buyerPhone,
      email: buyerEmail,
      identityNumber: '11111111111', // Kurs kayıt formunda alınacak, Iyzico için dummy
      registrationAddress: 'Türkiye',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
      city: 'İstanbul',
      country: 'Turkey',
    },
    shippingAddress: {
      contactName: buyerName,
      city: 'İstanbul',
      country: 'Turkey',
      address: 'Dijital hizmet — fiziksel teslimat yok',
    },
    billingAddress: {
      contactName: buyerName,
      city: 'İstanbul',
      country: 'Turkey',
      address: 'Dijital hizmet',
    },
    basketItems: [
      {
        id: `course_${programme.paymentSlug}`,
        name: programme.titleTr.slice(0, 100),
        category1: 'Eğitim',
        itemType: 'VIRTUAL',
        price: amountTry.toFixed(2),
      },
    ],
  };

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutFormInitialize.create.bind(iyzipay.checkoutFormInitialize),
      request,
    );

    if (result?.status !== 'success') {
      console.error('[payment/course/initialize] Iyzico başarısız:', result);
      return NextResponse.json(
        {
          error: result?.errorMessage || 'Ödeme formu oluşturulamadı',
          errorCode: result?.errorCode,
        },
        { status: 502 },
      );
    }

    // ── Backend'e pre-create yaz (pending order) ──
    const pre = await preCreatePending({
      orderToken,
      programmeSlug: programme.paymentSlug,
      buyerName,
      buyerEmail,
      buyerPhone,
      iyzicoConversationId: conversationId,
      iyzicoToken: result.token,
      amountKurus: programme.priceKurus,
    });

    if (!pre.ok) {
      console.error('[payment/course/initialize] pre-create başarısız:', pre.error);
      return NextResponse.json(
        { error: 'Sipariş kaydı oluşturulamadı: ' + (pre.error ?? 'bilinmeyen hata') },
        { status: 500 },
      );
    }

    return NextResponse.json({
      orderToken,
      token: result.token,
      checkoutFormContent: result.checkoutFormContent,
      paymentPageUrl: result.paymentPageUrl,
      conversationId,
    });
  } catch (e: any) {
    console.error('[payment/course/initialize] HATA:', e?.message ?? e);
    return NextResponse.json(
      { error: 'Ödeme başlatılamadı: ' + (e?.message ?? 'Bilinmeyen hata') },
      { status: 500 },
    );
  }
}
