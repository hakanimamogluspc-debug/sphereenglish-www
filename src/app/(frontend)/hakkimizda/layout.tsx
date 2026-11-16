import type { Metadata } from 'next';
  import type { ReactNode } from 'react';

  export const metadata: Metadata = {
    title: 'Hakkımızda | Kurucular, Şirket Bilgileri ve Yaklaşımımız',
    description:
      "Sphere English olarak 2020'den bu yana Türkiye'deki şirketlere kurumsal iş İngilizcesi eğitimi veriyoruz. Oxford University Press müfredat ve kaynakları, deneyimli eğitmenler ve ölçülebilir sonuçlarla fark yaratıyoruz.",
    alternates: { canonical: 'https://www.sphereenglish.com/hakkimizda' },
    openGraph: {
      title: 'Hakkımızda — Kurumsal İngilizce Uzmanları',
      description: "2020'den bu yana kurumsal iş İngilizcesi eğitimi. Deneyimli eğitmenler, Oxford University Press müfredatı, 50+ şirket deneyimi.",
      url: 'https://www.sphereenglish.com/hakkimizda',
    },
  };

  export default function HakkimizdaLayout({ children }: { children: ReactNode }) {
    const BASE = 'https://www.sphereenglish.com';
    const ORG = { '@id': `${BASE}/#organization` };
    const alumni = { '@type': 'CollegeOrUniversity', name: 'Ankara Üniversitesi' };
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          '@id': `${BASE}/hakkimizda#webpage`,
          url: `${BASE}/hakkimizda`,
          name: 'Sphere English Hakkında',
          inLanguage: 'tr-TR',
          about: ORG,
          mainEntity: ORG,
        },
        {
          '@type': 'Person',
          '@id': `${BASE}/hakkimizda#didem-imamoglu`,
          name: 'Didem İmamoğlu',
          jobTitle: 'Kurucu Ortak & Eğitim Direktörü',
          worksFor: ORG,
          alumniOf: alumni,
          knowsAbout: ['İngilizce öğretimi', 'İş İngilizcesi', 'Müfredat tasarımı'],
          image: `${BASE}/assets/images/WhatsApp_Image_2026-03-19_at_13.55.36-1773919883509.jpeg`,
          url: `${BASE}/hakkimizda`,
        },
        {
          '@type': 'Person',
          '@id': `${BASE}/hakkimizda#merve-es`,
          name: 'Merve Eş',
          jobTitle: 'Kurucu Ortak & İş Geliştirme Direktörü',
          worksFor: ORG,
          alumniOf: alumni,
          knowsAbout: ['İş İngilizcesi', 'Kurumsal iletişim'],
          image: `${BASE}/assets/images/WhatsApp_Image_2026-03-19_at_13.55.56-1773929304418.jpeg`,
          url: `${BASE}/hakkimizda`,
        },
      ],
    };
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </>
    );
  }
  