import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../../styles/tailwind.css';
import { Suspense } from 'react';
import DeferredChatWidget from '../../components/DeferredChatWidget';
import ThirdPartyScripts from '../../components/ThirdPartyScripts';
import WebMCPProvider from '../../components/WebMCPProvider';
import AnalyticsTracker from '../../components/AnalyticsTracker';
import MetaPixelRouteTracker from '../../components/MetaPixelRouteTracker';
import FbclidCapture from '../../components/FbclidCapture';
import ContactClickTracker from '../../components/ContactClickTracker';
import LinkedInInsight from '../../components/LinkedInInsight';
import CookieConsent from '@/components/CookieConsent';
import SitePopup from '@/components/SitePopup';
import SentryInit from '@/components/SentryInit';
import { CartProvider } from '../../lib/cart/cart-context';
import MiniCartDrawer from '../../components/MiniCartDrawer';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ELDF1FF5S1';
const BASE_URL = 'https://www.sphereenglish.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Sphere English | Profesyoneller İçin İş İngilizcesi',
    template: '%s | Sphere English',
  },
  description:
    "Türk profesyoneller için gerçek iş hayatına odaklanan İş İngilizcesi kursları, dijital kaynaklar ve AI destekli pratik. Toplantıdan e-postaya, mülakattan pazarlığa Oxford University Press müfredat ve kaynaklarıyla kariyerinize güç katın.",
  keywords: [
    'iş ingilizcesi kursu',
    'online iş ingilizcesi kursu',
    'business english kursu',
    'iş ingilizcesi kitabı',
    'iş ingilizcesi pdf',
    'profesyoneller için ingilizce kursu',
    'iş ingilizcesi eğitimi',
    'business english pdf',
    'iş ingilizcesi kelimeleri',
    'toplantı ingilizcesi',
    'ingilizce mail kalıpları',
    'kurumsal ingilizce eğitimi',
    'sphere english',
  ],
  authors: [{ name: 'Sphere English', url: BASE_URL }],
  creator: 'Sphere English',
  publisher: 'Sphere English',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'Sphere English',
    title: 'Sphere English | Profesyoneller İçin İş İngilizcesi',
    description:
      'Türk profesyoneller için İş İngilizcesi kursları, dijital kaynaklar ve AI destekli pratik. Oxford University Press müfredat ve kaynaklarıyla.',
    images: [
      {
        url: '/assets/images/hero_online_english_lesson.png',
        width: 1200,
        height: 630,
        alt: 'Sphere English — Profesyoneller için İş İngilizcesi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sphere English | Profesyoneller İçin İş İngilizcesi',
    description:
      'Türk profesyoneller için İş İngilizcesi kursları, e-kitaplar ve AI destekli pratik.',
    images: ['/assets/images/hero_online_english_lesson.png'],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'tr-TR': BASE_URL,
      'tr': BASE_URL,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
};

// Kurum kimliği — tüm sayfalarda tek ve tutarlı kayıt (yapay zeka asistanları ve arama motorları
// markayı bu kayıtla tanır). Buradaki her bilgi sitede görünür olmalı: /hakkimizda ve footer.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': ['EducationalOrganization', 'OnlineBusiness'],
  '@id': `${BASE_URL}/#organization`,
  name: 'Sphere English',
  alternateName: ['SphereEnglish', 'Sphere English İş İngilizcesi'],
  legalName: 'İmmer Global Eğitim ve Danışmanlık Limited Şirketi',
  taxID: '4740935216',
  identifier: {
    '@type': 'PropertyValue',
    propertyID: 'Vergi Kimlik Numarası (Ayvalık V.D.)',
    value: '4740935216',
  },
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/assets/images/logo-1774019980261.png`,
  },
  image: `${BASE_URL}/assets/images/hero_online_english_lesson.png`,
  description:
    'Sphere English, Türk profesyonellere ve şirketlere yönelik online İş İngilizcesi eğitim platformudur: küçük gruplu canlı kurslar, kurumsal eğitim programları, İş İngilizcesi e-kitapları ve yapay zeka destekli pratik (AI Studio). Eğitimlerde Oxford University Press müfredat ve kaynakları kullanılır.',
  slogan: 'Profesyoneller için İş İngilizcesi',
  foundingDate: '2020',
  areaServed: { '@type': 'Country', name: 'Türkiye' },
  knowsLanguage: ['tr', 'en'],
  knowsAbout: [
    'İş İngilizcesi',
    'Business English',
    'Kurumsal İngilizce eğitimi',
    'Toplantı İngilizcesi',
    'CEFR',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '150 Evler Mah. Atatürk Blv. No:456/35',
    addressLocality: 'Ayvalık',
    addressRegion: 'Balıkesir',
    postalCode: '10400',
    addressCountry: 'TR',
  },
  telephone: '+90 506 608 58 10',
  email: 'info@sphereenglish.com',
  founder: [
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/hakkimizda#didem-imamoglu`,
      name: 'Didem İmamoğlu',
      jobTitle: 'Kurucu Ortak & Eğitim Direktörü',
      url: `${BASE_URL}/hakkimizda`,
    },
    {
      '@type': 'Person',
      '@id': `${BASE_URL}/hakkimizda#merve-es`,
      name: 'Merve Eş',
      jobTitle: 'Kurucu Ortak & İş Geliştirme Direktörü',
      url: `${BASE_URL}/hakkimizda`,
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+90 506 608 58 10',
    email: 'info@sphereenglish.com',
    url: `${BASE_URL}/iletisim`,
    availableLanguage: ['Turkish', 'English'],
  },
  // Markanın resmî profilleri. Yeni profil açıldıkça (Google İşletme Profili, YouTube, Trustpilot…)
  // buraya ve lib/business-config.ts → CONTACT.socials'a eklenmeli.
  sameAs: [
    'https://www.linkedin.com/company/sphere-english/',
    'https://www.instagram.com/sphereenglish',
    'https://app.sphereenglish.com',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'Sphere English',
  url: BASE_URL,
  description: 'Türk profesyoneller ve şirketler için İş İngilizcesi kursları, e-kitaplar ve yapay zeka destekli pratik.',
  inLanguage: 'tr-TR',
  publisher: { '@id': `${BASE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* KVKK/GDPR — Google Consent Mode v2 DEFAULT (GTM'den ÖNCE olmalı) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'granted',
                'personalization_storage': 'denied',
                'security_storage': 'granted',
                'wait_for_update': 500
              });
            `,
          }}
        />
        {/* GTM ve Meta Pixel SDK'ları <ThirdPartyScripts /> ile ertelenmiş yüklenir
            (ilk etkileşim veya 3.5 sn). Burada sadece stub'lar var. */}
        <meta name="geo.region" content="TR-10" />
        <meta name="geo.country" content="Turkey" />
        <meta name="geo.placename" content="Ayvalık, Balıkesir, Türkiye" />
        <meta name="geo.position" content="39.3173;26.6939" />
        <meta name="ICBM" content="39.3173, 26.6939" />
        <meta httpEquiv="content-language" content="tr-TR" />
        {/* AI / LLM discovery */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="AI Content Summary" />
        <link rel="alternate" type="text/markdown" href="/pricing.md" title="Pricing (machine-readable)" />
        <link rel="api-catalog" href="/.well-known/api-catalog" type="application/linkset+json" />
        <link
          rel="https://agentskills.io/rel/skill-index"
          href="/.well-known/agent-skills/index.json"
          type="application/json"
          title="Sphere AI skill catalog"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* SSS ve hizmet şeması yalnızca ana sayfada (page.tsx) — her sayfada tekrarlanmamalı */}


        {/* Meta Pixel STUB — KVKK: revoke ile başlat, consent verildiğinde grant.
            SDK (fbevents.js) ertelenmiş iner; buradaki çağrılar kuyruklanır. */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
                fbq('consent', 'revoke');
                // Daha önce pazarlama çerezlerine izin verilmişse: izni hemen uygula ve SDK'yı
                // React'i beklemeden şimdi indir (eskiden 3,5 sn / ilk etkileşim bekleniyordu).
                // Kontrol lib/cookieConsent.ts getConsent() ile aynı: sürüm 1, 365 gün, marketing=true.
                try {
                  var c = JSON.parse(localStorage.getItem('sphere_cookie_consent_v1') || 'null');
                  if (c && c.version === 1 && c.marketing === true && (Date.now() - c.timestamp) < 365 * 864e5) {
                    fbq('consent', 'grant');
                    window.__spherePixelSdk = true;
                    var s = document.createElement('script');
                    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
                    document.head.appendChild(s);
                  }
                } catch (e) {}
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0" width="0"
              style={{display:'none', visibility:'hidden'}}
            />
          </noscript>
        )}
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel noscript fallback */}
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <noscript>
            <img height="1" width="1" style={{display:'none'}}
              src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}
        <CartProvider>
          {children}
          {/* GTM + Meta Pixel SDK — ilk etkileşim/idle'da yüklenir */}
          <ThirdPartyScripts
            gtmId={process.env.NEXT_PUBLIC_GTM_ID}
            pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
          />
          {/* Chat widget — ayrı chunk, idle'da mount */}
          <DeferredChatWidget />
          <WebMCPProvider />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          {/* Sağdan açılan sepet drawer'ı */}
          <MiniCartDrawer />
          {/* Meta Pixel SPA route değişimlerinde PageView tetikleyici */}
          <MetaPixelRouteTracker />
          {/* Reklamdan gelen fbclid → _fbc cookie (adblock/ITP fallback için) */}
          <Suspense fallback={null}>
            <FbclidCapture />
          </Suspense>
          {/* WhatsApp/telefon/mail linki tıklamalarında Contact event */}
          <ContactClickTracker />
          {/* LinkedIn Insight Tag — yalnızca marketing rızası sonrası yüklenir */}
          <LinkedInInsight />
          {/* KVKK/GDPR Çerez rıza banner'ı */}
          <SentryInit />
          <CookieConsent />
          {/* Admin → Site Pop-up'ları'ndan yönetilen duyuru / bülten pop-up'ı */}
          <SitePopup />
        </CartProvider>
      </body>
    </html>
  );
}

