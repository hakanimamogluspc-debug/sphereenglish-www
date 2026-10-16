/* Server-side helpers to fetch CMS data from within Next.js pages */
import { getPayload } from 'payload';
import config from '../../payload.config';

let cachedPayload: Awaited<ReturnType<typeof getPayload>> | null = null;

async function getClient() {
  if (cachedPayload) return cachedPayload;
  cachedPayload = await getPayload({ config });
  return cachedPayload;
}

export async function fetchSolution(slug: string) {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'solutions',
    where: { slug: { equals: slug } },
    limit: 1,
  });
  return result.docs[0] || null;
}

export async function fetchAllSolutionSlugs(): Promise<string[]> {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'solutions',
    limit: 500,
    pagination: false,
  });
  return result.docs.map((d: any) => d.slug);
}

export async function fetchAllSolutions() {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'solutions',
    limit: 500,
    pagination: false,
  });
  return result.docs;
}

export async function fetchHomePage() {
  const payload = await getClient();
  return await payload.findGlobal({ slug: 'home-page' });
}

export async function fetchPublishedBlogPosts() {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'blog-posts',
    where: { status: { equals: 'Published' } },
    sort: '-date',
    limit: 200,
    pagination: false,
    depth: 1,
  });
  return result.docs;
}

export async function fetchBlogPostBySlug(slug: string) {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'blog-posts',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] || null;
}

// ── Vaka çalışmaları (/referanslar) ─────────────────────────────────────────

export async function fetchPublishedCaseStudies() {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'case-studies',
    where: { status: { equals: 'Published' } },
    sort: 'sortOrder',
    limit: 100,
    pagination: false,
    depth: 1,
  });
  // Öne çıkanlar başa
  return [...result.docs].sort((a: any, b: any) => Number(!!b.featured) - Number(!!a.featured));
}

export async function fetchCaseStudyBySlug(slug: string) {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'case-studies',
    where: { slug: { equals: slug }, status: { equals: 'Published' } },
    limit: 1,
    depth: 1,
  });
  return result.docs[0] || null;
}

export async function fetchPublishedCaseStudySlugs(): Promise<
  { slug: string; updatedAt?: string }[]
> {
  const payload = await getClient();
  const result = await payload.find({
    collection: 'case-studies',
    where: { status: { equals: 'Published' } },
    limit: 100,
    pagination: false,
  });
  return result.docs.map((d: any) => ({
    slug: d.slug,
    updatedAt: d.updatedAt,
  }));
}
