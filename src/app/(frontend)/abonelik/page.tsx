import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AbonelikClient from './AbonelikClient';

export const metadata: Metadata = {
  title: 'Abonelik Planları | Sphere English',
  description:
    'Sphere English bireysel İngilizce eğitim aboneliği planları. Aylık ve peşin paket seçenekleri, Iyzico ile güvenli ödeme.',
  alternates: { canonical: 'https://www.sphereenglish.com/abonelik' },
  robots: { index: true, follow: true },
};

export default function AbonelikPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const planFromUrl = typeof searchParams.plan === 'string' ? searchParams.plan : undefined;
  const emailFromUrl = typeof searchParams.email === 'string' ? searchParams.email : undefined;
  const nameFromUrl = typeof searchParams.name === 'string' ? searchParams.name : undefined;

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">Abonelik</p>
          <h1 className="text-[36px] lg:text-[48px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.1] mb-4">
            Premium Plan ile İngilizceni Hızlandır
          </h1>
          <p className="text-[16px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Tüm AI Studio modülleri, canlı dersler ve sertifika programı.
            Iyzico ile güvenli, 3D Secure korumalı ödeme.
          </p>
        </div>

        <AbonelikClient
          initialPlanCode={planFromUrl}
          initialEmail={emailFromUrl}
          initialName={nameFromUrl}
        />

        {/* Güven göstergeleri */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-[12px] font-bold tracking-wider uppercase text-[#0ea5e9] mb-2">Güvenli Ödeme</p>
              <p className="text-[14px] text-gray-700">3D Secure korumalı, kart bilgileri Iyzico altyapısında işlenir — sunucularımıza ulaşmaz.</p>
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider uppercase text-[#0ea5e9] mb-2">14 Gün Cayma Hakkı</p>
              <p className="text-[14px] text-gray-700">Aktif kullanım olmayan abonelikler için 14 gün içinde iyi niyetli iade.</p>
            </div>
            <div>
              <p className="text-[12px] font-bold tracking-wider uppercase text-[#0ea5e9] mb-2">İstediğin An İptal</p>
              <p className="text-[14px] text-gray-700">Aboneliğim sayfasından tek tıkla iptal — dönem sonuna kadar erişim sürer.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[13px] text-gray-500">
          Satın alma işleminizle{' '}
          <a className="text-[#0ea5e9] underline" href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a>,{' '}
          <a className="text-[#0ea5e9] underline" href="/teslimat-iade">Teslimat ve İade Şartları</a> ve{' '}
          <a className="text-[#0ea5e9] underline" href="/kvkk">KVKK Aydınlatma Metni</a>&apos;ni kabul etmiş sayılırsınız.
        </div>
      </section>
      <Footer />
    </main>
  );
}
