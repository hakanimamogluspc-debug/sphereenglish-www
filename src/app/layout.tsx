import React from 'react';
  import type { Metadata, Viewport } from 'next';
  import '../styles/tailwind.css';

  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ELDF1FF5S1';
  const BASE_URL = 'https://www.sphereenglish.com';

  export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
  };

  export const metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    title: {
      default: 'Sphere English | Kurumsal İş İngilizcesi Eğitimi',
      template: '%s | Sphere English',
    },
    description:
      "Çalışanlarınız için ölçülebilir, raporlanabilir ve hedef odaklı kurumsal İş İngilizcesi eğitimi. Oxford ortaklığı ile A1'den C2'ye kadar sertifikalı programlar. Türkiye'nin önde gelen kurumsal İngilizce eğitim platformu.",
    keywords: [
      'kurumsal ingilizce eğitimi',
      'iş ingilizcesi',
      'kurumsal dil eğitimi',
      'online ingilizce kursu',
      'çalışanlar için ingilizce',
      'b2b ingilizce eğitimi',
      'ingilizce kurs istanbul',
      'sphere english',
      'oxford ingilizce',
      'kurumsal eğitim programı',
      'ielts hazırlık',
      'iş dünyası ingilizcesi',
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
      title: 'Sphere English | Kurumsal İş İngilizcesi Eğitimi',
      description:
        "Çalışanlarınız için ölçülebilir ve raporlanabilir kurumsal İş İngilizcesi eğitimi. Oxford ortaklığı ile sertifikalı programlar.",
      images: [
        {
          url: '/assets/images/hero_online_english_lesson.png',
          width: 1200,
          height: 630,
          alt: 'Sphere English — Kurumsal İş İngilizcesi Eğitimi',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sphere English | Kurumsal İş İngilizcesi Eğitimi',
      description:
        "Çalışanlarınız için ölçülebilir ve raporlanabilir kurumsal İş İngilizcesi eğitimi.",
      images: ['/assets/images/hero_online_english_lesson.png'],
    },
    alternates: {
      canonical: BASE_URL,
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
    name: 'Sphere English',
    url: BASE_URL,
    logo: `${BASE_URL}/assets/images/logo-1774019980261.png`,
    description:
      "Türkiye'nin önde gelen kurumsal İş İngilizcesi eğitim platformu. Oxford ortaklığı ile ölçülebilir sonuçlar.",
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'İstanbul',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Turkish', 'English'],
    },
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sphere English',
    url: BASE_URL,
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="tr">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          />
          {/* eslint-disable-next-line @next/next/no-sync-scripts */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `,
            }}
          />
        </head>
        <body>
          {children}
        </body>
      </html>
    );
  }
  