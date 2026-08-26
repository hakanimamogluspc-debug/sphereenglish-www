/**
 * Sphere English — Kurs Katalog (Frontend)
 *
 * Kurs sayfaları, homepage kart bölümü, blog cross-sell — hepsi buradan okur.
 * Backend'de artifacts/api-server/src/lib/courses-catalog.ts karşılığı var
 * (Iyzico checkout için); slug'lar ORAYLA EŞLEŞMELİDİR.
 */

export type LevelSlug = 'a1-a2' | 'b1-b2';

export interface WeekModule {
  n: number;
  title: string;
  desc: string;
}

export interface Programme {
  /** Iyzico ödeme flow'unda kullanılan slug (backend catalog ile eşleşir). */
  paymentSlug: 'foundation' | 'diplomacy';
  /** URL slug: /is-ingilizcesi-kursu/[levelSlug] */
  levelSlug: LevelSlug;
  /** Nav pill: "Seviye 1" / "Seviye 2" */
  levelBadge: string;
  /** CEFR aralığı: "A1 – A2" */
  levelCefr: string;
  /** "Yeni başlayanlar için" */
  levelAudience: string;
  /** TR başlık — H1 için */
  titleTr: string;
  /** EN alt başlık */
  titleEn: string;
  /** Kısa tagline */
  tagline: string;
  /** Uzun açıklama — detay sayfası hero */
  description: string;
  /** Kime uygun listesi */
  audience: string[];
  weeks: WeekModule[];
  /** İlgili e-kitap slug'ları — cross-sell için */
  relatedEbookSlugs: string[];
  price: string;
  priceKurus: number;
  durationLabel: string;
}

export const PROGRAMMES: Programme[] = [
  {
    paymentSlug: 'foundation',
    levelSlug: 'a1-a2',
    levelBadge: 'Seviye 1',
    levelCefr: 'A1 – A2',
    levelAudience: 'Yeni başlayanlar için',
    titleTr: 'İş İngilizcesine Sıfırdan Başla',
    titleEn: 'Business English Foundation',
    tagline:
      'İş hayatında İngilizce iletişim kurmaya yeni başlayan profesyoneller için.',
    description:
      'A1–A2 seviyesindeki profesyoneller için 4 haftalık, canlı grup programı. Sıfırdan başlayarak günlük iş İngilizcesinde ihtiyaç duyduğunuz kalıpları, tanışmaları, e-postaları, telefon görüşmelerini ve toplantı planlamasını gerçek iş senaryoları üzerinden öğrenirsiniz.',
    audience: [
      'İş hayatında İngilizceyi ilk kez düzenli kullanacaklar',
      'Basit e-posta ve tanışma cümlelerinde takılanlar',
      'İngilizce toplantı davetlerine cevap vermekte zorlananlar',
      'Yurt dışı meslektaşlarla telefonda temel iletişim kuramayanlar',
    ],
    weeks: [
      { n: 1, title: 'Kurumsal Kimlik ve İlk Tanışmalar', desc: 'Tanıtım, iletişim bilgileri ve tanışma e-postaları.' },
      { n: 2, title: 'Günlük İş Akışı ve Talepler', desc: 'Bilgi istemek, yardım talep etmek ve nazik iletişim kurmak.' },
      { n: 3, title: 'Toplantı Planlama ve Zaman Yönetimi', desc: 'Toplantı saatlerini planlamak, uygunluk bildirmek ve takvim yanıtları.' },
      { n: 4, title: 'Telefon Görüşmeleri ve Mesaj Yönetimi', desc: 'Telefonu açmak, mesaj almak ve notları iletmek.' },
    ],
    relatedEbookSlugs: ['kurumsal-iletisim-toplantilar'],
    price: '4.999 TL',
    priceKurus: 499900,
    durationLabel: '4 Hafta · 60 dk · Haftada 1 canlı ders',
  },
  {
    paymentSlug: 'diplomacy',
    levelSlug: 'b1-b2',
    levelBadge: 'Seviye 2',
    levelCefr: 'B1 – B2',
    levelAudience: 'Orta seviye ve üstü',
    titleTr: 'Toplantıyı Sen Yönet',
    titleEn: 'Corporate Diplomacy & Crisis Management',
    tagline:
      'Toplantılarda söz almak, kriz yönetmek, diplomatik iletişim kurmak ve etki yaratmak için.',
    description:
      'B1–B2 seviyesindeki orta ve üst düzey profesyoneller için 4 haftalık, canlı grup programı. Toplantı yönetiminden zorlu mülakatlara, kriz e-postalarından ikna konuşmalarına kadar profesyonel etki alanınızı genişletecek stratejik iletişim becerilerini gerçek iş senaryoları üzerinden geliştirin.',
    audience: [
      'Uluslararası toplantılarda söz alıp yön vermek isteyenler',
      'Diplomatik "hayır" demeyi öğrenmek isteyen yöneticiler',
      'Kriz anlarında etkili iletişim kurması gereken profesyoneller',
      'Zorlu mülakatlarda STAR yöntemiyle güçlü cevaplar vermek isteyenler',
      'Yurt dışı paydaşlarla ikna konuşmaları yapan satış, satınalma, yönetim ekipleri',
    ],
    weeks: [
      { n: 1, title: 'Profesyonel İmaj ve Zorlu Mülakatlar', desc: 'STAR yöntemi, zorlu sorulara stratejik ve etkili yanıtlar.' },
      { n: 2, title: 'Toplantı Yönetimi ve Kararlı İletişim', desc: 'Söz almak, profesyonel şekilde söz kesmek, karşıt görüşleri yönetmek ve toplantıya yön vermek.' },
      { n: 3, title: 'Kriz E-postaları ve Diplomatik İletişim', desc: 'Kötü haber verme, diplomatik "hayır" deme ve kriz anlarında iletişim.' },
      { n: 4, title: 'İkna Teknikleri ve Paydaş Yönetimi', desc: 'Fikir satma, ikna konuşmaları ve paydaşları etkileme.' },
    ],
    relatedEbookSlugs: [
      'kurumsal-iletisim-toplantilar',
      'liderlik-insan-kaynaklari-kuresel-operasyonlar',
      'kurumsal-strateji-finansal-analiz-risk-yonetimi',
      'pazarlama-satis-musteri-iliskileri',
    ],
    price: '4.999 TL',
    priceKurus: 499900,
    durationLabel: '4 Hafta · 60 dk · Haftada 1 canlı ders',
  },
];

export function findProgrammeByLevelSlug(slug: string): Programme | null {
  return PROGRAMMES.find((p) => p.levelSlug === slug) ?? null;
}
