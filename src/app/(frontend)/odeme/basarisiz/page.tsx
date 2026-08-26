import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ödeme Tamamlanamadı',
  robots: { index: false, follow: false },
};

interface ReasonMeta {
  title: string;
  description: string;
  tip?: string;
  /** Kart sorunuysa banka ile çağrı önerisi gösterelim */
  showBankAdvice?: boolean;
}

/**
 * Bizim ürettiğimiz iç hata kodları için detaylı mesajlar.
 * Bu kodlar callback/route.ts'te `reason=...` olarak set edilir.
 */
const REASON_MAP: Record<string, ReasonMeta> = {
  // Sistem ve oturum hataları
  token_eksik: {
    title: 'Ödeme oturumu bulunamadı',
    description: 'Ödeme sayfasından dönüş bilgisi alınamadı. Bu genellikle sayfanın yenilenmesinden veya geri tuşundan kaynaklanır.',
    tip: 'Lütfen ürün sayfasına dönüp ödemeyi yeniden başlatın.',
  },
  plan_bulunamadi: {
    title: 'Seçilen plan bulunamadı',
    description: 'Seçtiğiniz plan artık aktif değil veya kataloğumuzdan kaldırılmış olabilir.',
    tip: 'Güncel paketleri görmek için abonelik sayfasına dönün.',
  },
  sistem_hatasi: {
    title: 'Sistemde geçici bir aksaklık',
    description: 'Sunucumuzda beklenmeyen bir hata oluştu. Hesabınızdan tahsilat yapılmadı.',
    tip: 'Birkaç dakika sonra tekrar deneyin. Sorun devam ederse bizimle iletişime geçin.',
  },
  iyzico_baglanti_hatasi: {
    title: 'Ödeme sağlayıcıya ulaşılamadı',
    description: 'Iyzico altyapısıyla geçici bir iletişim sorunu yaşandı.',
    tip: 'Birkaç dakika sonra tekrar deneyin.',
  },
  conversation_id_uyumsuz: {
    title: 'Ödeme oturumu eşleşmedi',
    description: 'Ödeme yanıtı sistemimizdeki kayıtla eşleşmedi. Bu genellikle çok eski bir ödeme penceresinin yeniden kullanılmasından kaynaklanır.',
    tip: 'Lütfen yeni bir ödeme başlatın.',
  },

  // Kart / banka kaynaklı reddetmeler
  kart_reddedildi: {
    title: 'Kartınız reddedildi',
    description: 'Bankanız bu işlemi onaylamadı.',
    showBankAdvice: true,
  },
  '3ds_dogrulama_basarisiz': {
    title: '3D Secure doğrulaması başarısız',
    description: 'Bankanız kart doğrulama adımını tamamlayamadı. SMS / mobil uygulama bildirimini zamanında onayladığınızdan emin olun.',
    tip: 'Tekrar deneyin veya farklı bir kartla satın alın.',
  },
  '3ds_kart_sahibi_dogrulanamadi': {
    title: 'Kart sahibi doğrulanamadı',
    description: 'Bankanız 3D Secure ile kart sahibi kimliğinizi doğrulayamadı.',
    showBankAdvice: true,
  },
  '3ds_banka_sistem_hatasi': {
    title: 'Banka sistemi yanıt vermedi',
    description: 'Kartınızın bankasında geçici bir teknik sorun yaşandı.',
    tip: 'Birkaç dakika sonra tekrar deneyin.',
  },
  '3ds_kayitli_degil': {
    title: 'Kart 3D Secure için kayıtlı değil',
    description: 'Kullandığınız kart 3D Secure güvenlik altyapısına dahil değil. Yasal olarak 3D Secure zorunludur.',
    tip: 'Bankanızdan 3D Secure aktivasyonu isteyin veya internet alışverişine açık bir kartla deneyin.',
  },
  '3ds_genel_hata': {
    title: '3D Secure doğrulamasında hata',
    description: 'Doğrulama akışında genel bir hata oluştu.',
    tip: 'Tekrar deneyin veya farklı bir kart kullanın.',
  },
  '3ds_sistem_hatasi': {
    title: 'Doğrulama sisteminde geçici hata',
    description: '3D Secure altyapısında geçici bir teknik sorun yaşandı.',
    tip: 'Birkaç dakika sonra tekrar deneyin.',
  },
  '3ds_bilinmeyen_kart': {
    title: 'Kart tanınamadı',
    description: 'Bankanız bu kartı doğrulama sisteminde bulamadı.',
    tip: 'Kart numarasını doğru girdiğinizden emin olun veya farklı bir kart deneyin.',
  },
};

/**
 * Iyzico'dan dönen ham Türkçe / İngilizce mesajları yakalayıp anlamlı bir
 * gösterime çeviren pattern listesi. Iyzico bazen errorMessage'ı doğrudan
 * Türkçe gönderir; biz pattern eşleşince daha açıklayıcı bir öneriyle
 * birlikte göstereceğiz.
 */
