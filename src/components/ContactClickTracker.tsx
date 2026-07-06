'use client';

import { useEffect } from 'react';
import { trackMetaEvent } from '@/lib/analytics/meta-pixel';

/**
 * Global tıklama dinleyicisi — WhatsApp / telefon / e-posta linklerine
 * tıklandığında Meta Pixel Contact event tetikler.
 *
 * mailto:, tel:, wa.me/ ve api.whatsapp.com linklerini algılar.
 * Layout'a bir kere eklenir, tüm site için çalışır.
 */
export default function ContactClickTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.href || '';
      let channel: string | null = null;

      if (href.startsWith('mailto:')) channel = 'email';
      else if (href.startsWith('tel:')) channel = 'phone';
      else if (href.includes('wa.me/') || href.includes('api.whatsapp.com/')) channel = 'whatsapp';

      if (channel) {
        trackMetaEvent('Contact', {
          content_category: channel,
          content_name: href.replace(/^(mailto:|tel:)/, '').split('?')[0],
        });
      }
    };

    document.addEventListener('click', handler, { capture: true });
    return () => document.removeEventListener('click', handler, { capture: true });
  }, []);

  return null;
}
