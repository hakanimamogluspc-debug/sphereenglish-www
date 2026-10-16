import type { CollectionConfig } from 'payload';

/**
 * Vaka çalışmaları / referans müşteriler — /referanslar ve /referanslar/[slug]
 *
 * Kural: sadece gerçek, müşterinin onayladığı veriler. Anonim yayın için
 * `anonymous: true` → sayfada şirket adı yerine `displayName` ("Türkiye merkezli
 * bir gıda ihracatçısı") gösterilir, logo gizlenir.
 */
export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: { singular: 'Vaka Çalışması', plural: 'Vaka Çalışmaları' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'industry', 'status', 'anonymous', 'updatedAt'],
    group: 'Pazarlama İçeriği',
    description:
      'Referans müşteri hikâyeleri. Uydurma rakam/alıntı girmeyin; her sayı müşteriyle doğrulanmış olmalı.',
  },
  access: {
    read: () => true,
  },
  fields: [
    // ── Yayın ──────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'Draft',
          label: 'Durum',
          options: [
            { label: 'Taslak', value: 'Draft' },
            { label: 'Yayımlanmış', value: 'Published' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'anonymous',
          type: 'checkbox',
          defaultValue: true,
          label: 'Anonim yayınla (şirket adı ve logo gizli)',
          admin: { width: '33%' },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          label: 'Öne çıkar (liste başı)',
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'consentNote',
      type: 'text',
      label: 'Yayın onayı notu (dahili)',
      admin: {
        description: 'Kim, ne zaman, nasıl onay verdi (sözlü/e-posta). Sitede görünmez.',
      },
    },

    // ── Kimlik ─────────────────────────────────────────────
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Başlık (sayfa üstü)',
      admin: {
        description: 'Örn: "6 kişilik satış ekibi 7 ayda B1\'den C1\'e"',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'URL Slug',
      admin: { description: 'Küçük harf, tire ile: gida-ihracat-satis-ekibi' },
    },
    {
      name: 'companyName',
      type: 'text',
      label: 'Şirket adı (yalnızca anonim kapalıysa gösterilir)',
    },
    {
      name: 'displayName',
      type: 'text',
      required: true,
      label: 'Anonim görünen ad',
      admin: { description: 'Örn: "Ayvalık merkezli bir gıda ihracatçısı"' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo (anonim kapalıysa)',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'industry',
          type: 'text',
          required: true,
          label: 'Sektör',
          admin: { width: '34%' },
        },
        {
          name: 'companySize',
          type: 'text',
          required: true,
          label: 'Şirket büyüklüğü',
          admin: { width: '33%', description: 'Örn: "50 çalışan"' },
        },
        {
          name: 'region',
          type: 'text',
          label: 'Şehir / bölge',
          admin: { width: '33%' },
        },
      ],
    },

    // ── Program ────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'participants',
          type: 'number',
          required: true,
          label: 'Katılımcı sayısı',
          admin: { width: '25%' },
        },
        {
          name: 'roles',
          type: 'text',
          required: true,
          label: 'Katılımcı rolleri',
          admin: { width: '40%', description: 'Satış, Müşteri Hizmetleri' },
        },
        {
          name: 'period',
          type: 'text',
          required: true,
          label: 'Dönem',
          admin: {
            width: '35%',
            description: 'Örn: "Mart 2026 – devam ediyor (7 ay)"',
          },
        },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      label: 'Özet (liste kartı + SEO açıklaması, 1–2 cümle)',
    },
    {
      name: 'challenge',
      type: 'textarea',
      required: true,
      label: 'Sorun / hedef',
      admin: { description: 'Şirket neden geldi, somut ihtiyaç neydi.' },
    },
    {
      name: 'approach',
      type: 'textarea',
      required: true,
      label: 'Uygulanan program',
      admin: { description: 'Haftalık akış, modüller nasıl kullanıldı.' },
    },
    {
      name: 'weeklyProgram',
      type: 'text',
      label: 'Haftalık program (kısa)',
      admin: { description: 'Örn: "Haftada 2 canlı ders + 1 speaking club"' },
    },
    {
      name: 'modules',
      type: 'array',
      label: 'Kullanılan modüller',
      labels: { singular: 'Modül', plural: 'Modüller' },
      fields: [{ name: 'item', type: 'text', required: true, label: 'Modül' }],
    },

    // ── Sonuçlar ───────────────────────────────────────────
    {
      name: 'metrics',
      type: 'array',
      label: 'Öne çıkan rakamlar (3–4 adet)',
      labels: { singular: 'Rakam', plural: 'Rakamlar' },
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              label: 'Değer',
              admin: { width: '30%', description: '"56", "84 saat", "6/6"' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Açıklama',
              admin: { width: '70%', description: '"tamamlanan canlı ders"' },
            },
          ],
        },
      ],
    },
    {
      name: 'levelsBefore',
      type: 'array',
      label: 'Başlangıç seviye dağılımı',
      labels: { singular: 'Seviye', plural: 'Seviyeler' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'level',
              type: 'select',
              required: true,
              label: 'Seviye',
              admin: { width: '50%' },
              options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({
                label: l,
                value: l,
              })),
            },
            {
              name: 'count',
              type: 'number',
              required: true,
              label: 'Kişi',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'levelsAfter',
      type: 'array',
      label: 'Güncel seviye dağılımı',
      labels: { singular: 'Seviye', plural: 'Seviyeler' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'level',
              type: 'select',
              required: true,
              label: 'Seviye',
              admin: { width: '50%' },
              options: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => ({
                label: l,
                value: l,
              })),
            },
            {
              name: 'count',
              type: 'number',
              required: true,
              label: 'Kişi',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'levelSource',
      type: 'text',
      defaultValue: 'Sphere English seviye değerlendirmesi',
      label: 'Seviye ölçüm kaynağı (sayfada dipnot)',
    },
    {
      name: 'observations',
      type: 'textarea',
      label: 'Gözlemlenen değişiklikler',
      admin: { description: "Yöneticinin/İK'nın fark ettiği somut şeyler." },
    },
    {
      name: 'outcome',
      type: 'text',
      label: 'Devamlılık',
      admin: { description: 'Örn: "6 aylık program 12 aya uzatıldı"' },
    },

    // ── Alıntı ─────────────────────────────────────────────
    {
      name: 'quote',
      type: 'group',
      label: 'Müşteri alıntısı',
      fields: [
        {
          name: 'text',
          type: 'textarea',
          label: 'Alıntı (birebir, uydurma yok)',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'authorName',
              type: 'text',
              label: 'İsim (anonimde gizlenir)',
              admin: { width: '50%' },
            },
            {
              name: 'authorTitle',
              type: 'text',
              label: 'Unvan',
              admin: {
                width: '50%',
                description: '"Genel Müdür", "İK Müdürü"',
              },
            },
          ],
        },
      ],
    },

    // ── SEO ────────────────────────────────────────────────
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO başlığı (boşsa başlık kullanılır)',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      label: 'Sıra (küçük önce)',
    },
  ],
};
