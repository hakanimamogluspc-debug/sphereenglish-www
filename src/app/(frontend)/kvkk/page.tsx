import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description:
    'Sphere English KVKK aydınlatma metni. 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel veri işleme süreçleri.',
  alternates: { canonical: 'https://www.sphereenglish.com/kvkk' },
  robots: { index: true, follow: true },
};

export default function KvkkPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">KVKK</p>
        <h1 className="text-[34px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.15] mb-3">
          Kişisel Verilerin Korunması Aydınlatma Metni
        </h1>
        <p className="text-[14px] text-gray-500 mb-10">Son güncelleme: 17 Eylül 2026</p>

        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, Sphere English (&quot;Sphere
            English&quot; veya &quot;biz&quot;) olarak veri sorumlusu sıfatıyla kişisel verilerinizin işlenmesine
            ilişkin sizi bilgilendirmek isteriz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">1. Veri Sorumlusu</h2>
          <p>
            <strong>Sphere English</strong>
            <br />150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir
            <br />E-posta: <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a>
            <br />WhatsApp: <a className="text-[#0ea5e9]" href="https://wa.me/905066085810" target="_blank" rel="noopener noreferrer">+90 506 608 58 10</a>
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">2. İşlenen Kişisel Veri Kategorileri</h2>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Kimlik ve İletişim Bilgileri</h3>
          <p>Ad, soyad, e-posta adresi, telefon numarası, şirket adı ve unvan, T.C. kimlik numarası veya vergi kimlik
          numarası, fatura adresi.</p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Müşteri İşlem Bilgileri</h3>
          <p>Talep, teklif, satın alma, iade, şikayet ve destek yazışma kayıtları; ödeme durumu ve fatura bilgileri.</p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Hizmet Kullanım Verileri</h3>
          <p>Tamamladığınız dersler, seviye tespit sonuçları, ilerleme kayıtları, CEFR seviyeniz, kazandığınız
          sertifikalar, platform üzerinde geçirdiğiniz süre.</p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">AI Modülleri Tarafından İşlenen Veriler</h3>
          <p>
            AI destekli modüllerimiz (Yazma Koçu, Telaffuz Koçu, Dilbilgisi Koçu, Kişisel Tutor, AI Quiz, İş Senaryoları,
            Sunum ve Mülakat Simülasyonu) kullanıldığında; yazdığınız metinler, ses kayıtlarınız ve sohbet mesajlarınız
            işlenir.
          </p>
          <p>
            Bu veriler yalnızca size özel öneri ve geri bildirim üretmek amacıyla, kurumsal API sözleşmeleri kapsamındaki
            AI hizmet sağlayıcıları (OpenAI ve Anthropic) tarafından işlenir. <strong>Verileriniz model eğitiminde
            kullanılmaz</strong>. İşlem sonrası 30 gün içinde otomatik silinir.
          </p>
          <p>
            AI modüllerini ilk kez kullandığınızda açık onayınız istenir. Onayınızı istediğiniz zaman uygulama
            içinden geri çekebilirsiniz.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Mobil Uygulama Verileri</h3>
          <p>
            iOS ve Android uygulamalarımız kullanıldığında; cihaz modeli, işletim sistemi sürümü, uygulama sürümü,
            push bildirim token&apos;ı ve — izin verirseniz — mikrofon, kamera ve fotoğraf kütüphanesi erişimi
            aracılığıyla topladığınız veriler işlenir.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Pazarlama ve Analitik Verileri</h3>
          <p>Anket cevapları, çerez verileri, IP adresi, tarayıcı ve cihaz bilgileri, reklam performans verileri
          (yalnızca açık rızanızla).</p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">3. Verilerin İşlenme Amaçları ve Hukuki Sebepleri</h2>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Sözleşmenin Kurulması ve İfası (KVKK md. 5/2-c)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hesap oluşturma ve platform hizmetlerinin sağlanması</li>
            <li>Ödeme, fatura ve teslimat süreçlerinin yönetilmesi</li>
            <li>AI destekli eğitim modüllerinin çalıştırılması</li>
          </ul>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Yasal Yükümlülük (KVKK md. 5/2-ç)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-Arşiv fatura kesme ve saklama (VUK, TTK md. 82)</li>
            <li>Vergi ve muhasebe kayıtlarının tutulması</li>
            <li>Yetkili kamu kurumlarına bilgi verme</li>
          </ul>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Meşru Menfaat (KVKK md. 5/2-f)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Müşteri memnuniyetinin ölçülmesi ve hizmet kalitesinin artırılması</li>
            <li>Hizmet güvenliğinin ve dolandırıcılık önlemenin sağlanması</li>
            <li>İşlemsel bildirimlerin gönderilmesi (ders hatırlatması, fatura vb.)</li>
          </ul>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">Açık Rıza (KVKK md. 5/1)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pazarlama iletişimi (e-posta, SMS, push bildirim)</li>
            <li>Analitik ve pazarlama çerezlerinin kullanımı</li>
            <li>AI modüllerinde ses ve metin verilerinin işlenmesi</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">4. Verilerin Aktarımı</h2>
          <p>
            Kişisel verileriniz aşağıdaki taraflarla, yalnızca ilgili amaç için gerekli minimum kapsamda paylaşılır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ödeme hizmeti sağlayıcısı: <strong>Iyzico</strong> (Türkiye)</li>
            <li>e-Arşiv fatura sağlayıcısı: <strong>Luca</strong> (Türkiye)</li>
            <li>E-posta altyapısı: <strong>Resend</strong> (ABD/AB)</li>
            <li>AI dil modeli sağlayıcıları: <strong>OpenAI, Anthropic</strong> (ABD, kurumsal API)</li>
            <li>Bulut altyapısı ve CDN: <strong>Cloudflare, Vercel</strong></li>
            <li>Analitik hizmet sağlayıcıları: <strong>Google Analytics, Meta</strong> (yalnızca rızanızla)</li>
            <li>Push bildirim altyapısı: <strong>Apple APNs, Google FCM</strong></li>
            <li>Uygulama hata izleme: <strong>Sentry</strong></li>
            <li>Yasal yükümlülük kapsamında yetkili kamu kurum ve kuruluşları</li>
          </ul>
          <p>
            <strong>Yurt dışı aktarım:</strong> Yukarıdaki sağlayıcıların bir kısmı yurt dışında (özellikle ABD ve AB)
            yer almaktadır. Bu aktarımlar KVKK md. 9 kapsamında Kurul&apos;un güvenli ülke listesi ve/veya standart
            veri koruma sözleşme hükümleri çerçevesinde gerçekleştirilir.
          </p>
          <p>
            Verileriniz üçüncü taraflara <strong>satılmaz</strong> veya bağımsız pazarlama amacıyla devredilmez.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">5. Verilerin Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hesap bilgileri: hesap aktif olduğu sürece + silme sonrası 30 gün geri alma penceresi</li>
            <li>Fatura ve muhasebe verileri: 10 yıl (TTK md. 82)</li>
            <li>AI ses ve metin verileri: işlem sonrası 30 gün içinde silinir</li>
            <li>Sohbet ve tutor kayıtları: 12 ay, sonra anonimleştirilir</li>
            <li>Analitik veriler: 26 ay</li>
            <li>Pazarlama iletişim verileri: aboneliğinizi iptal edene kadar</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">6. Veri Sahibinin Hakları (KVKK md. 11)</h2>
          <p>Veri sahibi olarak şu haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşleme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>KVKK&apos;nın öngördüğü şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>Otomatik sistemlerle analiz sonucu aleyhinize doğan sonuca itiraz etme</li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde tazminat talep etme</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">7. Başvuru Yöntemi</h2>
          <p>
            Yukarıdaki haklarınızı kullanmak için başvurunuzu şu yollarla iletebilirsiniz:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>E-posta:</strong>{' '}
              <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> (kayıtlı
              e-posta adresinizden gönderin)</li>
            <li><strong>Uygulama içi hesap silme:</strong> Ayarlar &gt; Güvenlik &gt; Hesabımı Sil</li>
            <li><strong>Posta:</strong> Sphere English, 150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir</li>
          </ul>
          <p>
            Başvurunuz en geç <strong>30 gün</strong> içerisinde sonuçlandırılır. Kimlik doğrulaması yapabilmemiz için
            başvurunuzu kayıtlı e-posta adresinizden veya kimlik bilgilerinizi doğrulayacak şekilde göndermeniz
            gerekmektedir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">8. Gizlilik Politikamız</h2>
          <p>
            Veri işleme süreçlerimizin tam listesi ve teknik detayları için{' '}
            <a className="text-[#0ea5e9]" href="/gizlilik-politikasi">Gizlilik Politikamızı</a> inceleyiniz.
          </p>
        </div>
      </article>
      <Footer />
    </main>
  );
}
