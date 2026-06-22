import { NextResponse } from "next/server";
import { PLAN_CATALOG } from "@/lib/plans";

// Plan kataloğu — public endpoint, /abonelik sayfası ve diğer kanallar kullanır.
export async function GET() {
  return NextResponse.json({ plans: PLAN_CATALOG });
}
