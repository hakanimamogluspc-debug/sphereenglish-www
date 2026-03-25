import type { Metadata } from 'next';

  export const metadata: Metadata = {
    title: 'İletişim — Ücretsiz Demo & Teklif Alın',
    description:
      'Sphere English ile iletişime geçin. Şirketiniz için ücretsiz ihtiyaç analizi ve kişiselleştirilmiş kurumsal İngilizce eğitim teklifi alın.',
    alternates: { canonical: 'https://www.sphereenglish.com/iletisim' },
    openGraph: {
      title: 'İletişim & Teklif Alın | Sphere English',
      description:
        'Şirketiniz için ücretsiz ihtiyaç analizi ve kurumsal İngilizce eğitim teklifi alın.',
      url: 'https://www.sphereenglish.com/iletisim',
      images: [{ url: '/assets/images/hero_online_english_lesson.png', width: 1200, height: 630 }],
    },
  };

  export default function IletisimLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  