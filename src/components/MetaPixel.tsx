/**
 * @deprecated 2026-10-02
 *
 * Bu bileşen artık kullanılmıyor. Meta Pixel yüklemesi doğrudan
 * `app/(frontend)/layout.tsx` içinde inline script olarak yapılıyor
 * (KVKK Consent Mode ile).
 *
 * KN-8 fix (META_PIXEL_FIX_PROMPT.md): dead code temizlendi.
 * Dosya git history korunması için saklıyoruz, bir sonraki major
 * refactor'de tamamen silinebilir.
 */
export default function MetaPixel() {
  return null;
}
