'use client';

import { useEffect, useRef } from 'react';
import { trackPurchase, trackMetaEvent } from '@/lib/analytics/meta-pixel';

/**
 * Ödeme başarılı sayfasında Meta Pixel Purchase event tetikleyici.
 * Server component içinde çağrılabilir (client wrapper).
 *
 * Value, orderId gibi ödeme detayları server'dan prop olarak gelir.
 * useRef ile idempotent — sayfa yeniden render olsa bile tek seferlik.
 */
export default function PurchaseTracker(props: {
  type: 'ebook' | 'subscription';
  productId: string;
  productName: string;
  priceTry: number;
  orderId?: string;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    if (props.priceTry <= 0) {
      // Ücretsiz ise Purchase yerine sadece PageView yeter
      return;
    }

    trackPurchase({
      productId: props.productId,
      productName: props.productName,
      priceTry: props.priceTry,
      type: props.type,
      orderId: props.orderId,
    });

    // Subscription satın alma ise Subscribe event de tetikle (LTV tracking)
    if (props.type === 'subscription') {
      trackMetaEvent('Subscribe', {
        value: props.priceTry,
        currency: 'TRY',
        content_name: props.productName,
        content_ids: [props.productId],
        predicted_ltv: props.priceTry * 12, // Yıllık tahmini LTV
      });
    }
  }, [props.productId, props.priceTry, props.type, props.productName, props.orderId]);

  return null;
}
