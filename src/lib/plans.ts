/**
 * Sphere English plan kataloğu — pazarlama sitesi tarafı.
 *
 * LMS api-server/src/lib/plans.ts ile BİREBİR senkron tutulmalı. Bir tarafı
 * güncelleyince diğeri de güncellenmeli (gelecekte ortak `@workspace/plans`
 * paketine taşınabilir).
 *
 * Pazarlama sitesi /abonelik sayfasında bu listeyi gösterir, kullanıcı plan
 * seçer, /api/payment/initialize çağrıldığında bu liste içinden plan kodu
 * doğrulanır.
 */

export type PlanCode =
  | "bireysel-basic-aylik"
  | "bireysel-standard-aylik"
  | "bireysel-premium-aylik"
  | "bireysel-executive-aylik"
  | "bireysel-standard-3aylik"
  | "bireysel-standard-6aylik"
  | "bireysel-standard-yillik"
  | "bireysel-premium-3aylik"
  | "bireysel-premium-6aylik"
  | "bireysel-premium-yillik";

export interface PlanDefinition {
  code: PlanCode;
  label: string;
  tier: "basic" | "standard" | "premium" | "executive";
  billingType: "recurring" | "one-time";
  amount: number;
  durationMonths?: number;
  features: string[];
  popular?: boolean;
  discountPercent?: number;
}

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    code: "bireysel-basic-aylik",
    label: "Basic — Aylık",
    tier: "basic",
    billingType: "recurring",
    amount: 599,
    features: [
      "AI Studio temel modüller (Telaffuz, Dilbilgisi, Kelime)",
      "Aylık 1 canlı grup dersi",
      "Forum erişimi",
      "Mobil + web",
    ],
  },
  {
    code: "bireysel-standard-aylik",
    label: "Standard — Aylık",
    tier: "standard",
    billingType: "recurring",
    amount: 1799,
    features: [
      "Tüm AI Studio modülleri",
      "Aylık 2 canlı birebir ders",
      "İş Senaryoları + Mülakat Simülatörü",
      "Aylık ilerleme raporu",
    ],
  },
  {
    code: "bireysel-premium-aylik",
    label: "Premium — Aylık",
    tier: "premium",
    billingType: "recurring",
    amount: 4499,
    popular: true,
    features: [
      "Standard'daki tüm özellikler",
      "Haftalık 1 birebir koç oturumu (4/ay)",
      "Sunum Simülatörü + Yazma Koçu detaylı geri bildirim",
      "Öncelikli destek",
      "Sertifikalı program çıktısı",
    ],
  },
  {
    code: "bireysel-executive-aylik",
    label: "Executive — Aylık",
    tier: "executive",
    billingType: "recurring",
    amount: 9999,
    features: [
      "Premium'daki tüm özellikler",
      "Haftalık 2 birebir executive coach (8/ay)",
      "Kişiye özel öğrenme planı + 1-on-1 değerlendirme",
      "Anında destek + dedicated success manager",
      "Liderlik / C-suite konuşma simülasyonları",
    ],
  },
  {
    code: "bireysel-standard-3aylik",
    label: "Standard — 3 Aylık Peşin",
    tier: "standard",
    billingType: "one-time",
    amount: Math.round(1799 * 3 * 0.95),
    durationMonths: 3,
    discountPercent: 5,
    features: ["Standard plan, 3 ay süreyle aktif", "Ortalama aylık ~1709 ₺"],
  },
  {
    code: "bireysel-standard-6aylik",
    label: "Standard — 6 Aylık Peşin",
    tier: "standard",
    billingType: "one-time",
    amount: Math.round(1799 * 6 * 0.88),
    durationMonths: 6,
    discountPercent: 12,
    features: ["Standard plan, 6 ay süreyle aktif", "Ortalama aylık ~1583 ₺"],
  },
  {
    code: "bireysel-standard-yillik",
    label: "Standard — Yıllık Peşin",
    tier: "standard",
    billingType: "one-time",
    amount: Math.round(1799 * 12 * 0.8),
    durationMonths: 12,
    discountPercent: 20,
    features: ["Standard plan, 12 ay süreyle aktif", "En kazançlı seçenek"],
  },
  {
    code: "bireysel-premium-3aylik",
    label: "Premium — 3 Aylık Peşin",
    tier: "premium",
    billingType: "one-time",
    amount: Math.round(4499 * 3 * 0.95),
    durationMonths: 3,
    discountPercent: 5,
    features: ["Premium plan, 3 ay aktif"],
  },
  {
    code: "bireysel-premium-6aylik",
    label: "Premium — 6 Aylık Peşin",
    tier: "premium",
    billingType: "one-time",
    amount: Math.round(4499 * 6 * 0.88),
    durationMonths: 6,
    discountPercent: 12,
    features: ["Premium plan, 6 ay aktif"],
  },
  {
    code: "bireysel-premium-yillik",
    label: "Premium — Yıllık Peşin",
    tier: "premium",
    billingType: "one-time",
    amount: Math.round(4499 * 12 * 0.8),
    durationMonths: 12,
    discountPercent: 20,
    features: ["Premium plan, 12 ay aktif", "En kazançlı paket"],
  },
];

export function getPlan(code: string): PlanDefinition | undefined {
  return PLAN_CATALOG.find((p) => p.code === code);
}
