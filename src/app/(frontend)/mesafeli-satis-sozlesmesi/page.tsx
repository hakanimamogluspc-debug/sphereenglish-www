import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi',
  description:
    'Sphere English dijital eğitim aboneliği satışına ilişkin Mesafeli Satış Sözleşmesi. 6502 sayılı Tüketici Kanunu kapsamında hak ve yükümlülükler.',
  alternates: { canonical: 'https://www.sphereenglish.com/mesafeli-satis-sozlesmesi' },
  robots: { index: true, follow: true },
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">Hukuki Bilgilendirme</p>
        <h1 className="text-[34px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.15] mb-3">
          Mesafeli Satış Sözleşmesi
        </h1>
        <p className="text-[14px] text-gray-500 mb-10">Son güncelleme: 22 Haziran 2026</p>

        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-2 mb-4">1. Taraflar</h2>
          <h3 className="text-[16px] font-bold text-[#1B365D] mt-4 mb-2">1.1. Satıcı (Hizmet Sağlayıcı)</h3>
          <p>
            <strong>Unvan:</strong> Sphere English Eğitim Hizmetleri
            <br /><strong>Adres:</strong> 150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir
            <br /><strong>E-posta:</strong> <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a>
            <br /><strong>WhatsApp:</strong> <a className="text-[#0ea5e9]" href="https://wa.me/905066085810">+90 506 608 58 10</a>
            <br /><strong>Web:</strong> <a className="text-[#0ea5e9]" href="https://www.sphereenglish.com">www.sphereenglish.com</a>
          </p>

          <h3 className="text-[16px] font-bold text-[#1B365D] mt-4 mb-2">1.2. Alıcı (Tüketici)</h3>
          <p>
            Web sitesi üzerinden ödeme yaparak aboneliği başlatan ve sipariş formunda kayıt
            ettiği ad-soyad, e-posta, telefon ve adres bilgilerine sahip kullanıcı.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">2. Sözleşmenin Konusu</h2>
          <p>
            İşbu sözleşmenin konusu, Alıcı&apos;nın Satıcı&apos;ya ait{' '}
            <a className="text-[#0ea5e9]" href="https://www.sphereenglish.com">www.sphereenglish.com</a> ve{' '}
            <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com">app.sphereenglish.com</a> üzerinden
            elektronik ortamda satın aldığı dijital eğitim aboneliği hizmetinin satışı ve ifasıyla
            ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
            Yönetmeliği hükümleri uyarınca tarafların hak ve yükümlülüklerinin belirlenmesidir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">3. Sözleşme Konusu Hizmet</h2>
          <p>
            <strong>Hizmet Türü:</strong> Çevrimiçi (online) kurumsal İş İngilizcesi eğitim aboneliği
            <br /><strong>Kapsam:</strong> AI Studio modülleri (Telaffuz Koçu, Yazma Koçu, Dilbilgisi
            Koçu, Kelime Oyunu, İş Senaryoları, Mülakat Simülatörü, Sunum Simülatörü vb.), canlı
            Zoom dersleri (planda yer alan saatlerde), seviye tespit sınavı, ilerleme raporları,
            tamamlanma sertifikası
            <br /><strong>Plan Detayları:</strong> Alıcı&apos;nın seçtiği planın tam içeriği ve fiyatı
            sipariş onayında ve <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com/student/subscription">Aboneliğim</a> sayfasında
            görüntülenir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">4. Bedel ve Ödeme</h2>
          <p>
            Hizmet bedeli, sipariş onayı sayfasında KDV dahil olarak gösterilir. Ödeme;
            kredi/banka kartı ile peşin ya da taksitli olarak Iyzico ödeme altyapısı üzerinden
            tahsil edilir. Kart bilgileri Satıcı sunucularına ulaşmaz; ödeme aracısının (Iyzico
            Ödeme Hizmetleri A.Ş.) PCI-DSS uyumlu altyapısında işlenir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">5. İfa Süresi ve Şekli</h2>
          <p>
            Ödemenin onaylanmasının ardından kullanıcı hesabına en geç 5 dakika içinde otomatik
            olarak abonelik tanımlanır. Hizmete erişim, kullanıcı adı ve şifre ile{' '}
            <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com">app.sphereenglish.com</a>{' '}
            üzerinden, internet bağlantısı bulunan tüm cihazlardan sağlanır. Fiziksel teslimat
            söz konusu değildir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">6. Cayma Hakkı</h2>
          <p>
            Alıcı, sözleşmenin kurulduğu tarihten itibaren <strong>14 (on dört) gün</strong> içinde
            herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma
            hakkına sahiptir.
          </p>
          <p>
            Ancak 6502 sayılı Kanun&apos;un 15. maddesinin (ğ) bendi ve Mesafeli Sözleşmeler
            Yönetmeliği&apos;nin 15. maddesi gereğince, <strong>elektronik ortamda anında ifa edilen
            ve maddi olmayan dijital içerikler</strong> bakımından, Alıcı&apos;nın onayı ile ifaya
            başlandıktan sonra cayma hakkı kullanılamaz. Alıcı, satın alma anında bu durumu
            açıkça kabul eder.
          </p>
          <p>
            Yine de iyi niyet kapsamında ve Satıcı&apos;nın iade politikası gereği; satın alma
            tarihinden itibaren 14 gün içinde iletilen iade talepleri değerlendirmeye alınır.
            Aktif kullanım (canlı ders katılımı, AI Studio modüllerinin yoğun kullanımı vb.)
            durumunda orantısal kesinti uygulanır.
          </p>
          <p>
            <strong>İade Süreci:</strong> Cayma bildirimi <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> adresine
            yapılır. Onay sonrasında ödeme, aynı kart sahibine 14 iş günü içinde Iyzico üzerinden
            iade edilir. Bankaya yansıma süresi 2-7 iş günü olabilir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">7. Yenilemeli Abonelik</h2>
          <p>
            Aylık otomatik yenilenen planlar, kullanıcı iptal etmediği sürece her ayın aynı
            gününde aynı tutarda otomatik yenilenir. Yenilemeyi durdurmak için kullanıcı{' '}
            <a className="text-[#0ea5e9]" href="https://app.sphereenglish.com/student/subscription">Aboneliğim</a> sayfasından
            iptal işlemini gerçekleştirebilir. İptal sonrasında mevcut dönem sonuna kadar erişim
            sürer, yeni tahsilat yapılmaz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">8. Genel Hükümler</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Alıcı, sözleşme konusu hizmetin temel nitelikleri, fiyatı ve ödeme şekli ile ifaya ilişkin tüm ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda onay verdiğini kabul eder.</li>
            <li>Satıcı, hizmette kısa süreli kesintilere yol açabilecek bakım, güncelleme veya teknik aksaklıklarda makul süre içinde hizmeti tekrar erişilebilir kılmakla yükümlüdür. Bakım süresinin abonelik süresinin %5&apos;ini aşması halinde, ilgili gün sayısı kullanım süresinden düşülmez.</li>
            <li>Alıcı, hesap bilgilerini üçüncü kişilerle paylaşmamayı, paylaşması halinde doğabilecek tüm sorumluluğu kabul etmeyi taahhüt eder.</li>
            <li>Mücbir sebep hallerinde (doğal afet, savaş, salgın, internet altyapı kesintisi vb.) Satıcı, hizmet ifasından sorumlu tutulamaz.</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">9. Yetkili Mahkeme</h2>
          <p>
            İşbu sözleşmenin uygulanmasından doğacak uyuşmazlıklarda, Gümrük ve Ticaret
            Bakanlığı&apos;nca her yıl belirlenen parasal sınırlar dahilinde Alıcı&apos;nın veya
            Satıcı&apos;nın yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırı aşan
            uyuşmazlıklarda Tüketici Mahkemeleri yetkilidir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">10. Yürürlük</h2>
          <p>
            10 (on) maddeden ibaret bu sözleşme, Alıcı tarafından elektronik ortamda okunup
            kabul edildikten sonra ödeme işleminin onaylanması anında yürürlüğe girer ve Satıcı
            tarafından ifa edilmek suretiyle sonuçlanır.
          </p>

          <p className="text-[13px] text-gray-500 mt-12 pt-6 border-t border-gray-200">
            Bu sözleşmenin son güncel versiyonu her zaman bu sayfada yayınlanır. Önemli
            değişikliklerde kullanıcı, kayıtlı e-posta adresinden bilgilendirilir.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
