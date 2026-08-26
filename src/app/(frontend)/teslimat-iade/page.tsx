import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Teslimat ve İade Şartları',
  description:
    'Sphere English dijital eğitim aboneliği teslimat şartları, 14 günlük cayma hakkı ve iade prosedürleri.',
  alternates: { canonical: 'https://www.sphereenglish.com/teslimat-iade' },
  robots: { index: true, follow: true },
};

export default function TeslimatIadePage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">Hukuki Bilgilendirme</p>
        <h1 className="text-[34px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.15] mb-3">
          Teslimat ve İade Şartları
        </h1>
        <p className="text-[14px] text-gray-500 mb-10">Son güncelleme: 22 Haziran 2026</p>

        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
          <p>
            Bu sayfa, Sphere English üzerinden satın alınan dijital eğitim hizmetlerinin teslimat
            ve iade koşullarını düzenler. 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
            Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak hazırlanmıştır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">1. Hizmet Sağlayıcı</h2>
          <p>
            <strong>Sphere English Eğitim Hizmetleri</strong>
            <br />150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir
            <br />E-posta: <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a>
            <br />WhatsApp: <a className="text-[#0ea5e9]" href="https://wa.me/905066085810" target="_blank" rel="noopener noreferrer">+90 506 608 58 10</a>
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">2. Hizmetin Niteliği</h2>
          <p>
            Sphere English, fiziksel ürün satışı yapmaz. Sunduğumuz hizmetler tamamen dijital
            olup, web ve mobil tabanlı eğitim platformu üzerinden çevrimiçi (online) olarak
            kullanıcıya sunulan kurumsal İş İngilizcesi eğitim aboneliklerinden oluşur. Bu
            kapsamda canlı dersler, AI Studio modülleri, müfredat erişimi, kelime/quiz/koç
            uygulamaları ve sertifika çıktıları dijital hizmet niteliğindedir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">3. Teslimat</h2>
          <p>
            Ödemenin onaylanmasının ardından kullanıcı hesabına en geç <strong>5 dakika içinde</strong>{' '}
            otomatik olarak abonelik tanımlanır. Kullanıcı, kayıtlı e-posta adresine gönderilen
            onay maili ile birlikte <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com">app.sphereenglish.com</a>{' '}
            adresinden hesabına giriş yaparak hizmete erişebilir. Fiziksel teslimat ve kargo
            ücreti söz konusu değildir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">4. Cayma Hakkı (14 Gün)</h2>
          <p>
            Tüketici, ödeme tarihinden itibaren <strong>14 gün</strong> içinde herhangi bir
            gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.
            Cayma hakkı şu koşulla geçerlidir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcı, ödeme tarihinden itibaren 14 gün içinde aşağıdaki kanallardan birinden cayma talebini iletmelidir.</li>
            <li>Cayma talebi anında, kullanıcının hizmet kullanımı (canlı ders katılımı, AI Studio modüllerinden faydalanılan tutar) hesaplanır ve hesap kapatılır.</li>
            <li>
              <strong>Önemli istisna:</strong> 6502 sayılı Kanun&apos;un 15. maddesinin (ğ) bendi
              gereğince, elektronik ortamda anında ifa edilen ve maddi olmayan dijital içeriklere
              ilişkin sözleşmelerde, tüketicinin onayı ile ifa başlamışsa cayma hakkı bulunmamaktadır.
              Sphere English aboneliği satın alındığı anda hizmet erişimi açıldığı için, kullanıcı
              ödeme sırasında bu durumu kabul etmiş sayılır. Yine de iyi niyet kapsamında, aktif
              kullanım olmayan abonelikler için 14 gün içinde iade talep edilebilir.
            </li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">5. İade Talebi ve Süreç</h2>
          <p>İade talebinizi şu kanallardan birinden iletebilirsiniz:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-posta: <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> (konu: &quot;İade Talebi&quot;)</li>
            <li>WhatsApp: <a className="text-[#0ea5e9]" href="https://wa.me/905066085810">+90 506 608 58 10</a></li>
            <li>Hesabınızdan: <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com/student/subscription">Aboneliğim</a> sayfasında &quot;İptal Et&quot; butonu</li>
          </ul>
          <p>
            İade talebinizin onaylanması durumunda, ödemenin yapıldığı kart sahibine iade,{' '}
            <strong>14 iş günü içinde</strong> ödeme aracısı (Iyzico) üzerinden yapılır. Banka tarafına
            yansıma süresi 2-7 iş günü arasında değişebilir. İade tutarı, ödeme tarihinden itibaren
            kullanılan gün sayısı oranında düşülerek hesaplanır (orantısal iade).
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">6. Yenilemeli Abonelikler</h2>
          <p>
            Aylık otomatik yenilenen abonelikler her ayın sonunda yenilenir. Kullanıcı, bir
            sonraki ödeme tarihine kadar Aboneliğim sayfasından iptal işlemini gerçekleştirirse,
            mevcut dönem sonuna kadar hizmet erişimi devam eder, ek tahsilat yapılmaz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">7. Peşin Paket Abonelikler</h2>
          <p>
            3 aylık, 6 aylık veya yıllık peşin satın alınan paketler tek seferlik ödeme ile
            yapılır ve süre sonunda otomatik yenilenmez. Süre dolmadan iptal talep edilirse,
            kullanım gün sayısına orantılı olarak iade yapılır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">8. Tüketici Hakem Heyeti</h2>
          <p>
            Sözleşme veya iade işlemleri ile ilgili uyuşmazlıklarda, 6502 sayılı Tüketicinin
            Korunması Hakkında Kanun çerçevesinde, ilgili parasal sınırlar dahilinde tüketicinin
            ikametgahının veya hizmet sağlayıcının yerleşim yerinin bulunduğu yerdeki Tüketici
            Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
          </p>

          <p className="text-[13px] text-gray-500 mt-12 pt-6 border-t border-gray-200">
            Bu sayfa düzenli olarak güncellenmektedir. Güncellemelerden haberdar olmak için
            kullanıcı, hesabına kayıtlı e-posta adresinden bilgilendirilir.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
