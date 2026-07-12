import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FiyatlandirmaClient from './FiyatlandirmaClient';

// Feature flag: fiyatlandırma/abonelik paketleri henüz satışa açık değil.
// Açmak için: NEXT_PUBLIC_SHOW_PRICING=true env variable ekle (Easypanel).
const SHOW_PRICING = process.env.NEXT_PUBLIC_SHOW_PRICING === 'true';

export const metadata: Metadata = SHOW_PRICING
  ? {
      title: 'Fiyatlandırma | Sphere English — Kurumsal İş İngilizcesi Eğitim Platformu',
      description:
        'Sphere English bireysel ve kurumsal İngilizce eğitim paketleri. Şeffaf fiyatlandırma, aylık ve peşin paket seçenekleri, kurumsal teklif imkanı.',
      alternates: { canonical: 'https://www.sphereenglish.com/fiyatlandirma' },
      robots: { index: true, follow: true },
      openGraph: {
        title: 'Fiyatlandırma — Sphere English',
        description: 'Şeffaf fiyatlandırma, esnek planlar, kurumsal indirimler.',
        url: 'https://www.sphereenglish.com/fiyatlandirma',
        type: 'website',
      },
    }
  : {
      title: 'Sayfa bulunamadı | Sphere English',
      robots: { index: false, follow: false },
    };

export default function FiyatlandirmaPage() {
  // Feature flag kapalıysa 404 dön
  if (!SHOW_PRICING) notFound();

  return (
    <main className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">Fiyatlandırma</p>
          <h1 className="text-[40px] lg:text-[56px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-5">
            Şeffaf Fiyatlandırma,<br />Esnek Planlar
          </h1>
          <p className="text-[17px] lg:text-[19px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Bireyden ekiplere, başlangıçtan executive seviyeye — her ölçeğe uygun bir planımız var.
            Tüm planlar AI Studio modüllerini, canlı koçluğu ve sertifika programını içerir.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7 text-[13px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Aylık iptal
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 14 gün iade güvencesi
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Iyzico 3D Secure
            </span>
          </div>
        </div>
      </section>

      {/* Plan kartları + karşılaştırma + SSS — client component */}
      <FiyatlandirmaClient />

      {/* Kurumsal CTA */}
      <section className="bg-[#1B365D] text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#7dd3fc] uppercase mb-3">Kurumsal Çözüm</p>
          <h2 className="text-[28px] lg:text-[36px] font-extrabold tracking-[-0.02em] mb-4">
            10+ Çalışanlı Ekipler için Özel Teklif
          </h2>
          <p className="text-[16px] text-white/75 max-w-2xl mx-auto mb-8 leading-relaxed">
            Kurumsal indirim, özelleştirilmiş öğrenme planı, dedicated success manager, kurumsal sertifika
            programı ve detaylı yönetici raporları. Ekip büyüklüğüne göre fiyatlandırma yapılır.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/iletisim"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-[14px] text-[#1B365D] bg-white hover:bg-gray-100 transition-colors"
            >
              Kurumsal Teklif Al
            </a>
            <a
              href="https://wa.me/905066085810"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-[14px] text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              WhatsApp ile İletişim
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
