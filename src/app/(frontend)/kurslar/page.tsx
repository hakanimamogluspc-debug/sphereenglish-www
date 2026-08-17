import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Kurumsal İngilizce Grup Programları | Sphere English',
  description:
    '4 haftada iş İngilizcesi becerileri. A1-A2 için Foundation, B1-B2 için Corporate Diplomacy programları.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export const dynamic = 'force-dynamic';

/**
 * /kurslar — Grup programı satış/ön kayıt sayfası.
 *
 * NOT: Şu an "hazırlık" aşamasında.
 * - Header/Footer navigasyonuna eklenmedi (kimse kazara bulmasın)
 * - noindex, nofollow (Google indexlemez)
 * - /robots.txt Disallow: /kurslar
 * - Public'e açılınca yukarıdaki 3 madde geri alınacak
 */

type Programme = {
  slug: string;
  levelBadge: string;
  levelLabel: string;
  titleEn: string;
  titleTr: string;
  tagline: string;
  colorClass: string;
  accent: string;
  weeks: Array<{ n: number; title: string; desc: string }>;
  price: string;
};

const PROGRAMMES: Programme[] = [
  {
    slug: 'foundation',
    levelBadge: 'SEVİYE 1',
    levelLabel: 'A1 – A2 · Yeni başlayanlar',
    titleEn: 'Business English Foundation',
    titleTr: 'İş İngilizcesine Sıfırdan Başla',
    tagline: 'İş hayatında İngilizce iletişim kurmaya yeni başlayan profesyoneller için.',
    colorClass: 'border-teal-200 bg-teal-50/40',
    accent: 'text-teal-700',
    weeks: [
      { n: 1, title: 'Kurumsal Kimlik ve İlk Tanışmalar', desc: 'Tanıtım, iletişim bilgileri ve tanışma e-postaları.' },
      { n: 2, title: 'Günlük İş Akışı ve Talepler', desc: 'Bilgi istemek, yardım talep etmek ve nazik iletişim kurmak.' },
      { n: 3, title: 'Toplantı Planlama ve Zaman Yönetimi', desc: 'Toplantı saatlerini planlamak, uygunluk bildirmek ve takvim yanıtları.' },
      { n: 4, title: 'Telefon Görüşmeleri ve Mesaj Yönetimi', desc: 'Telefonu açmak, mesaj almak ve notları iletmek.' },
    ],
    price: '4.999 TL',
  },
  {
    slug: 'diplomacy',
    levelBadge: 'SEVİYE 2',
    levelLabel: 'B1 – B2 · Orta seviye ve üstü',
    titleEn: 'Corporate Diplomacy & Crisis Management',
    titleTr: 'Toplantıyı Sen Yönet',
    tagline: 'Toplantılarda söz almak, kriz yönetmek, diplomatik iletişim kurmak ve etki yaratmak için.',
    colorClass: 'border-[#1B365D]/20 bg-[#1B365D]/5',
    accent: 'text-[#1B365D]',
    weeks: [
      { n: 1, title: 'Profesyonel İmaj ve Zorlu Mülakatlar', desc: 'STAR yöntemi, zorlu sorulara stratejik ve etkili yanıtlar.' },
      { n: 2, title: 'Toplantı Yönetimi ve Kararlı İletişim', desc: 'Söz kesme, karşıt görüşleri yönetme ve toplantıya yön verme.' },
      { n: 3, title: 'Kriz E-postaları ve Diplomatik İletişim', desc: 'Kötü haber verme, diplomatik "hayır" deme ve kriz anlarında iletişim.' },
      { n: 4, title: 'İkna Teknikleri ve Paydaş Yönetimi', desc: 'Fikir satma, ikna konuşmaları ve paydaşları etkileme.' },
    ],
    price: '4.999 TL',
  },
];

const SHARED_FEATURES = [
  { icon: '👥', title: 'Max 6 kişi', desc: 'Küçük grup, herkese söz hakkı' },
  { icon: '📅', title: 'Haftada 1 ders', desc: '60 dakika, tempoya uygun' },
  { icon: '💬', title: 'Konuşma odaklı', desc: 'Gerçek iş senaryoları' },
  { icon: '📄', title: 'Case study PDF', desc: 'Her ders sonu paylaşılır' },
  { icon: '🎥', title: '%100 canlı', desc: 'Kayıt değil, gerçek zamanlı' },
  { icon: '🏢', title: 'Türk iş dünyası', desc: 'Kültüre özel örnekler' },
];

const FAQ = [
  {
    q: 'Program ne zaman başlıyor?',
    a: 'Eylül 2026\'da ilk gruplar açılıyor. Kesin tarih ön kayıt sonrası size iletilir.',
  },
  {
    q: 'Dersler nasıl işleniyor?',
    a: '4 hafta boyunca haftada 1 kez, 60 dakikalık canlı Zoom oturumları. Kayıt değil, gerçek zamanlı eğitmenle etkileşimli.',
  },
  {
    q: 'Grup büyüklüğü kaç kişi?',
    a: 'Maksimum 6 kişilik gruplar. Her katılımcının söz alması ve pratik yapması için tasarlandı.',
  },
  {
    q: 'Hangi seviyeye uygunum, nasıl karar veririm?',
    a: 'Ücretsiz seviye tespit sınavımızı çözüp doğru programa yönlendirilirsiniz. Kayıt sonrası size test linki gönderilir.',
  },
  {
    q: 'Materyaller ders sonrası nasıl paylaşılır?',
    a: 'Her ders sonu case study PDF ve destekleyici materyaller e-postanıza iletilir. Program bitiminde tüm materyalleriniz elinizde kalır.',
  },
  {
    q: 'Ödeme nasıl yapılır?',
    a: 'Ön kayıt sırasında ödeme talep edilmez. Grubunuz oluştuğunda size güvenli ödeme linki gönderilir. Iyzico ile 3D Secure kredi kartı desteklenir.',
  },
];

