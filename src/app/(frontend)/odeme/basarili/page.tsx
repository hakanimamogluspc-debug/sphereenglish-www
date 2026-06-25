import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ödeme Başarılı | Sphere English',
  robots: { index: false, follow: false },
};

export default function OdemeBasariliPage({
  searchParams,
}: {
  searchParams: { conv?: string; warn?: string; type?: string; token?: string };
}) {
  const conv = searchParams.conv ?? '';
  const warn = searchParams.warn;
  const type = searchParams.type;
  const token = searchParams.token;
  const isEbook = type === 'ebook';
  const downloadUrl = isEbook && token
    ? `https://app.sphereenglish.com/api-server/api/ebooks/download?token=${encodeURIComponent(token)}`
    : null;

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <section className="max-w-2xl mx-auto px-6 py-20 lg:py-28 text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-[32px] lg:text-[40px] font-extrabold tracking-tight text-[#1B365D] mb-3">
          {isEbook ? 'Kitabın Hazır! 🎉' : 'Ödemen Alındı 🎉'}
        </h1>
        <p className="text-[16px] text-gray-600 mb-8 max-w-md mx-auto">
          {isEbook
            ? 'Ödemen başarıyla alındı. Aşağıdaki butondan kitabını hemen indirebilirsin. Bağlantı 7 gün geçerli, 10 indirme hakkı verir.'
            : 'Aboneliğin aktif edildi. E-posta adresine giriş bilgileri ve makbuz gönderildi.'}
        </p>

        {/* E-kitap için indirme butonu */}
        {isEbook && downloadUrl && (
          <div className="mb-8">
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-[16px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-lg"
            >
              📄 Kitabı PDF Olarak İndir
            </a>
            <p className="text-[12px] text-gray-500 mt-3">
              Bağlantıyı kaydetmeyi unutma — 7 gün geçerli, sonra yeniden satın alman gerekir.
            </p>
          </div>
        )}

        {warn === 'manuel' && (
          <div className="mb-6 mx-auto max-w-md p-4 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900 text-left">
            <strong>Bilgi:</strong> Ödemen başarıyla alındı ancak hesap aktivasyonunda kısa bir gecikme
            yaşanıyor. Birkaç dakika içinde aktif olacak. Sorun yaşarsan{' '}
            <a className="underline" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> ile
            iletişime geç.
          </div>
        )}

        {!isEbook && (
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
            <p className="text-[12px] font-bold tracking-wider uppercase text-gray-500 mb-3">Şimdi Ne Yapacaksın?</p>
            <ol className="space-y-3 text-[14px] text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">1</span>
                <span>E-posta gelen kutunu kontrol et — giriş linkimiz orada.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">2</span>
                <span>
                  <a className="text-[#0ea5e9] font-semibold" href="https://app.sphereenglish.com/login">app.sphereenglish.com</a>{' '}
                  adresinden giriş yap.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0ea5e9] text-white font-bold text-[12px] flex items-center justify-center">3</span>
                <span>Seviye belirleme testini yap ve AI Studio&apos;nun tüm özelliklerine başla.</span>
              </li>
            </ol>
          </div>
        )}

        <Link
          href={isEbook ? "/e-kitaplar" : "https://app.sphereenglish.com/login"}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
        >
          {isEbook ? 'Diğer Kitaplara Göz At' : "Sphere English'e Git"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {conv && (
          <p className="mt-6 text-[11px] text-gray-400">İşlem No: {conv}</p>
        )}

        <p className="mt-10 text-[13px] text-gray-500">
          Yardım gerekirse:{' '}
          <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a>{' '}
          ·{' '}
          <a className="text-[#0ea5e9]" href="https://wa.me/905066085810">WhatsApp</a>
        </p>
      </section>
      <Footer />
    </main>
  );
}
