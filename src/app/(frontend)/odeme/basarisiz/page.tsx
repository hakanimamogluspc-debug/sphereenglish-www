import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ödeme Tamamlanamadı | Sphere English',
  robots: { index: false, follow: false },
};

const REASON_LABELS: Record<string, string> = {
  token_eksik: 'Ödeme onayı alınamadı (token bulunamadı).',
  plan_bulunamadi: 'Seçilen plan kataloğumuzda bulunamadı.',
  sistem_hatasi: 'Beklenmeyen bir hata oluştu.',
};

export default function OdemeBasarisizPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const rawReason = searchParams.reason ?? '';
  const friendly = REASON_LABELS[rawReason] || decodeURIComponent(rawReason) || 'Ödeme tamamlanamadı.';

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <section className="max-w-2xl mx-auto px-6 py-20 lg:py-28 text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-[32px] lg:text-[40px] font-extrabold tracking-tight text-[#1B365D] mb-3">
          Ödeme Tamamlanamadı
        </h1>
        <p className="text-[16px] text-gray-600 mb-2 max-w-md mx-auto">{friendly}</p>
        <p className="text-[13px] text-gray-500 mb-8 max-w-md mx-auto">
          Hesabınızdan herhangi bir tahsilat yapılmadı. Tekrar denemek ister misiniz?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/abonelik"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
          >
            Tekrar Dene
          </Link>
          <Link
            href="/iletisim"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-[14px] text-[#1B365D] bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Bizimle İletişime Geç
          </Link>
        </div>

        <p className="mt-10 text-[13px] text-gray-500">
          Sorun devam ederse:{' '}
          <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a>{' '}
          ·{' '}
          <a className="text-[#0ea5e9]" href="https://wa.me/905066085810">WhatsApp</a>
        </p>
      </section>
      <Footer />
    </main>
  );
}
