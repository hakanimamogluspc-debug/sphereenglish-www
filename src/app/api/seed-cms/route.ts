/* One-time seed endpoint. Protected by SEED_TOKEN env var.
 * Trigger: curl -X POST http://localhost:3000/api/_seed -H "x-seed-token: $SEED_TOKEN"
 * Idempotent — safe to run multiple times.
 */
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SOLUTIONS, HOMEPAGE, CASE_STUDIES } from '@/payload/seed-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const token = req.headers.get('x-seed-token');
  const expected =
    process.env.SEED_TOKEN || (process.env.NODE_ENV !== 'production' ? 'dev-seed-only' : null);
  if (!expected) {
    return NextResponse.json(
      { error: 'SEED_TOKEN env var must be set in production.' },
      { status: 503 }
    );
  }
  if (token !== expected) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const payload = await getPayload({ config });
  const log: string[] = [];

  // Solutions
  let inserted = 0;
  let skipped = 0;
  for (const sol of SOLUTIONS) {
    const existing = await payload.find({
      collection: 'solutions',
      where: { slug: { equals: sol.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      skipped++;
      continue;
    }
    await payload.create({
      collection: 'solutions',
      data: {
        title: sol.title,
        slug: sol.slug,
        category: sol.category as any,
        description: sol.description,
        body: sol.body.map((paragraph) => ({ paragraph })),
        highlights: sol.highlights.map((item) => ({ item })),
        ctaText: sol.ctaText,
      },
    });
    inserted++;
  }
  log.push(`Solutions — eklenen: ${inserted}, atlanan: ${skipped}`);

  // Case studies (idempotent — slug varsa atla)
  let csInserted = 0;
  let csSkipped = 0;
  for (const cs of CASE_STUDIES) {
    const existing = await payload.find({
      collection: 'case-studies',
      where: { slug: { equals: cs.slug } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      csSkipped++;
      continue;
    }
    const { modules, ...rest } = cs;
    await payload.create({
      collection: 'case-studies',
      data: { ...(rest as any), modules: modules.map((item) => ({ item })) },
    });
    csInserted++;
  }
  log.push(`Case studies — eklenen: ${csInserted}, atlanan: ${csSkipped}`);

  // HomePage global — yalnızca henüz içerik yoksa yaz (mevcut CMS düzenlemelerini ezme)
  const existingHome: any = await payload.findGlobal({ slug: 'home-page' });
  if (!existingHome?.updatedAt) {
    await payload.updateGlobal({ slug: 'home-page', data: HOMEPAGE as any });
    log.push('HomePage — oluşturuldu');
  } else {
    log.push('HomePage — mevcut, atlandı');
  }

  return NextResponse.json({ ok: true, log });
}