export default function KurslarPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] via-white to-white pt-20 pb-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            KURUMSAL İNGİLİZCE GRUP PROGRAMLARI
          </p>
          <h1 className="text-[40px] lg:text-[54px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-5">
            4 Haftada İletişiminizi
            <br />
            Bir Üst Seviyeye Taşıyın
          </h1>
          <p className="text-[17px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Türk profesyoneller için tasarlanmış canlı grup programları.
            İki farklı seviye — başlangıç için sağlam temel, ileri düzey için diplomasi ustalığı.
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 text-[12px] text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Eylül 2026'da başlıyor
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Max 6 kişilik gruplar
            </span>
            <span className="text-gray-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              %100 canlı ders
            </span>
          </div>
        </div>
      </section>

      {/* İki program kartı */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PROGRAMMES.map((p) => (
            <article
              key={p.slug}
              className={`rounded-3xl border-2 ${p.colorClass} p-8 flex flex-col`}
            >
              {/* Level rozet */}
              <div className={`inline-flex items-center self-start gap-2 px-3 py-1.5 rounded-full bg-white ${p.accent} text-[11px] font-bold uppercase tracking-widest border ${p.slug === 'foundation' ? 'border-teal-200' : 'border-[#1B365D]/20'}`}>
                {p.levelBadge}
              </div>

              <p className="text-[11px] text-gray-500 mt-3 mb-4">{p.levelLabel}</p>

              {/* Başlıklar */}
              <h2 className="text-[24px] lg:text-[28px] font-extrabold text-[#1B365D] leading-tight mb-1">
                {p.titleTr}
              </h2>
              <p className="text-[13px] italic text-gray-500 mb-4">{p.titleEn}</p>
              <p className="text-[15px] text-gray-700 leading-relaxed mb-6">{p.tagline}</p>

              {/* Haftalık program */}
              <div className="space-y-3 mb-6">
                {p.weeks.map((w) => (
                  <div key={w.n} className="flex gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-white ${p.accent} flex items-center justify-center font-bold text-sm border ${p.slug === 'foundation' ? 'border-teal-200' : 'border-[#1B365D]/20'}`}>
                      {w.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                        {w.n}. HAFTA
                      </div>
                      <div className="text-[14px] font-semibold text-[#1B365D] leading-snug">{w.title}</div>
                      <div className="text-[12px] text-gray-500 leading-relaxed mt-0.5">{w.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiyat + CTA */}
              <div className="mt-auto pt-4 border-t border-gray-200/60">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      4 HAFTALIK PROGRAM
                    </div>
                    <div className="text-[28px] font-extrabold text-[#1B365D] leading-none mt-1">
                      {p.price}
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 text-right leading-tight">
                    Ön kayıtta<br />ödeme yok
                  </div>
                </div>
                <Link
                  href={`#kayit?prog=${p.slug}`}
                  className={`block w-full text-center py-3.5 rounded-xl font-bold text-white ${p.slug === 'foundation' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#1B365D] hover:bg-[#0F2547]'} transition-colors`}
                >
                  Ön Kayıt Ol
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Ortak özellikler */}
      <section className="bg-[#FAF7F2] py-16">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
              HER İKİ PROGRAMDA
            </p>
            <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
              Neden Sphere English?
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {SHARED_FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-5 border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-bold text-[#1B365D] text-[15px] mb-1">{f.title}</div>
                <div className="text-[12px] text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-16">
        <div className="text-center mb-10">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            SIK SORULAN SORULAR
          </p>
          <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
            Bilmen Gereken Her Şey
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-gray-200 bg-white overflow-hidden">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-[#1B365D] text-[15px] hover:bg-gray-50 flex items-center gap-3">
                <span className="flex-1">{item.q}</span>
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <div className="px-5 pb-4 text-[14px] text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Kayıt CTA */}
      <section id="kayit" className="bg-gradient-to-br from-[#0F1F3D] to-[#1B365D] text-white py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#7dd3fc] uppercase mb-4">
            KONTENJANLAR SINIRLIDIR
          </p>
          <h2 className="text-[32px] lg:text-[42px] font-extrabold leading-tight mb-4">
            Yerini Ayır — Eylül'de<br />Sınıfta Buluşalım
          </h2>
          <p className="text-[16px] text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
            Ön kayıt sırasında ödeme talep edilmez. Grubunuz oluştuğunda size güvenli
            ödeme linki e-posta ile iletilir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/905306542483?text=Sphere%20English%20kurumsal%20grup%20program%C4%B1%20i%C3%A7in%20%C3%B6n%20kay%C4%B1t%20yapt%C4%B1rmak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[16px] transition-colors shadow-lg"
            >
              💬 WhatsApp ile Ön Kayıt
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 hover:border-white text-white font-bold text-[16px] transition-colors"
            >
              İletişim Formu
            </Link>
          </div>
          <p className="text-[13px] text-white/60 mt-8">
            info@sphereenglish.com · +90 530 654 24 83
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
