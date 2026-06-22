import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EgitmenOlForm from './EgitmenOlForm';

export const metadata: Metadata = {
  title: 'Eğitmen Ol — Sphere English Kariyer',
  description:
    'Sphere English ekibinde uzaktan İngilizce öğretmeni olarak yer al. CV ile başvuru, online ders verme imkanı, esnek çalışma saatleri.',
  alternates: { canonical: 'https://www.sphereenglish.com/egitmen-ol' },
  robots: { index: true, follow: true },
};

export default function EgitmenOlPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />

      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-20 pb-10">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">Kariyer</p>
          <h1 className="text-[36px] lg:text-[48px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.1] mb-4">
            Sphere English Ekibinde Eğitmen Ol
          </h1>
          <p className="text-[16px] text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Alanında uzman İngilizce öğretmenleri ile çalışmayı, Sphere English ekibinde yer almasını çok
            isteriz. Uzaktan eğitim noktasında kendinize güveniyor ve online ders vermek isterseniz aşağıdaki
            formu doldurup CV ile bize gönderin. Sizi aramızda görmek bize mutluluk verecek.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-20">
        <EgitmenOlForm />
      </section>

      <Footer />
    </main>
  );
}
