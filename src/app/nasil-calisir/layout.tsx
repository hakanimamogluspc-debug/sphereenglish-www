import type { Metadata } from 'next';

  export const metadata: Metadata = {
    title: 'Nasıl Çalışır? — Eğitim Süreci & Metodoloji',
    description:
      'Sphere English\'in 4 aşamalı kurumsal İngilizce eğitim süreci: İhtiyaç analizi, kişiselleştirilmiş müfredat, canlı dersler ve ölçülebilir raporlama. Nasıl çalıştığını keşfedin.',
    alternates: { canonical: 'https://www.sphereenglish.com/nasil-calisir' },
    openGraph: {
      title: 'Nasıl Çalışır? | Sphere English',
      description:
        'Şirketinizin ihtiyaçlarına göre kişiselleştirilmiş İngilizce eğitim süreci. 4 adımda ölçülebilir sonuçlar.',
      url: 'https://www.sphereenglish.com/nasil-calisir',
      images: [{ url: '/assets/images/hero_online_english_lesson.png', width: 1200, height: 630 }],
    },
  };

  export default function NasilCalisirLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  