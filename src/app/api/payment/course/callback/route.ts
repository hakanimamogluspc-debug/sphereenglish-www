import { NextRequest, NextResponse } from "next/server";
import { sendGa4Purchase, ga4ClientIdFromCookie } from "@/lib/analytics/ga4-server";

/**
 * Kurs ödemesi Iyzico callback'i.
 *
 * Iyzico ödeme tamamlanınca buraya POST atar (body: { token }).
 * URL query'de orderToken var (bizim tracking'imiz).
 * Backend'e forward eder, sonucu doğrular, kullanıcıyı /kurslar/kayit?order=... sayfasına yönlendirir.
 */
const INTERNAL_API =
  process.env.INTERNAL_API_BASE_URL ??
  "http://sphere-english_sphere-english-app:3000";

async function handle(req: NextRequest) {
  const orderToken = req.nextUrl.searchParams.get("orderToken");
  let iyzicoToken: string | undefined;
  const contentType = req.headers.get("content-type") ?? "";

  if (req.method === "POST") {
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => ({}));
      iyzicoToken = (json as any)?.token;
    } else {
      const form = await req.formData().catch(() => null);
      iyzicoToken = form ? String(form.get("token") ?? "") : undefined;
    }
  } else {
    iyzicoToken = req.nextUrl.searchParams.get("token") ?? undefined;
  }

  if (!orderToken || !iyzicoToken) {
    return NextResponse.redirect(new URL("/odeme/basarisiz?type=course&reason=token_eksik", req.url), { status: 303 });
  }

  try {
    const r = await fetch(`${INTERNAL_API}/api/course-orders/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderToken, iyzicoToken }),
    });
    const data = await r.json().catch(() => ({}));

    if (data.status === "paid") {
      // GA4 purchase event — server-side (kurs ödemesi başarılı)
      const priceKurus = Number(data.amountKurus ?? data.amount_kurus ?? 0);
      const priceTry = priceKurus > 0 ? priceKurus / 100 : Number(data.amount ?? 0);
      const programmeSlug = String(data.programmeSlug ?? data.programme_slug ?? "course");
      const programmeTitle = String(data.programmeTitle ?? data.programme_title ?? "Kurs");
      sendGa4Purchase({
        transactionId: `course_${orderToken}`,
        value: priceTry,
        currency: "TRY",
        clientId: ga4ClientIdFromCookie(req.cookies.get("_ga")?.value),
        items: [
          {
            item_id: `course-${programmeSlug}`,
            item_name: programmeTitle,
            item_category: "Kurs",
            item_variant: programmeSlug,
            price: priceTry,
            quantity: 1,
          },
        ],
      }).then((r) => {
        if (!r.ok) console.warn("[ga4] course purchase hata:", r.error);
      });
      return NextResponse.redirect(new URL(`/kurslar/kayit?order=${orderToken}`, req.url));
    }
    return NextResponse.redirect(new URL(`/kurslar?err=payment-failed`, req.url));
  } catch (e: any) {
    console.error("[course callback]", e?.message);
    return NextResponse.redirect(new URL(`/kurslar?err=server`, req.url));
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
