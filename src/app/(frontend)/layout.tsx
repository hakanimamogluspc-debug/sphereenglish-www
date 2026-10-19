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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Sphere English',
  alternateName: 'Sphere English Eğitim',
  legalName: 'İmmer Global Eğitim ve Danışmanlık Limited Şirketi',
  taxID: '4740935216',
  url: BASE_URL,
  logo: `${BASE_URL}/assets/images/logo-1774019980261.png`,
  image: `${BASE_URL}/assets/images/hero_online_english_lesson.png`,
  description:
    "Türk şirketleri için kurumsal İş İngilizcesi eğitim platformu. Oxford University Press müfredat kaynakları ile şirket çalışanlarına ölçülebilir, raporlanabilir ve hedef odaklı İngilizce eğitimi sunmaktadır.",
  foundingDate: '2020',
  areaServed: {
    '@type': 'Country',
    name: 'Turkey',
  },
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
    { '@type': 'Person', name: 'Didem İmamoğlu', jobTitle: 'Kurucu' },
    { '@type': 'Person', name: 'Merve Eş', jobTitle: 'Kurucu' },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    telephone: '+90 506 608 58 10',
    email: 'info@sphereenglish.com',
    url: `${BASE_URL}/iletisim`,
    availableLanguage: ['Turkish', 'English'],
  },
  sameAs: [
    'https://app.sphereenglish.com',
    'https://wa.me/905066085810',
  ],
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOccupationalProgram',
  name: 'Kurumsal İş İngilizcesi Eğitim Programı',
  description:
    'Şirket çalışanları için A1-C2 seviye aralığında, sektöre özel hazırlanmış, Zoom üzerinden canlı dersler ve AI destekli pratik ile sunulan kurumsal İngilizce eğitimi. Oxford University Press müfredat ve kaynakları.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Sphere English',
    url: BASE_URL,
  },
  url: BASE_URL,
  educationalLevel: 'A1 to C2',
  occupationalCategory: 'Business English',
  timeToComplete: 'P6M',
  offers: {
    '@type': 'Offer',
    category: 'B2B Corporate Training',
    availabilityStarts: '2024-01-01',
    url: `${BASE_URL}/iletisim`,
  },
  hasCourse: [
    {
      '@type': 'Course',
      name: 'Yöneticiler için İş İngilizcesi',
      description: 'C-seviye ve üst düzey yöneticilere yönelik ileri düzey iş ingilizcesi programı.',
    },
    {
      '@type': 'Course',
      name: 'Satış Ekibi İngilizcesi',
      description: 'Uluslararası satış görüşmeleri, müzakere ve sunum becerilerine odaklanan program.',
    },
    {
      '@type': 'Course',
      name: 'Teknik Ekip İngilizcesi',
      description: 'Yazılım, mühendislik ve teknik profesyoneller için sektöre özel iş ingilizcesi.',
    },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Sphere English nedir?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Sphere English, Türk şirketlerine yönelik kurumsal İş İngilizcesi eğitim platformudur. B2B model ile şirket çalışanlarına ölçülebilir, raporlanabilir ve hedef odaklı İngilizce eğitimi sunmaktadır. Oxford University Press müfredat ve kaynaklarını kullanmaktadır.",
      },
    },
    {
      '@type': 'Question',
      name: 'Sphere English kimlere hitap ediyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sphere English öncelikle çalışanlarının iş İngilizcesini geliştirmek isteyen Türk şirketleri ve kurumlarına hizmet vermektedir. Yöneticiler, satış ekipleri, teknik kadro, İK profesyonelleri ve tüm beyaz yakalı çalışanlar hedef kitledir.',
      },
    },
    {
      '@type': 'Question',
      name: 'Dersler nasıl yapılıyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Dersler Zoom üzerinden canlı, birebir veya küçük gruplarla gerçekleştirilmektedir. Ayrıca platformun AI destekli konuşma koçu sayesinde öğrenciler 7/24 pratik yapabilmektedir. Tüm dersler kayıt altına alınmakta ve ilerleme raporlanmaktadır.',
      },
    },
    {
      '@type': 'Question',
      name: 'Oxford University Press müfredatı nasıl kullanılıyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Sphere English, Oxford University Press'in yayınladığı müfredat ve kaynakları kullanmaktadır. Dersler bu kaynaklar üzerine, Türk profesyonellerin iş ihtiyaçlarına göre uyarlanarak kurulur.",
      },
    },
    {
      '@type': 'Question',
      name: 'Kurumsal ingilizce eğitimi için hangi seviyeler mevcut?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Sphere English'te A1 (başlangıç) seviyesinden C2 (üst ileri) seviyesine kadar tüm dil seviyeleri için özelleştirilmiş program mevcuttur. Her çalışan için bireysel seviye tespiti yapılmakta ve kişiselleştirilmiş öğrenme yolu oluşturulmaktadır.",
      },
    },
    {
      '@type': 'Question',
      name: 'Türkiye\'de en iyi kurumsal ingilizce eğitimi hangisi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Seçim yaparken müfredat kaynağına, canlı ders ve pratik imkânına ve ilerlemenin nasıl raporlandığına bakmanızı öneririz. Sphere English; Oxford University Press müfredat kaynakları, canlı dersler, AI destekli pratik ve şirket yöneticilerine düzenli ilerleme raporlarını birlikte sunar.",
      },
    },
    {
      '@type': 'Question',
      name: 'Çalışanlar için online ingilizce kursu nasıl işliyor?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Çalışanlar Sphere English platformuna (app.sphereenglish.com) kayıt olduktan sonra haftalık canlı Zoom derslerine katılır, AI konuşma koçu ile günlük pratik yapar ve aylık ilerleme raporlarını takip eder. Tüm süreç şirket İK ve yönetimine raporlanır.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kurumsal ingilizce eğitimi için demo nasıl alınır?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Ücretsiz demo randevusu almak için ${BASE_URL}/iletisim sayfasından form doldurabilir veya doğrudan iletişime geçebilirsiniz. Demo görüşmesinde kurumunuzun ihtiyaçları değerlendirilir ve özel program önerisi sunulur.`,
      },
    },
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: 'Sphere English',
  url: BASE_URL,
  description: "Türk şirketleri için kurumsal İş İngilizcesi eğitim platformu.",
  inLanguage: 'tr-TR',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />


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
        </CartProvider>
      </body>
    </html>
  );
}

