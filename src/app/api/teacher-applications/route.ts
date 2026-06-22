import { NextRequest, NextResponse } from "next/server";

/**
 * /egitmen-ol formundan FormData (CV PDF dahil) alır, api-server'a
 * forward eder. Tarayıcıdan direkt api-server'a istek atmamak için
 * proxy görevi görür — CORS karmaşası önlenir.
 */

const API_BASE = process.env.INTERNAL_API_BASE_URL ?? "http://api-server:3000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // api-server'a aynı FormData'yı ilet
    const upstream = await fetch(`${API_BASE.replace(/\/$/, "")}/api/teacher-applications`, {
      method: "POST",
      body: formData,
      // x-forwarded-for header'ını ilet — backend submitter IP'sini doğru kaydetsin
      headers: {
        "x-forwarded-for":
          req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "",
        "user-agent": req.headers.get("user-agent") ?? "",
      },
    });

    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  } catch (e: any) {
    console.error("[teacher-applications] proxy hata:", e?.message);
    return NextResponse.json(
      { error: "Başvuru gönderilemedi. Lütfen tekrar deneyin." },
      { status: 500 },
    );
  }
}
