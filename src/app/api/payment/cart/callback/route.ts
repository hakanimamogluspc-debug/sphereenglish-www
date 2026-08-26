import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import {
  getIyzicoClient,
  iyzicoCall,
  paymentBaseUrl,
  signInternalPayload,
} from '@/lib/iyzico';
import { sendCapiPurchase, userDataFromRequest } from '@/lib/analytics/meta-capi';
import { sendGa4Purchase, ga4ClientIdFromCookie } from '@/lib/analytics/ga4-server';

/**
 * Iyzico sepet callback'i başarısızsa, cart pre-create ile yazılmış pending
 * satırlarını failed'a çevirir. Aynı iyzico_conversation_id'ye sahip TÜM
 * ebook_purchases satırlarını hedefler (bir orderId altındaki tüm item'lar).
 *
 * NOT: ebook-purchase/mark-failed endpoint'i tek conversationId ile birden
 * fazla pending satırı update edebilir (LIMIT yok) — cart için tam uygun.
 */
async function markCartFailed(params: {
  internalApiBase: string;
  conversationId: string;
  paymentId?: string;
  errorMsg: string;
}) {
  if (!params.conversationId) {
    console.warn('[payment/cart/callback] mark-failed atlandi — conversationId bos');
    return;
  }
  try {
    const payload = {
      iyzicoConversationId: params.conversationId,
      iyzicoPaymentId: params.paymentId ?? '',
      paymentError: params.errorMsg,
    };
    const signature = signInternalPayload(payload);
    const r = await fetch(
      `${params.internalApiBase.replace(/\/$/, '')}/api/internal/ebook-purchase/mark-failed`,
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
      console.error('[payment/cart/callback] mark-failed HTTP hata:', r.status);
    }
  } catch (e: any) {
    console.error('[payment/cart/callback] mark-failed exception:', e?.message);
  }
}

/**
 * Iyzico'dan sepet (multi-item) ödemesi sonrası dönüş.
 *
 * Iyzico ödeme tamamlanınca bu URL'e POST atar (body: { token }).
 * Token ile ödeme sonucu retrieve edilir, başarılıysa api-server'daki
 * /internal/cart/activate çağrılır — tüm order_id'ye ait pending satırlar
 * success'e çevrilir + download tokens üretilir.
 *
 * Redirect: /odeme/basarili?type=cart&orderId=<orderId>
 */

const INTERNAL_API =
  process.env.INTERNAL_API_BASE_URL ??
  'http://sphere-english_sphere-english-app:3000';

