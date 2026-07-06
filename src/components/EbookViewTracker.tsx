'use client';

import { useEffect, useRef } from 'react';
import { trackViewEbook } from '@/lib/analytics/meta-pixel';

/**
 * E-kitap detay sayfası görüntülendiğinde Meta Pixel ViewContent event tetikler.
 * Server component içinde kullanılabilir (client wrapper).
 *
 * ViewContent → Meta retargeting audience'ında "kitabı görüntüledi" segmenti oluşur.
 * "AddToCart" veya "Purchase" olmadan çıkan kullanıcılara özel reklam gösterilebilir.
 */
export default function EbookViewTracker(props: {
  ebookId: number | string;
  title: string;
  priceTry: number;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    trackViewEbook({
      ebookId: props.ebookId,
      title: props.title,
      priceTry: props.priceTry,
    });
  }, [props.ebookId, props.title, props.priceTry]);

  return null;
}
