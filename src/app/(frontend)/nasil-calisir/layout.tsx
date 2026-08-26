import type { Metadata } from 'next';
  import type { ReactNode } from 'react';

  export const metadata: Metadata = {
    title: 'Nasıl Çalışır | İş İngilizcesi Eğitim Süreci',
    description:
      "Sphere English iş İngilizcesi eğitim süreci: seviye tespiti, kişiselleştirilmiş program, canlı online dersler, aylık raporlama ve katılım sertifikası. Bireyler ve şirketler için adım adım süreç.",
    alternates: { canonical: 'https://www.sphereenglish.com/nasil-calisir' },
    openGraph: {
      title: 'Nasıl Çalışır | İş İngilizcesi Eğitim Süreci',
      description: "Seviye tespitinden raporlamaya iş İngilizcesi eğitim yolculuğunun 6 adımı.",
      url: 'https://www.sphereenglish.com/nasil-calisir',
    },
  };

  export default function NasilCalisirLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }
  