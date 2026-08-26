/**
 * Sphere English — Kurs Cohort Configuration
 *
 * Kontenjan/tarih/ön kayıt durumu için TEK KAYNAK.
 * Kurs sayfaları, homepage cards, navigation CTA hepsi buradan okur.
 *
 * DOKÜMAN §6, §60, §69:
 *   - Sahte scarcity oluşturma. Kontenjan gerçekten dolu değilse "dolu" gösterme.
 *   - Bilinmeyen tarih/detayı UYDURMA.
 */

export type CohortStatus =
  | 'open'          // Kayıt açık, kontenjan var
  | 'waitlist'      // Ön kayıt (mevcut grup dolu ama gelecek grup için sıra)
  | 'full'          // Tamamen kapalı
  | 'closed';       // Program şu an satılmıyor

export type ProgrammeSlug = 'a1-a2' | 'b1-b2';

export interface Cohort {
  cohortId: string;
  programmeSlug: ProgrammeSlug;
  /** Kesin tarih biliniyorsa ISO ('2026-09-01'), bilinmiyorsa null — display'de fallback kullanılır. */
  startDate: string | null;
  /** "Eylül 2026'nın ilk haftası" gibi human-readable — startDate null iken zorunlu. */
  startDateDisplay: string;
  status: CohortStatus;
  priceTry: number;
  priceDisplay: string;
  /** Kontenjan sayısı — sadece internal. Public sayfalarda gösterilmez (sahte scarcity risk). */
  capacity: number;
  /** Şu anki toplam kayıt (opsiyonel — track edilmiyorsa null bırak). */
  registrations?: number;
}

/**
 * Şu andaki durum — mevcut Ağustos 2026 grupları KAPANDI, Eylül 2026 için ön kayıt aktif.
 * Kesin başlangıç tarihi kesinleşince startDate'e ISO yaz.
 */
export const COHORTS: Cohort[] = [
  {
    cohortId: 'foundation-2026-09',
    programmeSlug: 'a1-a2',
    startDate: null,
    startDateDisplay: "Eylül 2026'nın ilk haftası",
    status: 'waitlist',
    priceTry: 4999,
    priceDisplay: '4.999 TL',
    capacity: 6,
  },
  {
    cohortId: 'diplomacy-2026-09',
    programmeSlug: 'b1-b2',
    startDate: null,
    startDateDisplay: "Eylül 2026'nın ilk haftası",
    status: 'waitlist',
    priceTry: 4999,
    priceDisplay: '4.999 TL',
    capacity: 6,
  },
];

/**
 * Global "şu an satışta hangi cohort var" durumu — nav CTA ve homepage bunu okur.
 */
export function currentCohortForProgramme(slug: ProgrammeSlug): Cohort | null {
  // İleride birden fazla ardışık cohort olduğunda "en yakın açık olanı" seç.
  return COHORTS.find((c) => c.programmeSlug === slug) ?? null;
}

/**
 * Genel durum — herhangi bir programda open/waitlist varsa true.
 * Nav CTA'yı belirlemek için: waitlist ise "Eylül Ön Kayıt", open ise "Kursları İncele".
 */
export function anyProgrammeOpen(): { anyOpen: boolean; anyWaitlist: boolean } {
  return {
    anyOpen: COHORTS.some((c) => c.status === 'open'),
    anyWaitlist: COHORTS.some((c) => c.status === 'waitlist'),
  };
}

/**
 * Nav CTA metni — cohort durumuna göre dinamik.
 * - Herhangi bir kohort açıksa: "Kursları İncele"
 * - Sadece waitlist varsa: "Eylül Ön Kayıt"
 * - Hiçbiri yoksa: "Kurumsal Teklif Al" (fallback)
 */
export function primaryCtaLabel(): { label: string; href: string } {
  const { anyOpen, anyWaitlist } = anyProgrammeOpen();
  if (anyOpen) {
    return { label: 'Kursları İncele', href: '/is-ingilizcesi-kursu' };
  }
  if (anyWaitlist) {
    return { label: 'Eylül Ön Kayıt', href: '/is-ingilizcesi-kursu' };
  }
  return { label: 'Kurumsal Teklif Al', href: '/iletisim' };
}

/**
 * Kontenjan durumu mesajı — kurs sayfaları için.
 * Sahte scarcity kullanma. Kontenjan dolu değilse "dolu" DEME.
 */
export function cohortStatusMessage(cohort: Cohort): string {
  switch (cohort.status) {
    case 'open':
      return `${cohort.startDateDisplay} grubu için kayıtlar açık.`;
    case 'waitlist':
      return `Mevcut gruplarımızın kontenjanı dolmuştur. ${cohort.startDateDisplay} başlayan grup için ön kayıt devam etmektedir.`;
    case 'full':
      return `Bu programın kontenjanı doldu. Bir sonraki grup için sıraya girin.`;
    case 'closed':
      return `Bu program şu anda kayıt kabul etmiyor.`;
  }
}
