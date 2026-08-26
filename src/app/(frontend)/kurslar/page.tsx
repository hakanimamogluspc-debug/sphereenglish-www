import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BuyCourseButton from './BuyCourseButton';
import {
  Users, Clock, MessageSquare, FileText, Video, Building2,
  ArrowRight, CheckCircle2, Calendar, Shield,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kurumsal İngilizce Grup Programları',
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
 * /kurslar — Grup programı satış sayfası.
 * HAZIRLIK: noindex + robots.txt Disallow + nav'da link yok.
 * Public'e alınırken bu 3 madde kaldırılacak.
 */

type Programme = {
  slug: string;
  levelBadge: string;
  levelCefr: string;
  levelAudience: string;
  titleEn: string;
  titleTr: string;
  tagline: string;
  weeks: Array<{ n: number; title: string; desc: string }>;
  price: string;
};

const PROGRAMMES: Programme[] = [
  {
    slug: 'foundation',
    levelBadge: 'Seviye 1',
    levelCefr: 'A1 – A2',
    levelAudience: 'Yeni başlayanlar için',
    titleEn: 'Business English Foundation',
    titleTr: 'İş İngilizcesine Sıfırdan Başla',
    tagline: 'İş hayatında İngilizce iletişim kurmaya yeni başlayan profesyoneller için.',
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
    levelBadge: 'Seviye 2',
    levelCefr: 'B1 – B2',
    levelAudience: 'Orta seviye ve üstü',
    titleEn: 'Corporate Diplomacy & Crisis Management',
    titleTr: 'Toplantıyı Sen Yönet',
    tagline: 'Toplantılarda söz almak, kriz yönetmek, diplomatik iletişim kurmak ve etki yaratmak için.',
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
  { icon: Users,        title: 'Max 6 kişi',         desc: 'Küçük grup, herkese söz hakkı ve pratik fırsatı.' },
  { icon: Calendar,     title: 'Haftada 1 ders',     desc: '60 dakika, iş tempoya uygun sürdürülebilir plan.' },
  { icon: MessageSquare,title: 'Konuşma odaklı',     desc: 'Gerçek iş senaryoları — plaza jargonu değil.' },
  { icon: FileText,     title: 'Case study PDF',     desc: 'Her ders sonu materyaller elinizde kalır.' },
  { icon: Video,        title: '%100 canlı',         desc: 'Kayıt değil — gerçek eğitmenle etkileşimli.' },
  { icon: Building2,    title: 'Türk iş dünyası',    desc: 'Sektörel gerçek durumlar ve Türk profesyonellere özel.' },
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
    a: 'Ödeme sonrası kayıt formunda seviye tespiti yapılır. Emin değilseniz WhatsApp\'tan da bize danışabilirsiniz.',
  },
  {
    q: 'Materyaller ders sonrası nasıl paylaşılır?',
    a: 'Her ders sonu case study PDF ve destekleyici materyaller e-postanıza iletilir. Program bitiminde tüm materyalleriniz elinizde kalır.',
  },
  {
    q: 'Ödeme güvenli mi?',
    a: 'Ödeme Iyzico ile 3D Secure altyapısı üzerinden alınır. Kart bilgileriniz Sphere English tarafından hiçbir zaman görülmez veya saklanmaz.',
  },
];

export default function KurslarPage() {
  return (
    <main className="bg-white min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#f0f7ff] to-white pt-20 pb-14">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-4">
            KURUMSAL GRUP PROGRAMLARI
          </p>
          <h1 className="text-[40px] lg:text-[54px] font-extrabold tracking-[-0.025em] text-[#1B365D] leading-[1.05] mb-5">
            4 Haftada İletişiminizi
            <br />
            Bir Üst Seviyeye Taşıyın
          </h1>
          <p className="text-[17px] text-gray-600 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-[#1B365D]">Türk profesyoneller</strong> için tasarlanmış canlı grup programları.
            İki farklı seviye — başlangıç için sağlam temel, ileri düzey için diplomasi ustalığı.
          </p>

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
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {PROGRAMMES.map((p) => (
            <article
              key={p.slug}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-200 hover:shadow-xl hover:border-[#0ea5e9]/40 transition-all duration-300"
            >
              {/* Header bar — belirgin seviye rozeti */}
              <div className="relative border-b border-gray-100 px-7 pt-6 pb-5">
                <div className="absolute top-6 left-0 w-1 h-12 bg-[#0ea5e9]" />
                <div className="pl-4">
                  {/* Belirgin seviye rozetleri — 2 pill yan yana */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1B365D] text-white text-[11px] font-bold uppercase tracking-[0.14em]">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                      {p.levelBadge}
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-[13px] font-extrabold tracking-wide">
                      {p.levelCefr}
                    </span>
                    <span className="text-[12px] font-semibold text-gray-500">
                      {p.levelAudience}
                    </span>
                  </div>
                  <h2 className="text-[26px] lg:text-[30px] font-extrabold text-[#1B365D] leading-[1.15] tracking-tight">
                    {p.titleTr}
                  </h2>
                  <p className="text-[12px] text-gray-400 italic mt-1.5">{p.titleEn}</p>
                </div>
              </div>

              <div className="px-7 py-6 flex-1 flex flex-col">
                <p className="text-[14px] text-gray-600 leading-relaxed mb-6">{p.tagline}</p>

                {/* Haftalık program — ince çizgili timeline */}
                <div className="space-y-4 mb-6">
                  {p.weeks.map((w) => (
                    <div key={w.n} className="flex gap-4 group/week">
                      <div className="flex-shrink-0 flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border border-[#1B365D]/20 bg-white text-[#1B365D] flex items-center justify-center font-bold text-[13px]">
                          {w.n}
                        </div>
                        {w.n < p.weeks.length && <div className="w-px flex-1 bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 mb-0.5">
                          {w.n}. HAFTA
                        </div>
                        <div className="text-[14px] font-bold text-[#1B365D] leading-snug">{w.title}</div>
                        <div className="text-[12px] text-gray-500 leading-relaxed mt-1">{w.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fiyat + CTA */}
                <div className="mt-auto pt-5 border-t border-gray-100">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                        4 HAFTALIK PROGRAM
                      </div>
                      <div className="text-[28px] font-extrabold text-[#1B365D] leading-none mt-1">
                        {p.price}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        Iyzico 3D Secure
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Taksit imkanı
                      </div>
                    </div>
                  </div>
                  <BuyCourseButton
                    programmeSlug={p.slug}
                    programmeTitle={p.titleTr}
                    price={p.price}
                    variant="primary"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Ortak özellikler — beyaz zemin, kurumsal ikonlar */}
      <section className="border-t border-gray-100 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
              HER İKİ PROGRAMDA
            </p>
            <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
              Neden Sphere English?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SHARED_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-xl border border-gray-200 p-6 hover:border-[#0ea5e9]/40 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-lg bg-[#1B365D]/5 border border-[#1B365D]/10 flex items-center justify-center text-[#1B365D] group-hover:bg-[#0ea5e9]/10 group-hover:text-[#0ea5e9] group-hover:border-[#0ea5e9]/30 transition-all mb-4">
                    <Icon strokeWidth={1.6} className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-[#1B365D] text-[15px] mb-1.5">{f.title}</div>
                  <div className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nasıl işler — 3 adım */}
      <section className="bg-gradient-to-b from-white to-[#f0f7ff] py-16 lg:py-20 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
              NASIL İŞLER
            </p>
            <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
              3 Adımda Sınıfta
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Programı seç, ödemeyi tamamla',
                desc: 'Iyzico 3D Secure ile güvenli ödeme. Kart bilgin bize gelmez.',
              },
              {
                n: '02',
                title: 'Kayıt formunu doldur',
                desc: 'Kısa bir form — sektör, seviye, iletişim tercihleri. 2 dakika sürer.',
              },
              {
                n: '03',
                title: '24 saat içinde bağlantı',
                desc: 'Ekibimiz seninle iletişime geçer, grup atamanı yapar, ders takvimini iletir.',
              },
            ].map((step) => (
              <div key={step.n} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="text-[42px] font-extrabold text-[#0ea5e9]/25 leading-none tracking-tight mb-3">
                  {step.n}
                </div>
                <div className="font-bold text-[#1B365D] text-[16px] leading-snug mb-2">
                  {step.title}
                </div>
                <div className="text-[13px] text-gray-500 leading-relaxed">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#0ea5e9] uppercase mb-3">
            SIK SORULAN SORULAR
          </p>
          <h2 className="text-[28px] lg:text-[36px] font-extrabold text-[#1B365D] tracking-tight">
            Bilmen Gereken Her Şey
          </h2>
        </div>
        <div className="space-y-2.5">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#0ea5e9]/40 transition-colors">
              <summary className="cursor-pointer px-5 py-4 font-semibold text-[#1B365D] text-[15px] hover:bg-gray-50 flex items-center gap-3 list-none">
                <span className="flex-1">{item.q}</span>
                <span className="text-[#0ea5e9] group-open:rotate-45 transition-transform text-xl leading-none font-light">+</span>
              </summary>
              <div className="px-5 pb-4 pt-1 text-[14px] text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Alt CTA — koyu navy, marka rengiyle */}
      <section className="bg-gradient-to-br from-[#0B1F3A] to-[#1B365D] text-white py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#7dd3fc] uppercase mb-4">
            KONTENJANLAR SINIRLIDIR
          </p>
          <h2 className="text-[32px] lg:text-[42px] font-extrabold leading-tight mb-4 tracking-tight">
            Yerini Ayır — Eylül'de
            <br />
            Sınıfta Buluşalım
          </h2>
          <p className="text-[16px] text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
            Her programda yalnızca <strong className="text-white">6 kişilik</strong> yer var.
            Sana en uygun grubu oluşturabilmemiz için erken kayıt önemli.
          </p>

          {/* Trust satırı */}
          <div className="flex flex-wrap items-center justify-center gap-5 mb-8 text-[13px] text-white/70">
            <span className="inline-flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />
              Iyzico 3D Secure
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />
              Taksit imkanı
            </span>
            <span className="inline-flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[#7dd3fc]" strokeWidth={1.6} />
              24 saat içinde iletişim
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
            <a href="#programlar" className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold text-[15px] transition-colors">
              Programı Seç ve Kayıt Ol
            </a>
            <a
              href="https://wa.me/905306542483?text=Sphere%20English%20kurumsal%20grup%20program%C4%B1%20i%C3%A7in%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/30 hover:border-white/70 hover:bg-white/5 text-white font-bold text-[15px] transition-colors"
            >
              WhatsApp ile Danış
            </a>
          </div>

          <p className="text-[12px] text-white/50 mt-8">
            info@sphereenglish.com · +90 530 654 24 83
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
