/**
 * Marketing site health check
 * URL: GET /api/health
 *
 * Döner:
 *   - status: "ok" | "degraded" | "down"
 *   - checks: { api, build, timestamp }
 *   - deployment info
 *
 * Uptime monitoring (UptimeRobot, BetterStack vb) buraya ping atar.
 * Status 200 → OK; 503 → down.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const START_TIME = new Date();

interface HealthCheck {
  name: string;
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

async function checkApiServer(timeoutMs = 3000): Promise<HealthCheck> {
  const t0 = Date.now();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://app.sphereenglish.com';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    return {
      name: 'api-server',
      ok: res.ok,
      latencyMs: Date.now() - t0,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    };
  } catch (e: any) {
    return {
      name: 'api-server',
      ok: false,
      latencyMs: Date.now() - t0,
      error: e?.name === 'AbortError' ? 'timeout' : (e?.message || 'unknown'),
    };
  }
}

export async function GET() {
  const checks: HealthCheck[] = [];

  // 1. API server bağlanabilir mi
  checks.push(await checkApiServer(3000));

  // 2. Build info
  checks.push({
    name: 'build',
    ok: true,
    latencyMs: 0,
  });

  const allOk = checks.every((c) => c.ok);
  const anyCritical = !checks.find((c) => c.name === 'api-server')?.ok;

  const status = allOk ? 'ok' : anyCritical ? 'down' : 'degraded';
  const httpStatus = allOk ? 200 : anyCritical ? 503 : 200;

  const body = {
    status,
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor((Date.now() - START_TIME.getTime()) / 1000),
    environment: process.env.NODE_ENV || 'unknown',
    deployment: {
      git_sha: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || null,
      next_version: process.env.NEXT_RUNTIME || null,
    },
    checks: checks.reduce((acc, c) => {
      acc[c.name] = { ok: c.ok, ...(c.latencyMs !== undefined && { latency_ms: c.latencyMs }), ...(c.error && { error: c.error }) };
      return acc;
    }, {} as Record<string, any>),
  };

  return NextResponse.json(body, { status: httpStatus });
}
