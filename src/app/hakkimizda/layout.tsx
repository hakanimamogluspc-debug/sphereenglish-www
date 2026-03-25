import type { Metadata } from 'next';

  export const metadata: Metadata = {
    title: 'Hakkımızda — Kurucu Ekip & Vizyon',
    description:
      'Sphere English, 2019\'dan bu yana Türk iş dünyasını global arenada güçlendiriyor. Didem İmamoğlu ve Merve Eş liderliğinde Oxford ortaklığıyla 50+ şirkete kurumsal İngilizce eğitimi.',
    alternates: { canonical: 'https://www.sphereenglish.com/hakkimizda' },
    openGraph: {
      title: 'Hakkımızda | Sphere English',
      description:
        '2019\'dan bu yana 50+ kurumsal müşteri, 500+ eğitim alan çalışan. Türkiye\'nin önde gelen kurumsal İngilizce eğitim markası.',
      url: 'https://www.sphereenglish.com/hakkimizda',
      images: [{ url: '/assets/images/Sphere_4_-1774052291173.png', width: 1200, height: 630 }],
    },
  };

  export default function HakkimizdaLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  