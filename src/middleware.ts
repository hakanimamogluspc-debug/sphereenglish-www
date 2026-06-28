import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "sphere_ref";
const COOKIE_MAX_AGE_SEC = 60 * 24 * 60 * 60; // 60 gün
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://app.sphereenglish.com/api-server/api";

/**
 * Affiliate ?ref=KOD yakalama:
 * - URL'de ?ref=KOD varsa cookie set et (60 gün)
 * - Fire-and-forget: API'ye track çağrısı at (best-effort)
 */
export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const ref = url.searchParams.get("ref");

  if (!ref) {
    return NextResponse.next();
  }

  // Kod normalize: UPPER + alphanumeric, max 40
  const code = ref.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 40);
  if (!code || code.length < 3) {
    return NextResponse.next();
  }

  // Aynı cookie zaten varsa skip (rate-limit için)
  const existing = req.cookies.get(COOKIE_NAME)?.value;
  const res = NextResponse.next();

  if (existing !== code) {
    res.cookies.set({
      name: COOKIE_NAME,
      value: code,
      maxAge: COOKIE_MAX_AGE_SEC,
      path: "/",
      sameSite: "lax",
      // domain: "sphereenglish.com",  // prod'da subdomain'ler arası paylaşım için
    });

    // Tracking call (fire-and-forget, response'u bekleme)
    try {
      void fetch(`${API_BASE}/affiliate/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          landingPath: url.pathname,
          referrer: req.headers.get("referer") ?? null,
          utmSource: url.searchParams.get("utm_source"),
          utmMedium: url.searchParams.get("utm_medium"),
          utmCampaign: url.searchParams.get("utm_campaign"),
          visitorId: existing || code,
        }),
      });
    } catch {
      // ignore network errors
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Tüm sayfa istekleri, ama static dosyaları ve API'yi atla
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.svg|.*\\.png|.*\\.jpg).*)",
  ],
};
