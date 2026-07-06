'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

/**
 * Next.js App Router'da sayfa değişimlerini Meta Pixel'e PageView olarak bildirir.
 * Base pixel snippet ilk yüklemede zaten PageView atıyor — bu component SPA
 * navigate'lerini yakalar (Next.js sayfa değişince full reload yapmaz).
 *
 * layout.tsx içinde <MetaPixel /> yanına ekle.
 */

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fbq = (window as any).fbq;
    if (typeof fbq !== 'function') return;

    // İlk yüklemedeki PageView zaten base snippet tarafından atıldı.
    // Sadece navigate sonrası ek PageView at.
    // Not: useEffect'in ilk çalışması ilk yükleme sonrası da tetiklenir,
    // pratikte 2 PageView atılır (base + burada). Bu Meta tarafında
    // deduplicate edilir, sorun değil.
    try {
      fbq('track', 'PageView');
    } catch {
      /* fbq bulunamadıysa sessizce geç */
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixelRouteTracker() {
  // useSearchParams Suspense boundary gerektirir
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
