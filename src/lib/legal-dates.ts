/**
 * Legal sayfa "son güncelleme" tarihleri.
 *
 * Metin içeriği değiştiğinde burayı güncelle.
 * Format: 'YYYY-MM-DD' — insan-okur Türkçe tarihe formatForTR ile dönüşür.
 */

export const LEGAL_UPDATES = {
  kvkk: '2026-10-02',
  gizlilik: '2026-10-02',
  kullanimKosullari: '2026-10-02',
  mesafeliSatis: '2026-10-02',
  teslimatIade: '2026-10-02',
} as const;

/**
 * '2026-10-02' → '2 Ekim 2026'
 */
export function formatForTR(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${d} ${months[m - 1]} ${y}`;
}