async function handle(req: NextRequest) {
  let token: string | undefined;
  const contentType = req.headers.get('content-type') ?? '';

  if (req.method === 'POST') {
    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => ({}));
      token = (json as any)?.token;
    } else {
      const form = await req.formData().catch(() => null);
      token = form ? String(form.get('token') ?? '') : undefined;
    }
  } else {
    token = req.nextUrl.searchParams.get('token') ?? undefined;
  }

  if (!token) {
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?type=cart&reason=token_eksik`,
      { status: 303 },
    );
  }

  try {
    const iyzipay = getIyzicoClient();
    const result: any = await iyzicoCall(
      iyzipay.checkoutForm.retrieve.bind(iyzipay.checkoutForm),
      { locale: 'tr', token },
    );

    console.log(
      '[payment/cart/callback] Iyzico response:',
      JSON.stringify(
        {
          status: result?.status,
          paymentStatus: result?.paymentStatus,
          conversationId: result?.conversationId,
          basketId: result?.basketId,
          errorCode: result?.errorCode,
          errorMessage: result?.errorMessage,
          mdStatus: result?.mdStatus,
          paymentId: result?.paymentId,
        },
        null,
        2,
      ),
    );

    // conversationId veya basketId → aynı string (initialize'da bilerek eşit tuttuk)
    const orderId: string = result?.conversationId || result?.basketId || '';

    if (result?.status !== 'success') {
      const errorMsg = result?.errorMessage ?? result?.errorCode ?? 'iyzico_baglanti_hatasi';
      console.error('[payment/cart/callback] Iyzico status başarısız:', result?.status, errorMsg);
      await markCartFailed({
        internalApiBase: INTERNAL_API,
        conversationId: orderId,
        paymentId: String(result?.paymentId ?? ''),
        errorMsg,
      });
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=cart&reason=${encodeURIComponent(errorMsg)}`,
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
      console.error(
        '[payment/cart/callback] paymentStatus başarısız:',
        result?.paymentStatus,
        'mdStatus:',
        result?.mdStatus,
      );
      await markCartFailed({
        internalApiBase: INTERNAL_API,
        conversationId: orderId,
        paymentId: String(result?.paymentId ?? ''),
        errorMsg,
      });
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=cart&reason=${encodeURIComponent(errorMsg)}`,
        { status: 303 },
      );
    }

    if (!orderId) {
      console.error('[payment/cart/callback] orderId çözülemedi');
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarisiz?type=cart&reason=order_id_bulunamadi`,
        { status: 303 },
      );
    }

    const _cookieStore = await cookies();
    const _affRef = _cookieStore.get('sphere_ref')?.value ?? null;

    // api-server'a activate
    const payload = {
      orderId,
      iyzicoConversationId: orderId,
      iyzicoPaymentId: String(result?.paymentId ?? ''),
      paidAt: new Date().toISOString(),
      affiliateCode: _affRef,
    };
    const signature = signInternalPayload(payload);

    const activate = await fetch(
      `${INTERNAL_API.replace(/\/$/, '')}/api/internal/cart/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Signature': signature,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!activate.ok) {
      const errBody = await activate.json().catch(() => ({}));
      console.error('[payment/cart/callback] activate hata:', activate.status, errBody);
      // Yine de success sayfasını göster + warn
      return NextResponse.redirect(
        `${paymentBaseUrl()}/odeme/basarili?type=cart&orderId=${encodeURIComponent(orderId)}&warn=manuel`,
        { status: 303 },
      );
    }

    // Meta Pixel Purchase event için toplam tutar
    const priceTry = Number(result.paidPrice ?? 0);
    const eventId = `purchase_cart_${orderId}`;

    // Cart item ID'lerini basketItems'ten türet
    const contentIds: string[] = Array.isArray(result?.itemTransactions)
      ? result.itemTransactions.map((it: any) => String(it?.itemId ?? '')).filter(Boolean)
      : [];

    // CAPI Purchase — server-side (fire-and-forget)
    sendCapiPurchase({
      orderId: `cart_${orderId}`,
      value: priceTry,
      currency: result.currency ?? 'TRY',
      contentIds,
      contentName: `Sepet (${contentIds.length} kitap)`,
      eventSourceUrl: `${paymentBaseUrl()}/odeme/basarili?type=cart`,
      userData: {
        ...userDataFromRequest(req),
        email: result?.buyer?.email,
        firstName: result?.buyer?.name,
        lastName: result?.buyer?.surname,
        phone: result?.buyer?.gsmNumber,
        city: result?.buyer?.city,
        country: 'TR',
      },
    }).then((r) => {
      if (!r.ok) console.warn('[capi] cart Purchase send hata:', r.error);
    });

    // GA4 server-side purchase
    sendGa4Purchase({
      transactionId: `cart_${orderId}`,
      value: priceTry,
      currency: result.currency ?? 'TRY',
      clientId: ga4ClientIdFromCookie(req.cookies.get('_ga')?.value),
      items: contentIds.map((id) => ({
        item_id: id,
        item_name: id,
        item_category: id.startsWith('bundle') ? 'Paket' : 'E-Kitap',
        quantity: 1,
      })),
    }).then((r) => {
      if (!r.ok) console.warn('[ga4] cart purchase hata:', r.error);
    });

    const purchaseUrl =
      `${paymentBaseUrl()}/odeme/basarili?type=cart&orderId=${encodeURIComponent(orderId)}` +
      `&value=${priceTry}` +
      `&eventId=${encodeURIComponent(eventId)}`;

    return NextResponse.redirect(purchaseUrl, { status: 303 });
  } catch (e: any) {
    console.error('[payment/cart/callback] HATA:', e?.message ?? e);
    return NextResponse.redirect(
      `${paymentBaseUrl()}/odeme/basarisiz?type=cart&reason=sistem_hatasi`,
      { status: 303 },
    );
  }
}

export const POST = handle;
export const GET = handle;
