import { NextRequest, NextResponse } from "next/server";

/**
 * /egitmen-ol formundan FormData (CV PDF dahil) alır, api-server'a
 * forward eder. Tarayıcıdan direkt api-server'a istek atmamak için
 * proxy görevi görür — CORS karmaşası önlenir.
 *
 * INTERNAL_API_BASE_URL env var:
 *   - Easypanel iç network: http://<servis-adı>:3000
 *   - Public domain: https://api.sphereenglish.com (varsa)
 */

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000";

export async function POST(req: NextRequest) {
  let targetUrl = "";
  try {
    const formData = await req.formData();
    targetUrl = `${API_BASE.replace(/\/$/, "")}/api/teacher-applications`;

    // api-server'a aynı FormData'yı ilet
    const upstream = await fetch(targetUrl, {
      method: "POST",
      body: formData,
      headers: {
        "x-forwarded-for":
          req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    // Detaylı hata mesajı — Easypanel servis adı / network problem teşhisi için
    const detail = e?.message ?? "bilinmeyen hata";
    const cause = e?.cause?.code ?? e?.code ?? "";
    console.error("[teacher-applications] proxy hata:", {
      target: targetUrl,
      detail,
      cause,
      stack: e?.stack?.split("\n")[0],
    });
    return NextResponse.json(
      {
        error: `Sunucuya ulaşılamadı: ${detail}${cause ? ` (${cause})` : ""}`,
        target: targetUrl,
      },
      { status: 502 },
    );
  }
}
