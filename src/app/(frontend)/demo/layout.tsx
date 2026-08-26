import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Demo Randevusu Al',
  description:
    "Sphere English demo görüşmesi için hemen ücretsiz randevu alın. 30 dakikalık birebir görüşmede ihtiyaçlarınızı dinleyip size özel programı beraber belirleyelim.",
  alternates: { canonical: 'https://www.sphereenglish.com/demo' },
  openGraph: {
    title: 'Ücretsiz Demo Randevusu',
    description: "30 dakikalık birebir demo görüşmesi. Size özel İngilizce programını beraber belirleyelim.",
    url: 'https://www.sphereenglish.com/demo',
  },
};

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
