import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Hesap Silme | Sphere English',
  description: 'Sphere English hesabınızı ve verilerinizi kalıcı olarak silme talebinde bulunun.',
  robots: { index: true, follow: true },
};

export default function HesapSilPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />

      <section className="max-w-3xl mx-auto px-6 lg:px-10 pt-24 pb-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            HESAP VE VERİ YÖNETİMİ
          </p>
          <h1 className="text-[36px] lg:text-[44px] font-extrabold tracking-[-0.02em] text-[#1B365D] leading-tight mb-4">
            Sphere English Hesabınızı Silme
          </h1>
          <p className="text-[16px] text-gray-600 leading-relaxed">
            KVKK ve Google Play politikaları gereği, hesabınızı ve verilerinizi kalıcı olarak silme
            hakkına sahipsiniz. Aşağıdaki adımlarla talebinizi iletebilirsiniz.
          </p>
        </div>

        {/* Uygulama içinden */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-6">
          <h2 className="text-[20px] font-bold text-[#1B365D] mb-3">
            Yöntem 1 — Uygulama İçinden (Önerilen)
          </h2>
          <ol className="text-[14px] text-slate-700 leading-relaxed space-y-2 list-decimal ml-5">
            <li>Sphere English mobil uygulaması veya <Link href="https://app.sphereenglish.com" className="text-[#0ea5e9] underline">web uygulamasında</Link> hesabınıza giriş yapın.</li>
            <li>Sağ üstteki profil menüsünden <strong>Ayarlar</strong> bölümüne gidin.</li>
            <li><strong>Hesap</strong> sekmesinde <strong>&ldquo;Hesabımı Sil&rdquo;</strong> butonuna tıklayın.</li>
            <li>Onay ekranında şifrenizi tekrar girip talebinizi onaylayın.</li>
            <li>Hesabınız ve verileriniz 30 gün içinde kalıcı olarak silinir.</li>
          </ol>
          <p className="text-[12px] text-slate-500 mt-4">
            30 günlük süre içinde tekrar giriş yaparsanız silme işlemi otomatik olarak iptal edilir.
          </p>
        </div>

        {/* E-posta yoluyla */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="text-[20px] font-bold text-[#1B365D] mb-3">
            Yöntem 2 — E-posta ile Talep
          </h2>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-4">
            Uygulamaya erişemiyorsanız veya işlemi manuel yapmayı tercih ediyorsanız aşağıdaki e-postayı
            kullanabilirsiniz.
          </p>
          <div className="rounded-lg bg-slate-50 p-4 text-[14px] font-mono text-slate-800 space-y-1">
            <div><strong>Alıcı:</strong> <a href="mailto:destek@sphereenglish.com?subject=Hesap%20Silme%20Talebi" className="text-[#0ea5e9] underline">destek@sphereenglish.com</a></div>
            <div><strong>Konu:</strong> Hesap Silme Talebi</div>
            <div><strong>Gövde:</strong> Hesabıma ait tüm verilerin KVKK m. 11 kapsamında silinmesini talep ediyorum. Kayıtlı e-posta: [e-postanız]</div>
          </div>
          <p className="text-[12px] text-slate-500 mt-4">
            Talebinizi aldıktan sonra kimliğinizi doğrulamak için sizinle iletişime geçeriz. Doğrulama
            sonrası 30 iş günü içinde silme işlemi tamamlanır.
          </p>
        </div>

        {/* Silinecek veriler */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
          <h2 className="text-[20px] font-bold text-[#1B365D] mb-3">
            Hangi Veriler Silinir?
          </h2>
          <ul className="text-[14px] text-slate-700 leading-relaxed space-y-2 list-disc ml-5">
            <li>Profil bilgileri (ad, e-posta, şifre hash&rsquo;i, profil fotoğrafı)</li>
            <li>Öğrenme geçmişi (kelime çalışmaları, quiz sonuçları, streak verileri)</li>
            <li>AI koç konuşma geçmişi</li>
            <li>Konuşma pratiği kayıtları ve değerlendirmeleri</li>
            <li>Bildirim tercihleri ve push token&rsquo;ları</li>
            <li>Uygulama içi etkileşim logları</li>
          </ul>
        </div>

        {/* Saklama gerekliliği */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 mb-6">
          <h2 className="text-[20px] font-bold text-[#1B365D] mb-3">
            Yasal Nedenlerle Saklanan Veriler
          </h2>
          <p className="text-[14px] text-slate-700 leading-relaxed mb-3">
            KVKK, Türk Ticaret Kanunu ve Vergi Usul Kanunu&rsquo;nun getirdiği yükümlülükler gereği aşağıdaki
            veriler yasal saklama süresi boyunca (genellikle <strong>10 yıl</strong>) silinemez:
          </p>
          <ul className="text-[14px] text-slate-700 leading-relaxed space-y-2 list-disc ml-5">
            <li>Ödeme kayıtları ve faturalar</li>
            <li>Vergisel belgeler</li>
            <li>Yasal talep üzerine paylaşılmış olan veriler</li>
          </ul>
          <p className="text-[12px] text-slate-500 mt-3">
            Bu veriler yalnızca yasal zorunluluk kapsamında saklanır ve pazarlama, analitik veya başka
            amaçlarla kullanılmaz.
          </p>
        </div>

        {/* İletişim */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white p-6">
          <h2 className="text-[20px] font-bold mb-3">Sorularınız mı Var?</h2>
          <p className="text-[14px] text-white/85 leading-relaxed mb-4">
            KVKK haklarınız hakkında detaylı bilgi için{' '}
            <Link href="/kvkk" className="text-[#7dd3fc] underline">Aydınlatma Metni</Link> ve{' '}
            <Link href="/gizlilik-politikasi" className="text-[#7dd3fc] underline">Gizlilik Politikamızı</Link> inceleyebilirsiniz.
          </p>
          <p className="text-[14px] text-white/85">
            <strong>Veri Sorumlusu:</strong> Sphere English<br/>
            <strong>E-posta:</strong> <a href="mailto:destek@sphereenglish.com" className="text-[#7dd3fc] underline">destek@sphereenglish.com</a>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
