/**
 * Backend courses API — server-side fetch helpers.
 *
 * Kaynak: `sphere-english-app` → `/api/courses` (public, DB-backed).
 * Admin panelde düzenlenen kurslar buradan gelir.
 *
 * FALLBACK: Backend unreachable ise `src/lib/courses-catalog.ts`'teki
 * hardcoded PROGRAMMES döner (build-safe, dev-safe).
 */

import { PROGRAMMES as FALLBACK_PROGRAMMES, type Programme } from '@/lib/courses-catalog';

const API_BASE =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE ??
  'https://app.sphereenglish.com';

// ─── Backend response types ────────────────────────────────────

export type ApiCohortStatus = 'open' | 'waitlist' | 'full' | 'closed';

export interface ApiCourse {
  id: number;
  slug: string;               // 'foundation' / 'diplomacy' (Iyzico payment)
  level_slug: string;         // 'a1-a2' / 'b1-b2' (URL)
  title: string;
  title_en: string | null;
  subtitle: string | null;
  description: string | null;
  level: string | null;
  level_badge: string | null;
  level_cefr: string | null;
  level_audience: string | null;
  duration_weeks: number | null;
  duration_label: string | null;
  price_kurus: number;
  price_display: string | null;
  weeks: Array<{ n: number; title: string; desc: string }>;
  audience: string[];
  related_ebook_slugs: string[];
  cohort_status: ApiCohortStatus;
  cohort_start_date: string | null;
  cohort_start_display: string | null;
  cohort_capacity: number;
  cohort_registrations: number;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  sort_order: number;
}

// ─── Public fetchers ─────────────────────────────────────────

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, {
      // Server component'te force-dynamic sayfalar için no-store
      // (cache istersen sayfa seviyesinde revalidate ayarla)
      cache: 'no-store',
    });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch (e: any) {
    console.warn('[courses/api] fetch hata:', e?.message);
    return null;
  }
}

/**
 * Aktif kurs listesi (sort_order'a göre).
 * Backend down ise fallback (hardcoded PROGRAMMES → ApiCourse'a map edilir).
 */
export async function fetchAllCourses(): Promise<ApiCourse[]> {
  const data = await safeFetch<{ courses: ApiCourse[] }>(
    `${API_BASE.replace(/\/$/, '')}/api/courses`,
  );
  if (data?.courses && data.courses.length > 0) return data.courses;
  return FALLBACK_PROGRAMMES.map(programmeToApiCourse);
}

/**
 * URL slug (a1-a2, b1-b2) ile tek kurs.
 */
export async function fetchCourseByLevelSlug(levelSlug: string): Promise<ApiCourse | null> {
  const data = await safeFetch<{ course: ApiCourse }>(
    `${API_BASE.replace(/\/$/, '')}/api/courses/level/${encodeURIComponent(levelSlug)}`,
  );
  if (data?.course) return data.course;
  // Fallback lookup
  const fp = FALLBACK_PROGRAMMES.find((p) => p.levelSlug === levelSlug);
  return fp ? programmeToApiCourse(fp) : null;
}

/**
 * Payment slug (foundation, diplomacy) ile tek kurs.
 */
export async function fetchCourseBySlug(slug: string): Promise<ApiCourse | null> {
  const data = await safeFetch<{ course: ApiCourse }>(
    `${API_BASE.replace(/\/$/, '')}/api/courses/${encodeURIComponent(slug)}`,
  );
  if (data?.course) return data.course;
  const fp = FALLBACK_PROGRAMMES.find((p) => p.paymentSlug === slug);
  return fp ? programmeToApiCourse(fp) : null;
}

// ─── Fallback: hardcoded Programme → ApiCourse mapping ───────

function programmeToApiCourse(p: Programme): ApiCourse {
  return {
    id: 0,
    slug: p.paymentSlug,
    level_slug: p.levelSlug,
    title: p.titleTr,
    title_en: p.titleEn,
    subtitle: p.tagline,
    description: p.description,
    level: '',
    level_badge: p.levelBadge,
    level_cefr: p.levelCefr,
    level_audience: p.levelAudience,
    duration_weeks: 4,
    duration_label: p.durationLabel,
    price_kurus: p.priceKurus,
    price_display: p.price,
    weeks: p.weeks,
    audience: p.audience,
    related_ebook_slugs: p.relatedEbookSlugs,
    cohort_status: 'waitlist',
    cohort_start_date: null,
    cohort_start_display: "Eylül 2026'nın ilk haftası",
    cohort_capacity: 6,
    cohort_registrations: 0,
    seo_title: null,
    seo_description: null,
    is_active: true,
    sort_order: 0,
  };
}

// ─── UI helpers ─────────────────────────────────────────────

export function cohortStatusLabel(status: ApiCohortStatus): string {
  switch (status) {
    case 'open':     return 'Kayıtlar Açık';
    case 'waitlist': return 'Eylül Ön Kayıt';
    case 'full':     return 'Dolu';
    case 'closed':   return 'Kapalı';
  }
}

export function cohortStatusMessage(course: ApiCourse): string {
  const when = course.cohort_start_display ?? "Eylül 2026'nın ilk haftası";
  switch (course.cohort_status) {
    case 'open':
      return `${when} grubu için kayıtlar açık.`;
    case 'waitlist':
      return `Mevcut gruplarımızın kontenjanı dolmuştur. ${when} başlayan grup için ön kayıt devam etmektedir.`;
    case 'full':
      return `Bu programın kontenjanı doldu. Bir sonraki grup için sıraya girin.`;
    case 'closed':
      return `Bu program şu anda kayıt kabul etmiyor.`;
  }
}
