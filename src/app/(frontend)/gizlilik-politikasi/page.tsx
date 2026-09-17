import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description:
    'Sphere English gizlilik politikası. Kullanıcı verilerinin nasıl toplandığı, işlendiği, korunduğu ve haklarınız hakkında detaylı bilgi.',
  alternates: { canonical: 'https://www.sphereenglish.com/gizlilik-politikasi' },
  robots: { index: true, follow: true },
};

export default function GizlilikPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />
      <article className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">Gizlilik</p>
        <h1 className="text-[34px] lg:text-[44px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.15] mb-3">
          Gizlilik Politikası
        </h1>
        <p className="text-[14px] text-gray-500 mb-10">Son güncelleme: 17 Eylül 2026 · Yürürlük tarihi: 17 Eylül 2026</p>

        <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 space-y-6">
          <p>
            Sphere English olarak (&quot;Sphere English&quot;, &quot;biz&quot;) kullanıcılarımızın gizliliğine büyük önem
            veriyoruz. Bu Gizlilik Politikası; <strong>sphereenglish.com</strong> web sitesini,
            <strong> app.sphereenglish.com</strong> öğrenci platformunu ve <strong>Sphere English iOS/Android mobil
            uygulamalarını</strong> (topluca &quot;Platform&quot;) kullandığınızda topladığımız verileri nasıl işlediğimizi
            ve koruduğumuzu açıklar.
          </p>

          <p>
            Bu politika 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), GDPR ve Apple App Store ile Google Play
            gizlilik gerekliliklerine uygun olarak hazırlanmıştır.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">1. Topladığımız Bilgiler</h2>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.1 Hesap ve İletişim Bilgileri</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Ad, soyad, e-posta adresi, telefon numarası</li>
            <li>Şirket adı ve unvan (kurumsal müşteriler için)</li>
            <li>Fatura bilgileri: T.C. kimlik numarası veya vergi kimlik numarası, adres (yasal fatura zorunluluğu)</li>
            <li>Profil fotoğrafı (opsiyonel — kullanıcı yüklerse)</li>
          </ul>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.2 Platform Kullanım Verileri</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Hangi dersleri, quizleri, e-kitapları tamamladığınız ve ilerlemeniz</li>
            <li>Platform üzerinde geçirdiğiniz süre, kullanılan modüller</li>
            <li>Seviye tespit sınav sonuçları ve CEFR ilerlemeniz</li>
            <li>Sertifika ve başarı kayıtları</li>
          </ul>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.3 AI Modülleri Tarafından İşlenen Veriler</h3>
          <p>
            AI destekli modüllerimiz (Yazma Koçu, Telaffuz Koçu, Dilbilgisi Koçu, Kişisel Tutor, AI Quiz, İş Senaryoları,
            Sunum ve Mülakat Simülasyonu) kullanıldığında aşağıdaki veriler işlenir:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Yazdığınız metinler</strong> — Yazma Koçu ve Dilbilgisi Koçu için</li>
            <li><strong>Ses kayıtlarınız</strong> — Telaffuz Koçu ve konuşma pratiği modülleri için</li>
            <li><strong>Sohbet mesajlarınız</strong> — AI Tutor ve simulasyon modülleri için</li>
          </ul>
          <p>
            <strong>İlk AI modülü kullanımınızda açık onayınız istenir</strong>; bu onayı vermeden AI özelliklerini
            kullanamazsınız. Onayınızı Ayarlar &gt; Gizlilik menüsünden istediğiniz zaman geri çekebilirsiniz.
          </p>
          <p>
            Bu veriler yalnızca size özel öneri ve geri bildirim üretmek için işlenir. <strong>Verileriniz AI model
            eğitiminde kullanılmaz</strong> — OpenAI ve Anthropic&apos;in kurumsal API sözleşmeleri kapsamında hizmet
            alıyoruz ve model eğitim opt-out&apos;u aktiftir. Ses ve metin verileri işlem sonrasında 30 gün içinde
            silinir.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.4 Ödeme Bilgileri</h3>
          <p>
            Ödemeler <strong>Iyzico</strong> altyapısı üzerinden alınır. Kart bilgileriniz Sphere English sunucularında
            saklanmaz — yalnızca Iyzico ile PCI-DSS uyumlu şekilde işlenir. Bize sadece ödeme durumu, tutar ve işlem
            kimliği iletilir.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.5 Mobil Uygulama İzinleri</h3>
          <p>Sphere English mobil uygulaması aşağıdaki cihaz izinlerini talep edebilir:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Mikrofon:</strong> Telaffuz Koçu ve konuşma pratiği modüllerinde konuşmanızı analiz etmek için</li>
            <li><strong>Kamera:</strong> Profil fotoğrafı çekmek için (opsiyonel)</li>
            <li><strong>Fotoğraf kütüphanesi:</strong> Profil fotoğrafı yüklemek için (opsiyonel)</li>
            <li><strong>Bildirimler:</strong> Ders hatırlatması, streak uyarısı ve önemli hesap bildirimleri için</li>
            <li><strong>Dosya erişimi:</strong> Satın aldığınız e-kitapları çevrimdışı okumak için (yalnızca uygulama
              içi depolama alanı)</li>
          </ul>
          <p>
            İzinlerin her biri talep edildiğinde reddedebilirsiniz. Reddettiğinizde yalnızca ilgili özellik devre dışı
            kalır, diğer özellikler etkilenmez.
          </p>

          <h3 className="text-[17px] font-bold text-[#1B365D] mt-6 mb-2">1.6 Teknik ve Analitik Veriler</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>IP adresi, tarayıcı tipi, işletim sistemi ve cihaz modeli</li>
            <li>Ziyaret zamanı ve sayfa görüntüleme davranışı</li>
            <li>Çerez tanımlayıcıları ve reklam tanımlayıcıları (opsiyonel — bkz. bölüm 6)</li>
            <li>Uygulama içi çökme ve hata raporları (Sentry ile toplanır, anonim)</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">2. Verileri Nasıl Kullanıyoruz</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Eğitim hizmetini sağlamak, seviyenize uygun ders ve içerik önermek</li>
            <li>Talep, teklif, sözleşme ve fatura süreçlerini yönetmek</li>
            <li>Yasal e-Arşiv fatura zorunluluğunu yerine getirmek</li>
            <li>Ders hatırlatması ve önemli hesap bildirimleri göndermek</li>
            <li>Müşteri memnuniyetini ölçmek, hizmet kalitesini artırmak</li>
            <li>Pazarlama iletişimi göndermek — <strong>yalnızca açık rızanız varsa</strong>, istediğiniz zaman iptal
              edebilirsiniz</li>
            <li>KVKK ve diğer yasal yükümlülükleri yerine getirmek</li>
            <li>Dolandırıcılık, kötüye kullanım ve güvenlik ihlallerini önlemek</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">3. Üçüncü Taraf Hizmet Sağlayıcıları</h2>
          <p>
            Verilerinizi aşağıdaki hizmet sağlayıcılarıyla, yalnızca hizmetimizi sağlamak için gerekli olan minimum
            kapsamda paylaşırız:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Iyzico</strong> (ödeme altyapısı) — Türkiye</li>
            <li><strong>Luca / e-Arşiv sağlayıcısı</strong> (yasal e-fatura düzenleme) — Türkiye</li>
            <li><strong>Resend</strong> (transactional ve pazarlama e-postaları) — ABD/AB</li>
            <li><strong>OpenAI</strong> (AI dil modelleri — API kurumsal sözleşme) — ABD</li>
            <li><strong>Anthropic (Claude)</strong> (AI dil modelleri — API kurumsal sözleşme) — ABD</li>
            <li><strong>Cloudflare</strong> (CDN, güvenlik) — Global</li>
            <li><strong>Vercel / Coolify</strong> (uygulama barındırma altyapısı)</li>
            <li><strong>Meta (Facebook, Instagram)</strong> (reklam ölçümü — CAPI) — reklamdan geldiyseniz</li>
            <li><strong>Google Analytics (GA4)</strong> (site kullanım analitiği — IP anonimleştirilmiş)</li>
            <li><strong>Apple / Google</strong> (push bildirimler — APNs, FCM)</li>
            <li><strong>Sentry</strong> (uygulama hata izleme — kişisel veri hariç)</li>
          </ul>
          <p>
            Bu hizmet sağlayıcıları verilerinizi yalnızca bize sağladıkları hizmet için işleyebilir, kendi amaçları için
            kullanamazlar. Yurt dışı aktarımlar KVKK md. 9 kapsamında, güvenli ülke listesi ve/veya standart sözleşme
            hükümleriyle korunur.
          </p>
          <p>
            Verileriniz <strong>hiçbir koşulda üçüncü taraflara satılmaz</strong> veya bağımsız pazarlama amacıyla
            devredilmez.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">4. Veri Saklama Süreleri</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Hesap bilgileri:</strong> Hesap aktif olduğu sürece + hesap silme sonrası 30 gün (geri alma
              penceresi), sonra anonimleştirme veya silme</li>
            <li><strong>Fatura ve muhasebe verileri:</strong> Türk Ticaret Kanunu md. 82 uyarınca 10 yıl</li>
            <li><strong>AI ses ve metin verileri:</strong> İşlem sonrası 30 gün içinde otomatik silinir</li>
            <li><strong>Sohbet ve tutor kayıtları:</strong> İlerleme takibi için 12 ay, sonra anonimleştirilir</li>
            <li><strong>Analitik veriler:</strong> 26 ay (GA4 standart)</li>
            <li><strong>E-posta pazarlama verileri:</strong> Aboneliğinizi iptal edene kadar</li>
            <li><strong>Çerez verileri:</strong> Çerez türüne göre 1 gün ile 24 ay arası (bkz. bölüm 6)</li>
          </ul>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">5. Hesabınızı Silme</h2>
          <p>
            Hesabınızı istediğiniz zaman silebilirsiniz. İki yol vardır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Uygulama içinden:</strong> Ayarlar &gt; Güvenlik &gt; Hesabımı Sil — birkaç saniye içinde
              işleme alınır</li>
            <li><strong>E-posta ile:</strong>{' '}
              <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> adresine
              hesabınızı silme talebi gönderin — 7 gün içinde işleme alınır</li>
          </ul>
          <p>
            Hesabınız silindiğinde: kişisel bilgileriniz, ilerleme kayıtlarınız ve AI etkileşim verileriniz silinir.
            Yasal saklama zorunluluğu olan veriler (ör. fatura kayıtları) anonimleştirilerek saklanır. Silme işlemi
            geri alınamaz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">6. Çerezler ve Takip Teknolojileri</h2>
          <p>
            Web sitemiz ve platformumuz şu tür çerezleri kullanır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Zorunlu çerezler:</strong> Oturum yönetimi, güvenlik, sepet işlemleri (çıkış yapılamaz — hizmet
              için gerekli)</li>
            <li><strong>Analitik çerezler:</strong> Google Analytics — kullanım desenlerini anlamak için</li>
            <li><strong>Pazarlama çerezleri:</strong> Meta Pixel — reklam performansını ölçmek için (opsiyonel)</li>
            <li><strong>Tercih çerezleri:</strong> Dil, tema gibi kullanıcı tercihlerinizi hatırlamak için</li>
          </ul>
          <p>
            Analitik ve pazarlama çerezleri için ilk ziyaretinizde açık rıza istenir. Tarayıcı ayarlarınızdan çerezleri
            devre dışı bırakabilirsiniz. Mobil uygulamada, iOS 14+ kullanıyorsanız Apple&apos;ın App Tracking
            Transparency çerçevesi kapsamında pazarlama takibi için ek onay istenir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">7. Veri Güvenliği</h2>
          <p>
            Kişisel verilerinizi korumak için endüstri standartlarında güvenlik önlemleri uygulanır:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>TLS 1.3 şifreleme (iletim)</li>
            <li>Veritabanı seviyesinde hassas alanlar için hash+salt (parolalar) veya şifreleme</li>
            <li>Rol tabanlı erişim kontrolü ve iki faktörlü doğrulama (admin panel)</li>
            <li>Düzenli yedekleme ve felaket kurtarma planları</li>
            <li>Güvenlik duvarı, DDoS koruması (Cloudflare)</li>
            <li>Düzenli güvenlik güncellemeleri ve sızma testleri</li>
          </ul>
          <p>
            Buna rağmen internet üzerinden hiçbir veri iletim yönteminin %100 güvenli olmadığını hatırlatırız.
            Bir güvenlik ihlali durumunda ilgili mevzuat kapsamında sizi ve yetkili makamları bilgilendireceğiz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">8. Çocuklar ve 18 Yaş Altı Kullanıcılar</h2>
          <p>
            Sphere English hizmetleri 18 yaş ve üzeri profesyonellere yöneliktir. 13 yaşın altındaki çocuklardan bilinçli
            olarak kişisel veri toplamayız. 13-18 yaş arası kullanıcılar yasal velisinin onayıyla kayıt olabilir.
            13 yaşın altındaki bir çocuğun bize veri sağladığını fark ederseniz{' '}
            <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a> adresinden
            bize bildirin — verileri gecikmeksizin sileriz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">9. Haklarınız</h2>
          <p>KVKK md. 11 kapsamındaki haklarınız:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Verilerinizin işlenip işlenmediğini öğrenme ve erişim talep etme</li>
            <li>Verilerinizin düzeltilmesini isteme</li>
            <li>Verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>İşlenen verilerin taşınmasını isteme (veri taşınabilirliği)</li>
            <li>Otomatik işleme veya profillemeye itiraz etme</li>
            <li>Aktarımın yapıldığı üçüncü kişileri öğrenme</li>
            <li>Zarara uğramanız hâlinde tazminat talep etme</li>
          </ul>
          <p>
            Detaylar için <a className="text-[#0ea5e9]" href="/kvkk">KVKK Aydınlatma Metnimizi</a> inceleyiniz.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">10. Politika Değişiklikleri</h2>
          <p>
            Bu politika zaman zaman güncellenebilir. Önemli değişikliklerde tüm kayıtlı kullanıcılarımıza en az 30 gün
            önceden e-posta veya uygulama içi bildirimle haber veririz. En güncel sürüm her zaman bu sayfada yer alır;
            &quot;Son güncelleme&quot; tarihi geçerlidir.
          </p>

          <h2 className="text-[22px] font-bold text-[#1B365D] mt-10 mb-4">11. İletişim</h2>
          <p>
            Bu politika hakkında sorularınız veya haklarınızı kullanma taleplerinizi:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>E-posta: <a className="text-[#0ea5e9]" href="mailto:info@sphereenglish.com">info@sphereenglish.com</a></li>
            <li>WhatsApp: <a className="text-[#0ea5e9]" href="https://wa.me/905066085810" target="_blank" rel="noopener noreferrer">+90 506 608 58 10</a></li>
            <li>Posta: Sphere English, 150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir</li>
          </ul>
        </div>
      </article>
      <Footer />
    </main>
  );
}
