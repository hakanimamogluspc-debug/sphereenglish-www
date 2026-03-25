import type { Metadata } from 'next';

  export const metadata: Metadata = {
    title: 'Nasıl Çalışır | Kurumsal İngilizce Eğitim Süreci',
    description:
      'Sphere English'in kurumsal iş İngilizcesi eğitim süreci: ihtiyaç analizi, kişiselleştirilmiş program tasarımı, canlı online dersler ve ölçülebilir raporlama. Şirketiniz için adım adım dil eğitimi.',
    alternates: { canonical: 'https://www.sphereenglish.com/nasil-calisir' },
    openGraph: {
      title: 'Nasıl Çalışır | Sphere English — Kurumsal Eğitim Süreci',
      description: 'İhtiyaç analizinden raporlamaya: kurumsal ingilizce eğitiminin adımları. Online, esnek ve ölçülebilir.',
      url: 'https://www.sphereenglish.com/nasil-calisir',
    },
  };

  export default function NasilCalisirLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  