/**
 * Sphere English — Merkezi Business Configuration
 *
 * TEK SOURCE OF TRUTH. Site genelindeki tekrar eden business verilerini burada topluyoruz.
 * Yeni sayfa/component eklerken doğrudan buradan import edin; hardcode ETMEYİN.
 *
 * Değişiklik gerektiğinde tek bir yerde güncellenmeli:
 *   - fiyat / metric / kontenjan / adres güncellemesi
 *   - Oxford wording standardı
 *   - kurs cohort tarihleri
 *   - iletişim bilgileri
 */

export const BRAND = {
  name: 'Sphere English',
  legalName: 'Sphere English',
  baseUrl: 'https://www.sphereenglish.com',
  tagline: 'Türk profesyoneller için İş İngilizcesi eğitimi, dijital kaynaklar ve AI destekli pratik.',
} as const;

export const CONTACT = {
  email: 'info@sphereenglish.com',
  /** Tek numara — hem WhatsApp hem arama. */
  phone: '+90 506 608 58 10',
  phoneDisplay: '+90 506 608 58 10',
  whatsappE164: '905066085810',
  whatsappUrl: 'https://wa.me/905066085810',
  address: {
    street: '150 Evler Mah. Atatürk Blv. No:456/35',
    postalCode: '10400',
    district: 'Ayvalık',
    city: 'Balıkesir',
    country: 'Türkiye',
    countryCode: 'TR',
    /** Tek satır adres — footer/iletişim için. */
    display: '150 Evler Mah. Atatürk Blv. No:456/35, 10400 Ayvalık / Balıkesir',
    geo: { lat: 39.3173, lng: 26.6939 },
  },
  socials: {
    linkedin: 'https://www.linkedin.com/company/sphere-english/',
    instagram: 'https://www.instagram.com/sphereenglish',
  },
} as const;

/**
 * Oxford ilişkisi — HUKUKİ KURAL:
 * Oxford University Press müfredat ve kaynaklarını KULLANIYORUZ (materyal kullanıcısı).
 * "Sertifikalı", "iş birliği", "resmi partner" gibi ifadeler KULLANMAYIN — hukuki olarak yanlış.
 */
export const OXFORD = {
  short: 'Oxford University Press müfredat ve kaynakları',
  long: 'Eğitim programlarımızda Oxford University Press müfredat ve kaynaklarını kullanıyoruz.',
  metaShort: 'Oxford University Press müfredatı',
} as const;

/**
 * Grup dersleri — kesin kural: MAKSİMUM 6 KİŞİ.
 * "5 kişi" yazan tüm eski metinler 6'ya çevrilmeli.
 */
export const GROUP_SIZE = {
  max: 6,
  label: 'Maks. 6 kişilik butik gruplar',
  short: 'Maks 6 kişi',
} as const;

/**
 * Onaylı business metrikleri — kanıtlanabilir olmalı.
 * Yeni metrik eklerken kaynağını yorum satırında belirt.
 */
export const METRICS = {
  employeesTrained: '500+',
  corporateClients: '50+',
  satisfactionPct: '%94',
  participationPct: '%87',
  cefrGain: '+2 seviye',
  ebookDownloadsDisplay: '500+ profesyonel',
} as const;

/**
 * Ürün fiyatları — canlı fiyat farklılığı olabilir.
 * DB'de dinamik fiyat varsa oradan çek, bunlar sadece landing page/marketing fallback.
 */
export const PRICING = {
  ebook: {
    singleTry: 199,
    bundleFiveTry: 799,
    singleDisplay: '199 TL',
    bundleDisplay: '799 TL',
    singleCompareAt: 299,
    bundleCompareAt: 995,
  },
  course: {
    programTry: 4999,
    programDisplay: '4.999 TL',
  },
} as const;

/**
 * E-Kitap serisi — "1000 Kelime" serisi = 5 tematik kitap.
 * "10 tematik kitap" ifadesi HATALIDIR. 5 × 200 (50 kalıp + 150 terim) = 1000 kelime/kalıp.
 */
export const EBOOK_SERIES = {
  name: 'İş İngilizcesinde Kullanılan 1000 Kelime',
  bookCount: 5,
  patternsPerBook: 50,
  termsPerBook: 150,
  itemsPerBook: 200, // 50 kalıp + 150 terim
  totalItems: 1000,  // 5 × 200
  description: '1000 İngilizce kelime ve kalıbı 5 tematik kitapta bir araya getirdik.',
} as const;
