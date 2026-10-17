/* Yardım merkezi verisi — api-server'dan sunucu tarafında çekilir (Payload değil) */

const API_BASE = (
  process.env.INTERNAL_API_BASE_URL ?? 'http://sphere-english_sphere-english-app:3000'
).replace(/\/$/, '');

export interface HelpCategory {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  articleCount: number;
}
export interface HelpArticleSummary {
  id: number;
  slug: string;
  title: string;
  summary: string;
  categorySlug: string | null;
  categoryTitle: string | null;
  categoryIcon: string | null;
}
export interface HelpArticle extends HelpArticleSummary {
  bodyMd: string;
  helpfulYes: number;
  helpfulNo: number;
  updatedAt: string;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch (err) {
    console.warn('[help-center] api erişilemedi:', path, err);
    return null;
  }
}

export async function fetchHelpCategories(): Promise<HelpCategory[]> {
  const d = await getJson<{ categories: HelpCategory[] }>('/api/help/categories');
  return d?.categories ?? [];
}

export async function fetchHelpArticles(
  params: { category?: string; q?: string } = {}
): Promise<HelpArticleSummary[]> {
  const u = new URLSearchParams();
  if (params.category) u.set('category', params.category);
  if (params.q) u.set('q', params.q);
  u.set('source', 'www');
  const d = await getJson<{ articles: HelpArticleSummary[] }>(`/api/help/articles?${u}`);
  return d?.articles ?? [];
}

export async function fetchHelpArticle(
  slug: string
): Promise<{ article: HelpArticle; related: HelpArticleSummary[] } | null> {
  return getJson(`/api/help/articles/${encodeURIComponent(slug)}`);
}
