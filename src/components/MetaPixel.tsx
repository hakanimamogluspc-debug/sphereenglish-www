import Script from 'next/script';

/**
 * Meta (Facebook) Pixel — Sphere English
 *
 * Kurulum: <MetaPixel /> layout.tsx içinde <body> altına eklenir.
 * PageView otomatik olarak sayfa yüklenirken tetiklenir.
 * Diğer event'ler için `lib/analytics/meta-pixel.ts` içindeki `trackMetaEvent()` kullan.
 *
 * Pixel ID env'den okunur (`NEXT_PUBLIC_META_PIXEL_ID`), yoksa hardcoded fallback.
 * Sadece production'da yüklenir (development'ta reklam event'i tetiklenmez).
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '2156406151837976';

export default function MetaPixel() {
  // Development'ta pixel yükleme — Meta'ya test event'i gitmesin
  if (process.env.NODE_ENV !== 'production') return null;
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
          `.trim(),
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
