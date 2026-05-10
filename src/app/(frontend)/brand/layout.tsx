import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brand Kit',
  description:
    'Sphere English logo, marka renkleri, tipografi ve marka rehberi — basın, içerik üreticileri ve iş ortakları için tek noktada.',
  alternates: { canonical: '/brand' },
  openGraph: {
    title: 'Sphere English — Brand Kit',
    description:
      'Logo, renk paleti, tipografi ve marka rehberi. Basın ve işbirliği için tek noktada.',
    url: '/brand',
    type: 'website',
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
