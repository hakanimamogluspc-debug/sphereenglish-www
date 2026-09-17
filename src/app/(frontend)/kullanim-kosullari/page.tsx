import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description:
    'Sphere English platformu kullanım koşulları. Hizmet kapsamı, hak ve yükümlülükler, ödeme, iptal ve iade politikaları.',
  alternates: { canonical: 'https://www.sphereenglish.com/kullanim-kosullari' },
  robots: { index: true, follow: true },
};

export default function KullanimKosullariPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">Sözleşme</p>
        <h1 className="text-[34px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.15] mb-3">
          Kullanım Koşulları
        </h1>
        <p className="text-[14px] text-gray-500 mb-10">Son güncelleme: 17 Eylül 2026</p>

        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
          <p>
            <strong>sphereenglish.com</strong> web sitesini, <strong>app.sphereenglish.com</strong> öğrenci
            platformunu ve <strong>Sphere English iOS ile Android mobil uygulamalarını</strong> (topluca
            &quot;Platform&quot;) kullanmadan önce lütfen aşağıdaki koşulları dikkatlice okuyunuz. Platformu
            kullanmaya devam etmeniz bu koşulları kabul ettiğiniz anlamına gelir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">1. Hizmet Tanımı</h2>
          <p>
            Sphere English; Türk profesyonellere yönelik, Oxford University Press müfredat kaynaklarıyla desteklenen bir
            İş İngilizcesi eğitim platformudur. Hizmetlerimiz şunları içerir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Grup kursları</strong> — 4 haftalık, canlı grup dersleri (Foundation A1-A2, Corporate
              Diplomacy B1-B2)</li>
            <li><strong>E-kitap kütüphanesi</strong> — iş İngilizcesi odaklı 5 e-kitap seti</li>
            <li><strong>AI destekli öğrenme modülleri</strong> — Yazma Koçu, Telaffuz Koçu, Dilbilgisi Koçu, Kişisel
              Tutor, AI Quiz, İş Senaryoları, Sunum ve Mülakat Simülasyonu</li>
            <li><strong>CEFR seviye tespiti</strong> ve ilerleme takibi</li>
            <li><strong>Sertifikasyon</strong> — ders tamamlama sertifikaları</li>
          </ul>
          <p>
            Kurumsal grup programları ayrı sözleşme şartları çerçevesinde sağlanır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">2. Hesap ve Kullanım</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Platform hesabı için verdiğiniz bilgilerin doğru ve güncel olduğunu beyan edersiniz.</li>
            <li>Hesabınızın güvenliği (şifre, oturum) sizin sorumluluğunuzdadır. Şüpheli aktivite durumunda derhal
              bize bildirin.</li>
            <li>Platformu yalnızca yasal amaçlar için kullanabilirsiniz.</li>
            <li>Hesabınızı başkalarıyla paylaşamaz, satamaz veya kiralayamazsınız.</li>
            <li>İçeriklere yetkisiz erişim, sistemleri manipüle etme, tersine mühendislik veya zarar verme yasaktır.</li>
            <li>Kullanıcı en az 13 yaşında olmalıdır. 13-18 yaş arası kullanıcılar için yasal veli onayı gereklidir.</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">3. Hesabınızı Silme</h2>
          <p>
            Hesabınızı istediğiniz zaman silebilirsiniz:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Uygulama içinden:</strong> Ayarlar &gt; Güvenlik &gt; Hesabımı Sil</li>
            <li><strong>E-posta ile:</strong>{' '}
              <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> adresine
              talep gönderin</li>
          </ul>
          <p>
            Hesabınız silindiğinde kişisel bilgileriniz, ilerleme kayıtlarınız ve AI etkileşim verileriniz silinir.
            Yasal saklama zorunluluğu olan veriler (fatura kayıtları) anonimleştirilerek saklanır. Silme geri alınamaz.
            Detaylar için <a className="text-[#0ea5e9]" href="/gizlilik-politikasi">Gizlilik Politikamıza</a> bakın.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">4. AI Modüllerinin Kullanımı</h2>
          <p>
            AI destekli modüllerimiz (Yazma Koçu, Telaffuz Koçu, Dilbilgisi Koçu, Kişisel Tutor, AI Quiz, İş Senaryoları,
            Sunum ve Mülakat Simülasyonu) kullanıldığında yazdığınız metinler, ses kayıtlarınız ve sohbet mesajlarınız
            işlenir.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>AI modüllerini ilk kez kullandığınızda açık onayınız istenir.</li>
            <li>AI çıktıları eğitim amaçlıdır — kesin veya profesyonel tavsiye niteliği taşımaz.</li>
            <li>Ses ve metin verileriniz OpenAI ve Anthropic&apos;in kurumsal API sözleşmeleri kapsamında işlenir;
              model eğitiminde kullanılmaz.</li>
            <li>Onayınızı Ayarlar &gt; Gizlilik menüsünden geri çekebilirsiniz. Onay geri çekildiğinde AI özellikleri
              devre dışı kalır.</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">5. Fikri Mülkiyet</h2>
          <p>
            Platform üzerindeki tüm içerikler (müfredat, video, AI koç karakterleri, e-kitaplar, ses kayıtları, yazılım
            kodu, marka ve logolar) Sphere English ve/veya lisans verenlerine (Oxford University Press dahil) aittir.
            İzinsiz kopyalama, dağıtım ve türev iş oluşturma yasaktır.
          </p>
          <p>
            Satın aldığınız içerikler için kişisel, ticari olmayan kullanım hakkına sahip olursunuz. E-kitapları
            veya ders içeriklerini üçüncü şahıslarla paylaşamaz, yeniden satamaz veya kamuya sunamaz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">6. Ödeme, İptal ve İade</h2>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">6.1 Ödeme</h3>
          <p>
            Web sitemizden yapılan satın almalar Iyzico altyapısı üzerinden Türk Lirası (TRY) olarak alınır. Fiyatlara
            KDV dahildir. Her ödeme sonrası yasal e-Arşiv fatura kesilir ve e-posta ile iletilir.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">6.2 E-kitap Cayma Hakkı</h3>
          <p>
            E-kitap satın alımınızda dijital içerik indirilir indirilmez ifa tamamlanmış sayılır (6502 sayılı Tüketicinin
            Korunması Hakkında Kanun md. 15/1-ğ). Bu nedenle indirme sonrası cayma hakkı bulunmaz. İndirme öncesi
            iptal talepleri için 14 gün içinde tam iade sağlanır.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">6.3 Kurs Cayma Hakkı</h3>
          <p>
            Grup kurs kayıtlarınız için, kurs başlangıç tarihinden önce iptal edildiğinde tam iade yapılır. Kurs
            başladıktan sonra:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>İlk hafta içinde iptal: %75 iade</li>
            <li>İkinci hafta içinde iptal: %50 iade</li>
            <li>Üçüncü hafta ve sonrası: iade yapılmaz</li>
          </ul>
          <p>
            Sağlık veya mücbir sebep durumlarında kurs bir sonraki döneme aktarılabilir.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">6.4 Mobil Uygulama Satın Almaları</h3>
          <p>
            iOS ve Android uygulamalarımız yalnızca içerik erişimi sağlar. Yeni satın almalar Sphere English web sitesi
            üzerinden yapılır. Uygulama içinde satın alma özelliği bulunmamaktadır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">7. Mobil Uygulama Kullanımı</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Uygulama, App Store ve Google Play koşullarına ek olarak bu kullanım koşullarına tabidir.</li>
            <li>Cihaz izinleri (mikrofon, kamera, bildirim) yalnızca ilgili özelliğin çalışması için istenir.</li>
            <li>Uygulama otomatik olarak güncelleme alabilir. Sürüm uyumluluk sorumluluğu size aittir.</li>
            <li>İndirilen e-kitap dosyaları yalnızca uygulama içinde okunabilir; başka cihazlara veya kişilere
              aktarılamaz.</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">8. Hizmet Değişiklikleri ve Kesintiler</h2>
          <p>
            Sphere English, hizmet özelliklerinde ve içeriklerde değişiklik yapma hakkını saklı tutar. Kapsamı önemli
            ölçüde etkileyen değişiklikler için en az 30 gün önceden bildirim yaparız.
          </p>
          <p>
            Planlı bakım, sistem güncellemeleri veya teknik zorunluluklar nedeniyle hizmet geçici olarak kesintiye
            uğrayabilir. Bu tür kesintiler için tazminat yükümlülüğümüz bulunmamaktadır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">9. Sorumluluk Sınırlaması</h2>
          <p>
            Sphere English, hizmetin sürekliliği için makul çabayı gösterir ancak aşağıdakilerden sorumlu tutulamaz:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kullanıcı hatalarından kaynaklanan veri kayıpları</li>
            <li>Üçüncü taraf servislerinin (Zoom, OpenAI, Iyzico vb.) kesintileri</li>
            <li>AI çıktılarının doğruluğu veya uygunluğu — kullanıcının kendi değerlendirmesi gereklidir</li>
            <li>İnternet altyapısındaki dolaylı zararlar</li>
            <li>Mücbir sebep hâlleri</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">10. Hesap Askıya Alma ve Fesih</h2>
          <p>
            Aşağıdaki hâllerde hesabınızı önceden bildirimde bulunarak veya bulunmayarak askıya alabilir veya
            kapatabiliriz:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bu kullanım koşullarının ihlali</li>
            <li>Yasadışı içerik oluşturma, dağıtma veya paylaşma</li>
            <li>Platform güvenliğinin tehlikeye atılması</li>
            <li>Ödeme sorunları ve tekrarlanan iade taleplerinin kötüye kullanılması</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">11. Değişiklikler</h2>
          <p>
            Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler için tüm kayıtlı kullanıcılara
            en az 30 gün önceden e-posta veya uygulama içi bildirimle haber veririz. Güncel sürüm her zaman bu sayfada
            yer alır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">12. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
          <p>
            Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Doğacak uyuşmazlıklarda Balıkesir Mahkemeleri ve İcra
            Daireleri yetkilidir. Tüketici Kanunu kapsamındaki uyuşmazlıklarda Tüketici Hakem Heyeti&apos;ne başvurma
            hakkınız saklıdır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">13. İletişim</h2>
          <p>
            Sorularınız için:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-posta: <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a></li>
            <li>WhatsApp: <a className="text-[#0ea5e9]" href="https://wa.me/905066085810" target="_blank" rel="noopener noreferrer">+90 506 608 58 10</a></li>
            <li>Adres: 150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir</li>
          </ul>
        </div>
      </article>
      <Footer />
    </main>
  );
}
