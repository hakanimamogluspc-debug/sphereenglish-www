import { NextRequest, NextResponse } from 'next/server';
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from '@/lib/iyzico';
import { sendGa4Purchase, ga4ClientIdFromCookie } from '@/lib/analytics/ga4-server';

/**
 * Kurs ödemesi Iyzico callback'i.
 *
 * MİMARİ: Ebook/cart pattern'i ile tam simetrik.
 * Iyzico kullanıcıyı bu URL'e POST atar → burada retrieve yaparız →
 * backend HMAC internal endpoint'lerine (activate/mark-failed) forward ederiz →
 * kullanıcıyı /kurslar/kayit sayfasına yönlendiririz.
 *
 * URL: /api/payment/course/callback?orderToken=co_xxx
 * Iyzico body: { token: "iyzico-checkout-token" }
 */

const INTERNAL_API =
  process.env.INTERNAL_API_BASE_URL ??
  'http://sphere-english_sphere-english-app:3000';

async function markCourseFailed(orderToken: string, errorMsg: string) {
  try {
    const payload = { orderToken, paymentError: errorMsg };
    const signature = signInternalPayload(payload);
    const r = await fetch(
      `${INTERNAL_API.replace(/\/$/, '')}/api/internal/course-orders/mark-failed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Signature': signature,
        },
        body: JSON.stringify(payload),
      },
    );
    if (!r.ok) {
      console.error('[payment/course/callback] mark-failed HTTP hata:', r.status);
    }
  } catch (e: any) {
    console.error('[payment/course/callback] mark-failed exception:', e?.message);
  }
}

async function handle(req: NextRequest) {
  const orderToken = req.nextUrl.searchParams.get('orderToken');
  let iyzicoToken: string | undefined;
  const contentType = req.headers.get('content-type') ?? '';

  if (req.method === 'POST') {
    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => ({}));
      iyzicoToken = (json as any)?.token;
    } else {
      const form = await req.formData().catch(() => null);
      iyzicoToken = form ? String(form.get('token') ?? '') : undefined;
    }
  } else {
    iyzicoToken = req.nextUrl.searchParams.get('token') ?? undefined;
  }

  if (!orderToken || !iyzicoToken) {
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?type=course&reason=token_eksik`,
      { status: 303 },
    );
  }

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm),
      { locale: 'tr', token: iyzicoToken },
    );

    console.log('[payment/course/callback] Iyzico response:', JSON.stringify({
      status: result?.status,
      paymentStatus: result?.paymentStatus,
      conversationId: result?.conversationId,
      basketId: result?.basketId,
      errorCode: result?.errorCode,
      errorMessage: result?.errorMessage,
      paymentId: result?.paymentId,
    }, null, 2));

    // Iyzico başarısızsa → mark-failed + kullanıcıyı hata sayfasına
    if (result?.status !== 'success') {
      const errorMsg = result?.errorMessage ?? result?.errorCode ?? 'iyzico_baglanti_hatasi';
      await markCourseFailed(orderToken, errorMsg);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=course&reason=${encodeURIComponent(errorMsg)}`,
        { status: 303 },
      );
    }
    if (result?.paymentStatus !== 'SUCCESS') {
      const mdStatusReasons: Record<string, string> = {
        '0': '3ds_dogrulama_basarisiz',
        '2': '3ds_kart_sahibi_dogrulanamadi',
        '3': '3ds_banka_sistem_hatasi',
        '4': '3ds_kayitli_degil',
        '5': '3ds_banka_sistem_hatasi',
        '6': '3ds_genel_hata',
        '7': '3ds_sistem_hatasi',
        '8': '3ds_bilinmeyen_kart',
      };
      const reasonCode = mdStatusReasons[String(result?.mdStatus ?? '')] ?? 'kart_reddedildi';
      const errorMsg = result?.errorMessage ?? result?.errorCode ?? reasonCode;
      await markCourseFailed(orderToken, errorMsg);
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=course&reason=${encodeURIComponent(errorMsg)}`,
        { status: 303 },
      );
    }

    // Başarılı — backend'e activate çağrısı
    const activatePayload = {
      orderToken,
      iyzicoPaymentId: String(result.paymentId ?? ''),
    };
    const signature = signInternalPayload(activatePayload);

    const activateRes = await fetch(
      `${INTERNAL_API.replace(/\/$/, '')}/api/internal/course-orders/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Signature': signature,
        },
        body: JSON.stringify(activatePayload),
      },
    );

    const activateData: any = await activateRes.json().catch(() => ({}));

    if (!activateRes.ok) {
      console.error('[payment/course/callback] activate hata:', activateRes.status, activateData);
      // Ödeme başarılı, kayıt formu için yine de yönlendir (warn ile)
      return NextResponse.redirect(
        `${paymentBaseUrl()}/kurslar/kayit?order=${orderToken}&warn=manuel`,
        { status: 303 },
      );
    }

    // GA4 purchase event (server-side) — activate response'undan gelen amount
    const amountKurus = Number(activateData?.amountKurus ?? 0);
    const priceTry = amountKurus > 0 ? amountKurus / 100 : Number(result.paidPrice ?? 0);
    const programmeSlug = String(activateData?.programmeSlug ?? 'course');
    const programmeTitle = String(activateData?.programmeTitle ?? 'Kurs');
    sendGa4Purchase({
      transactionId: `course_${orderToken}`,
      value: priceTry,
      currency: 'TRY',
      clientId: ga4ClientIdFromCookie(req.cookies.get('_ga')?.value),
      items: [
        {
          item_id: `course-${programmeSlug}`,
          item_name: programmeTitle,
          item_category: 'Kurs',
          item_variant: programmeSlug,
          price: priceTry,
          quantity: 1,
        },
      ],
    }).then((r) => {
      if (!r.ok) console.warn('[ga4] course purchase hata:', r.error);
    });

    return NextResponse.redirect(
      `${paymentBaseUrl()}/kurslar/kayit?order=${orderToken}`,
      { status: 303 },
    );
  } catch (e: any) {
    console.error('[payment/course/callback] HATA:', e?.message ?? e);
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?type=course&reason=sistem_hatasi`,
      { status: 303 },
    );
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
