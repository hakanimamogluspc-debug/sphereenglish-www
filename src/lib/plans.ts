/**
 * Sphere English plan kataloğu — pazarlama sitesi.
 *
 * Yapı: 3 tier (Core / Pro / Premium) × 2 faturalama (Aylık / Yıllık).
 * Yıllık planlarda 2 ay bedava (yıllık = aylık × 10).
 *
 * LMS api-server/src/lib/plans.ts ile BİREBİR senkron tutulmalı.
 * Bir tarafı güncelleyince diğeri de güncellensin.
 */

export type PlanTier = "core" | "pro" | "premium";
export type BillingType = "monthly" | "yearly";

export type PlanCode =
  | "sphere-core-aylik"
  | "sphere-core-yillik"
  | "sphere-pro-aylik"
  | "sphere-pro-yillik"
  | "sphere-premium-aylik"
  | "sphere-premium-yillik";

export interface PlanDefinition {
  code: PlanCode;
  label: string;
  tier: PlanTier;
  billingType: BillingType;
  /** TL, KDV dahil. Aylık plan için aylık tutar, yıllıkta toplam yıllık tutar. */
  amount: number;
  /** Aktif süre — aylık=1, yıllık=12. */
  durationMonths: number;
  /** Bu plana özgü öne çıkan özellikler — kart üstünde gösterilir. */
  features: string[];
  /** "En Popüler" rozet — sadece Pro tier'da true. */
  popular?: boolean;
  /** Tüm tier'larda paylaşılan ortak feature matrix (karşılaştırma tablosu için). */
}

export const PLAN_CATALOG: PlanDefinition[] = [
  // ── CORE ─────────────────────────────────────────────────────────────────
  {
    code: "sphere-core-aylik",
    label: "Sphere Core",
    tier: "core",
    billingType: "monthly",
    amount: 349,
    durationMonths: 1,
    features: [
      "Standart AI Coach (günlük pratik)",
      "Oxford müfredatı A1–B1",
      "Temel seviye tespiti",
      "Temel ilerleme paneli",
      "E-posta destek",
    ],
  },
  {
    code: "sphere-core-yillik",
    label: "Sphere Core",
    tier: "core",
    billingType: "yearly",
    amount: 3490,
    durationMonths: 12,
    features: [
      "Standart AI Coach (günlük pratik)",
      "Oxford müfredatı A1–B1",
      "Temel seviye tespiti",
      "Temel ilerleme paneli",
      "E-posta destek",
      "Aylığa göre %17 indirim",
    ],
  },

  // ── PRO (En Popüler) ────────────────────────────────────────────────────
  {
    code: "sphere-pro-aylik",
    label: "Sphere Pro",
    tier: "pro",
    billingType: "monthly",
    amount: 699,
    durationMonths: 1,
    popular: true,
    features: [
      "Sınırsız AI Coach",
      "Oxford müfredatı A1–C1 (tüm seviyeler)",
      "AI Studio: toplantı, e-mail, sunum, müzakere",
      "Adaptif kişisel öğrenme planı",
      "Haftalık hedef + detaylı rapor",
      "Öncelikli destek",
    ],
  },
  {
    code: "sphere-pro-yillik",
    label: "Sphere Pro",
    tier: "pro",
    billingType: "yearly",
    amount: 6990,
    durationMonths: 12,
    popular: true,
    features: [
      "Sınırsız AI Coach",
      "Oxford müfredatı A1–C1 (tüm seviyeler)",
      "AI Studio: toplantı, e-mail, sunum, müzakere",
      "Adaptif kişisel öğrenme planı",
      "Haftalık hedef + detaylı rapor",
      "Öncelikli destek",
      "Aylığa göre %17 indirim",
    ],
  },

  // ── PREMIUM ──────────────────────────────────────────────────────────────
  {
    code: "sphere-premium-aylik",
    label: "Sphere Premium",
    tier: "premium",
    billingType: "monthly",
    amount: 1199,
    durationMonths: 1,
    features: [
      "Sınırsız AI Coach + telaffuz/aksan analizi",
      "Oxford müfredatı tüm seviyeler + sektörel modüller",
      "AI Studio gelişmiş + sektöre özel senaryolar",
      "Tam kişiselleştirilmiş plan + hedef takibi",
      "Derin analiz + öneri raporu",
      "Öncelikli destek + aylık canlı koçluk",
    ],
  },
  {
    code: "sphere-premium-yillik",
    label: "Sphere Premium",
    tier: "premium",
    billingType: "yearly",
    amount: 11990,
    durationMonths: 12,
    features: [
      "Sınırsız AI Coach + telaffuz/aksan analizi",
      "Oxford müfredatı tüm seviyeler + sektörel modüller",
      "AI Studio gelişmiş + sektöre özel senaryolar",
      "Tam kişiselleştirilmiş plan + hedef takibi",
      "Derin analiz + öneri raporu",
      "Öncelikli destek + aylık canlı koçluk",
      "Aylığa göre %17 indirim",
    ],
  },
];

export function getPlan(code: string): PlanDefinition | undefined {
  return PLAN_CATALOG.find((p) => p.code === code);
}

/**
 * Karşılaştırma tablosu — fiyatlandırma sayfasında 3 sütun olarak gösterilir.
 * Hücre değerleri: string (boş veya "—" = yok)
 */
export interface ComparisonRow {
  feature: string;
  core: string;
  pro: string;
  premium: string;
}

export const COMPARISON_TABLE: ComparisonRow[] = [
  {
    feature: "AI Coach",
    core: "Standart (günlük pratik)",
    pro: "Sınırsız",
    premium: "Sınırsız + telaffuz/aksan analizi",
  },
  {
    feature: "Oxford müfredatı",
    core: "A1–B1",
    pro: "Tüm seviyeler A1–C1",
    premium: "Tüm seviyeler + sektörel",
  },
  {
    feature: "AI Studio (iş senaryoları)",
    core: "—",
    pro: "Toplantı, e-mail, sunum, müzakere",
    premium: "Gelişmiş + sektöre özel senaryolar",
  },
  {
    feature: "Öğrenme planı",
    core: "Temel seviye tespiti",
    pro: "Adaptif kişisel plan",
    premium: "Tam kişiselleştirilmiş + hedef takibi",
  },
  {
    feature: "İlerleme paneli & rapor",
    core: "Temel",
    pro: "Haftalık hedef + detaylı rapor",
    premium: "Derin analiz + öneri",
  },
  {
    feature: "Destek",
    core: "E-posta",
    pro: "Öncelikli",
    premium: "Öncelikli + aylık canlı koçluk",
  },
];