const IYZICO_PATTERNS: { pattern: RegExp; meta: ReasonMeta }[] = [
  {
    pattern: /yetersiz\s*bakiye|insufficient\s*fund/i,
    meta: {
      title: 'Yetersiz bakiye',
      description: 'Kartınızda işlemi karşılayacak yeterli bakiye bulunmuyor.',
      tip: 'Hesabınızı kontrol edin veya farklı bir kart deneyin.',
    },
  },
  {
    pattern: /süresi\s*(geç|dol)|expired|expire/i,
    meta: {
      title: 'Kartın süresi geçmiş',
      description: 'Kullandığınız kartın son kullanma tarihi geçmiş.',
      tip: 'Bankanızdan güncel bir kart talep edin veya farklı bir kart deneyin.',
    },
  },
  {
    pattern: /geçersiz\s*kart|invalid\s*card|kart\s*numaras/i,
    meta: {
      title: 'Kart bilgileri geçersiz',
      description: 'Girilen kart bilgileri doğrulanamadı.',
      tip: 'Kart numarası, son kullanma tarihi ve CVV bilgilerini kontrol edin.',
    },
  },
  {
    pattern: /limit\s*aşıl|limit\s*exceed|kart\s*limit/i,
    meta: {
      title: 'Kart limiti aşıldı',
      description: 'Kartınızın anlık ya da aylık limiti bu işlem için yetersiz.',
      tip: 'Bankanızdan limit artırımı talep edin veya farklı bir kart deneyin.',
    },
  },
  {
    pattern: /3d\s*secure|3d-secure/i,
    meta: {
      title: '3D Secure doğrulaması başarısız',
      description: 'Bankanız kart doğrulamanızı tamamlayamadı.',
      tip: 'SMS / mobil uygulama bildirimini zamanında onayladığınızdan emin olun veya farklı kart kullanın.',
    },
  },
  {
    pattern: /technical|teknik\s*hata|sl\d+/i,
    meta: {
      title: 'Geçici bir teknik aksaklık',
      description: 'Ödeme sağlayıcısının altyapısında geçici bir sorun yaşandı.',
      tip: 'Birkaç dakika sonra tekrar deneyin. Sorun devam ederse bizimle iletişime geçin.',
    },
  },
  {
    pattern: /alınamadı|declined|reddedi|onaylanmadı/i,
    meta: {
      title: 'Bankanız bu işlemi onaylamadı',
      description: 'Kart bilgileriniz doğru ancak bankanız tahsilatı reddetti. Bu çoğunlukla kart limiti, internet alışverişi ayarları veya banka risk değerlendirmesinden kaynaklanır.',
      showBankAdvice: true,
    },
  },
];

function getReasonMeta(rawReason: string): ReasonMeta {
  if (!rawReason) {
    return {
      title: 'Ödeme tamamlanamadı',
      description: 'Ödeme akışı yarıda kaldı. Hesabınızdan herhangi bir tahsilat yapılmadı.',
      tip: 'Tekrar denemek ister misiniz?',
    };
  }

  if (REASON_MAP[rawReason]) return REASON_MAP[rawReason];

  // URL-encoded Iyzico Türkçe mesajı olabilir
  const decoded = (() => {
    try {
      return decodeURIComponent(rawReason);
    } catch {
      return rawReason;
    }
  })();

  for (const { pattern, meta } of IYZICO_PATTERNS) {
    if (pattern.test(decoded)) return meta;
  }

  // Hiçbiriyle eşleşmeyen → ham mesajı göster + jenerik tavsiye
  return {
    title: 'Ödeme tamamlanamadı',
    description: decoded.charAt(0).toUpperCase() + decoded.slice(1),
    tip: 'Tekrar deneyin veya bizimle iletişime geçin.',
  };
}

export default function OdemeBasarisizPage({
  searchParams,
}: {
  searchParams: { reason?: string; type?: string };
}) {
  const rawReason = searchParams.reason ?? '';
  const type = searchParams.type;
  const isEbook = type === 'ebook';

  const meta = getReasonMeta(rawReason);
  const retryHref = isEbook ? '/e-kitaplar' : '/abonelik';
  const retryLabel = isEbook ? 'E-kitaplara Dön' : 'Tekrar Dene';

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
          {meta.title}
        </h1>

        <p className="text-[15px] text-gray-700 mb-3 max-w-md mx-auto leading-relaxed">
          {meta.description}
        </p>

        {meta.tip && (
          <p className="text-[14px] text-gray-600 mb-2 max-w-md mx-auto">
            <span className="font-semibold text-[#1B365D]">Ne yapabilirsiniz: </span>
            {meta.tip}
          </p>
        )}

        {meta.showBankAdvice && (
          <div className="my-6 mx-auto max-w-md p-4 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900 text-left">
            <p className="font-semibold mb-1">Kart kaynaklı reddetmeler için kontrol listesi:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Kart bakiyeniz ve limitiniz işlem tutarı için yeterli mi?</li>
              <li>Mobil bankacılıkta <strong>internet alışverişi yetkisi</strong> açık mı?</li>
              <li>Kart 3D Secure'a kayıtlı mı? (banka müşteri hizmetlerinden öğrenebilirsiniz)</li>
              <li>Farklı bir kart denediniz mi?</li>
            </ul>
          </div>
        )}

        <p className="text-[13px] text-emerald-700 font-semibold mb-8 max-w-md mx-auto mt-4">
          ✓ Hesabınızdan herhangi bir tahsilat yapılmadı.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={retryHref}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-bold text-[14px] text-white bg-[#0ea5e9] hover:bg-[#0284c7] transition-colors"
          >
            {retryLabel}
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

        {rawReason && (
          <p className="mt-6 text-[11px] text-gray-400 font-mono">
            Hata referansı: {rawReason.length > 60 ? rawReason.slice(0, 60) + '…' : rawReason}
          </p>
        )}
      </section>
      <Footer />
    </main>
  );
}
