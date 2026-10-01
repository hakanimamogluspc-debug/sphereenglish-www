/**
 * @deprecated 2026-10-02
 *
 * GA4 ölçümü artık GTM (Google Tag Manager) üzerinden yapılıyor.
 * Doğrudan gtag.js enjekte etmeye gerek yok — `app/(frontend)/layout.tsx`
 * içindeki GTM script'i GA4 tag'ini yöneyecek şekilde GTM UI'da yapılandırılmıştır.
 *
 * KVKK Consent Mode v2 ile çalışır: kullanıcı consent vermeden GA4
 * veri göndermez (analytics_storage=denied default).
 *
 * Dosya git history korunması için saklıyoruz; bir sonraki major refactor'de
 * tamamen silinebilir.
 */
export default function GoogleAnalytics() {
  return null;
}
