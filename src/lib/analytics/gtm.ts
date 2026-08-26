/**
 * Google Tag Manager / GA4 dataLayer helper — client-side.
 *
 * Kullanım:
 *   import { trackEvent } from '@/lib/analytics/gtm';
 *   trackEvent('view_item', { currency: 'TRY', value: 199, items: [{ item_id: 'ebook-42', ... }] });
 *
 * GA4 standard e-commerce şeması: https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 *
 * NOT: Bu helper SSR-safe. `window` yoksa no-op. Client component'lerde çağırın.
 * Server-side event'ler için lib/analytics/ga4-server.ts kullanın.
 */

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type EcomItem = {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

type EventParams = Record<string, unknown> & {
  currency?: string;
  value?: number;
  items?: EcomItem[];
};

/**
 * Ana event tracker. Server component'te veya window yoksa no-op.
 */
export function trackEvent(name: string, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;
  if (!window.dataLayer) window.dataLayer = [];
  // GA4 recommendation: ecommerce event'lerinde önce ecommerce objesini reset et
  const isEcom = 'items' in params;
  if (isEcom) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push({
    event: name,
    ...params,
  });
}

/** Kısayollar — çağıranın parametreleri doğru göndermesini kolaylaştırır. */
export const analytics = {
  viewItem: (item: EcomItem, value?: number) =>
    trackEvent('view_item', { currency: 'TRY', value: value ?? item.price ?? 0, items: [item] }),

  viewCourse: (course: { slug: string; name: string; price: number; level?: string }) =>
    trackEvent('view_course', {
      course_slug: course.slug,
      course_name: course.name,
      course_level: course.level,
      currency: 'TRY',
      value: course.price,
    }),

  selectItem: (item: EcomItem, listName?: string) =>
    trackEvent('select_item', { item_list_name: listName, items: [item] }),

  addToCart: (item: EcomItem, value?: number) =>
    trackEvent('add_to_cart', { currency: 'TRY', value: value ?? item.price ?? 0, items: [item] }),

  beginCheckout: (items: EcomItem[], value: number) =>
    trackEvent('begin_checkout', { currency: 'TRY', value, items }),

  courseCtaClick: (params: { course_slug: string; cta_location: string; cta_label: string }) =>
    trackEvent('course_cta_click', params),

  ebookPreviewClick: (params: { ebook_slug: string; ebook_name: string }) =>
    trackEvent('ebook_preview_click', params),

  ebookToCourseClick: (params: { source_ebook_slug: string; target_course_url: string }) =>
    trackEvent('ebook_to_course_click', params),

  courseToEbookClick: (params: { source_course_slug: string; target_ebook_slug: string }) =>
    trackEvent('course_to_ebook_click', params),

  waitlistSignup: (params: { programme_slug: string; buyer_email_hashed?: string }) =>
    trackEvent('waitlist_signup', params),

  contactFormSubmit: (params: { form_location: string; company?: string; employee_count?: string }) =>
    trackEvent('contact_form_submit', params),

  purchase: (params: { transaction_id: string; value: number; currency?: string; items: EcomItem[] }) =>
    trackEvent('purchase', {
      transaction_id: params.transaction_id,
      currency: params.currency ?? 'TRY',
      value: params.value,
      items: params.items,
    }),
};
