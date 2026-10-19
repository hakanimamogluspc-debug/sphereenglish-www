/**
 * CMS'teki (veritabanındaki) eski, kanıtlanamayan iddiaları düzeltir — Ekim 2026.
 *
 * Kod/seed tarafı zaten güncellendi; ama HomePage ve Çözümler içeriği Payload veritabanında
 * duruyor ve seed mevcut içeriği ezmiyor. /api/seed-cms çağrıldığında bu liste mevcut
 * içeriğe UYGULANIR: yalnızca birebir eşleşen eski cümleler değişir, admin'in başka
 * düzenlemelerine dokunulmaz. İdempotent — tekrar çalıştırmak zararsız.
 */

export const CLAIM_TEXT_FIXES: Array<[string, string]> = [
  [
    "Tüm eğitmenlerimiz CELTA veya DELTA sertifikalı, iş dünyasında deneyim sahibi profesyonellerdir. Ekibimizde anadili İngilizce olan (native speaker) eğitmenler ile Türkiye'nin önde gelen kurumsal İngilizce uzmanları bir arada çalışmaktadır. Her eğitmen, şirketinizin sektörüne göre özellikle seçilmektedir.",
    'Eğitmenlerimiz İngilizce öğretiminde deneyimli, iş dünyasını tanıyan profesyonellerdir. Her eğitmen, şirketinizin sektörüne ve çalışanlarınızın seviyesine göre seçilir.',
  ],
  [
    'CELTA/DELTA sertifikalı, iş dünyası deneyimli İngiliz ve Amerikan eğitmenlerle birebir çalışın.',
    'İş dünyasını tanıyan, kurumsal eğitimde deneyimli eğitmenlerle çalışın.',
  ],
  [
    "Türkiye'nin önde gelen şirketlerinde görev yapan üst düzey yöneticiler Sphere English'i tercih etmektedir. ",
    'Program, farklı sektörlerden üst düzey yöneticilerin ihtiyaçlarına göre tasarlanmıştır. ',
  ],
  [
    'Programa katılan yöneticiler, uluslararası toplantılardaki katılım kalitesini ve özgüvenlerini belirgin biçimde artırmaktadır.',
    'Amaç, yöneticilerin uluslararası toplantılarda daha etkin ve özgüvenli konuşmasıdır.',
  ],
  [
    "Global teknoloji şirketlerinde remote çalışan Türk mühendisler ve Türkiye'deki çok uluslu teknoloji şirketlerinin teknik kadroları bu programı tercih etmektedir.",
    "Program, global teknoloji şirketlerinde remote çalışan Türk mühendisler ve Türkiye'deki çok uluslu teknoloji şirketlerinin teknik kadroları için tasarlanmıştır.",
  ],
  ['konularında somut gelişme sağlayan program;', 'konularında gelişmeyi hedefleyen program;'],
];

/** Alan değeri birebir eşitse değiştirilir (kısa metinler için — cümle içinde aranmaz). */
export const CLAIM_EXACT_FIXES: Array<[string, string]> = [
  ['Sertifikalı Eğitmenler', 'Deneyimli Eğitmenler'],
];

/** HomePage hero istatistiği — eski değerse yenisiyle değiştir. */
export const HERO_STAT_FIXES: Record<string, [string, string]> = {
  heroStatValue: ['+2', '50+'],
  heroStatLabel: ['Seviye', 'Kurumsal müşteri'],
  heroStatNote: ['6 aylık program sonrası', "2020'den bu yana"],
};

/** Nesnedeki tüm metinlere düzeltmeleri uygula; değişiklik sayısını döner. Saf fonksiyon. */
export function applyClaimFixes<T>(value: T): { value: T; changes: number } {
  let changes = 0;
  const walk = (v: unknown, key?: string): unknown => {
    if (typeof v === 'string') {
      let s = v;
      for (const [from, to] of CLAIM_EXACT_FIXES) if (s === from) s = to;
      for (const [from, to] of CLAIM_TEXT_FIXES) if (s.includes(from)) s = s.split(from).join(to);
      if (key && HERO_STAT_FIXES[key] && s === HERO_STAT_FIXES[key][0]) s = HERO_STAT_FIXES[key][1];
      if (s !== v) changes++;
      return s;
    }
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, x] of Object.entries(v)) out[k] = k === 'id' ? x : walk(x, k);
      return out;
    }
    return v;
  };
  return { value: walk(value) as T, changes };
}
