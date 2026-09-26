# Meta Pixel + CAPI Düzeltme Görevi — Sphere English

> Bu doküman bir geliştiriciye veya kod ajanına **olduğu gibi** verilebilir.
> Repo: `sphereenglish-www` (Next.js 15 App Router) · Pixel/Dataset ID: `2156406151837976`
> Hazırlanma tarihi: 10 Eylül 2026

---

## 0. Bağlam

Sphere English, Instagram reklamlarıyla e-kitap satıyor (tekil kitap 199 TL, 5 kitaplık tam set 799 TL). Ödeme altyapısı Iyzico. Meta Ads tarafında iki ölçüm sorunu tespit edildi ve reklam optimizasyonunu bozuyor:

1. **Purchase event'i her gerçek satışta ~3 kez ateşleniyor** (şişik satış sayısı)
2. **Gerçek satışların ~%56'sı reklama bağlanamıyor** (attribution kaybı)

Bu ikisi aynı anda olduğu için Ads Manager rakamları hem şişik hem eksik — algoritma yanlış sinyalle öğreniyor.

### Teşhisi destekleyen veri (Meta Events Manager, 4–10 Eylül)

| Event | 7 günlük sayı |
|---|---|
| PageView | 541 |
| ViewContent | 33 |
| AddToCart | 26 |
| InitiateCheckout | 12 |
| AddPaymentInfo | 12 |
| **Purchase** | **29** |

Purchase, InitiateCheckout'un 2,4 katı — fiziksel olarak imkânsız.

Günlük doğrulama (işletme sahibinin beyan ettiği gerçek satışlarla):

| Gün | Gerçek satış | InitiateCheckout | AddPaymentInfo | Purchase event | Browser | Server |
|---|---|---|---|---|---|---|
| 9 Eyl | 2 | 2 ✅ | 2 ✅ | **6** (3×) | 2 | 4 |
| 10 Eyl | 4 | 5 ✅ | 5 ✅ | **11** (2,75×) | 6 | 5 |

**InitiateCheckout ve AddPaymentInfo gerçek sayıyla birebir tutuyor. Bozuk olan tek event Purchase.**

Event Match Quality (Purchase, web kanalı): **5,4 / 10**

| Eşleştirme anahtarı | Kapsam |
|---|---|
| ip_address | 100% |
| user_agent | 100% |
| country | 100% |
| **fbc** (tıklama ID) | **44,4%** |
| **fbp** (browser ID) | **44,4%** |
| em / ph / fn / ln / external_id | **0% — hiç gönderilmiyor** |

---

## 1. Kök nedenler (kod incelemesiyle doğrulandı)

### 🔴 KN-1 — GTM konteynerinde ikinci bir Meta Pixel tag'i olma ihtimali (EN YÜKSEK ÖNCELİK)

`src/app/(frontend)/layout.tsx` içinde hem **inline Meta Pixel snippet'i** (satır ~328-343: `fbq('init','2156406151837976')` + `fbq('track','PageView')`) hem de **GTM konteyneri** (`GTM-TTDMJ8HH`) yükleniyor.

GTM konteynerinde ayrıca bir "Meta Pixel — Purchase" tag'i tanımlıysa, o tag `eventID` **göndermeden** ateşlenir → deduplication imkânsız → her satış hem inline pixel'den hem GTM'den sayılır. Browser tarafındaki 6 vs 4 farkı (10 Eylül) bununla birebir uyumlu.

**Bu repodan doğrulanamaz — GTM arayüzünden kontrol edilmeli.**

### 🔴 KN-2 — CAPI'ye fbp/fbc/IP/UA yanlış kaynaktan gidiyor (attribution kaybının ana sebebi)

`src/lib/analytics/meta-capi.ts` içindeki `userDataFromRequest(req)` fonksiyonu doğru yazılmış — ama **yanlış yerde çağrılıyor**.

Çağrıldığı yerler:
- `src/app/api/payment/ebook/callback/route.ts:239`
- `src/app/api/payment/cart/callback/route.ts:229`
- `src/app/api/payment/callback/route.ts:160`

Bu `req`, **Iyzico'nun 3DS dönüş isteği**. Kullanıcının tarayıcısından gelen orijinal istek değil. Sonuç:

- `cookies._fbp` / `cookies._fbc` → çoğu zaman **yok** (Iyzico'nun isteği kullanıcının cookie'lerini taşımıyor)
- `client_ip_address` → Iyzico sunucusunun IP'si olabilir
- `client_user_agent` → Iyzico'nun UA'sı olabilir

fbc/fbp kapsamının tam olarak %44,4'te kalmasının sebebi bu: sadece browser pixel'inden gelen event'lerde bu anahtarlar var, CAPI'den gelenlerde yok.

**Yanlış IP/UA göndermek, hiç göndermemekten daha kötüdür** — Meta yanlış kişiyle eşleştirmeye çalışır.

### 🟠 KN-3 — `fbclid` → `_fbc` fallback'i yok

Reklamdan gelen kullanıcıda `_fbc` cookie'si ancak pixel yüklenirse oluşur. Adblock, ITP veya yavaş yükleme durumunda oluşmaz ve tıklama ID'si tamamen kaybolur. URL'deki `fbclid` parametresinden `_fbc` değerini kendimiz üretmiyoruz.

### 🟠 KN-4 — Abonelik akışında event_name uyumsuzluğu

`src/app/api/payment/callback/route.ts` (abonelik):
- Sunucu: `Subscribe` gönderiyor, `event_id = subscribe_<conv>`
- İstemci (`PurchaseTracker`): hem `Purchase` **hem** `Subscribe` gönderiyor, ikisi de `eventID = subscribe_<conv>`

Meta deduplication'ı `(event_name, event_id)` çiftiyle yapar. `Subscribe` eşleşip tekilleşiyor, ama istemcinin gönderdiği `Purchase`'ın sunucuda karşılığı yok → tek başına sayılıyor ve **fbp/fbc'siz** kalıyor.

### 🟠 KN-5 — `crypto.randomUUID()` fallback'i dedup'ı kırıyor

`src/app/api/payment/ebook/callback/route.ts:227`:

```ts
const eventId = `purchase_${conversationId || result?.paymentId || crypto.randomUUID()}`;
```

`conversationId` ve `paymentId` boş gelirse **her çağrıda yeni rastgele ID** üretilir. Iyzico callback'i tekrar ederse (retry) veya route hem GET hem POST ile tetiklenirse (`export const POST = handle; export const GET = handle;`) aynı satış farklı event_id'lerle iki kez sayılır.

### 🟡 KN-6 — Ana landing page'de ViewContent yok

Reklamların indiği "tam set 799 TL" sayfası: `src/app/(frontend)/e-kitaplar/paketler/[slug]/page.tsx`

Bu sayfada **hiçbir ViewContent tracker yok**. `EbookViewTracker` sadece tekil kitap sayfasında (`e-kitaplar/[slug]`) kullanılıyor. 7 günde 541 PageView'a karşı 33 ViewContent bundan kaynaklanıyor.

Sonuç: retargeting kitleleri boş kalıyor, Meta'nın dönüşüm modeli huninin ortasını göremiyor.

### 🟡 KN-7 — Kurs akışında Meta tracking tamamen yok

`src/app/api/payment/course/callback/route.ts` sadece GA4'e gönderiyor. Ne CAPI Purchase ne de pixel eventId'si var. Kurs satışları Meta'da hiç görünmüyor.

### 🟡 KN-8 — Ölü kod: `src/components/MetaPixel.tsx`

Bu component hiçbir yerde import edilmiyor (`layout.tsx` inline snippet kullanıyor). İleride biri onu da eklerse `fbq('init')` iki kez çağrılır. Silinmeli veya layout inline snippet'i bu component'le değiştirilmeli (ikisi birden asla olmamalı).

---

## 2. Yapılacaklar

Sırayla uygula. Her adımın sonunda doğrulama var.

---

### ✅ GÖREV 1 — GTM'deki duplicate Pixel tag'ini temizle

**Kod değişikliği değil, GTM arayüzü işi. Önce bunu yap.**

1. Google Tag Manager → konteyner `GTM-TTDMJ8HH`
2. Tags listesinde şunları ara: "Meta", "Facebook", "Pixel", "fbq", tipi *Custom HTML* olan her tag
3. Bulunan her Meta/Facebook tag'i için:
   - `fbq('init', ...)` içeriyorsa → **duraklat (pause)**. Pixel init'i `layout.tsx`'te zaten var.
   - `fbq('track', 'Purchase', ...)` içeriyorsa → **duraklat**. Purchase'ı `PurchaseTracker` component'i yönetiyor.
   - Şüphedeysen sil değil, önce *pause* et — geri alması kolay.
4. Konteyneri yayınla (publish).

**Doğrulama:** Meta Pixel Helper (Chrome eklentisi) ile `sphereenglish.com` aç → sayfa başına **tek bir** `PageView` görünmeli, `init` bir kez çağrılmalı.

> ⚠️ Bu adım için ayrıca Google Analytics/GA4 tag'lerine dokunma — sadece Meta/Facebook olanlar.

---

### ✅ GÖREV 2 — `fbclid → _fbc` yakalayıcı ekle

**Yeni dosya:** `src/components/FbclidCapture.tsx`

```tsx
'use client';

import { useEffect } from 'react';

/**
 * Reklamdan gelen kullanıcının fbclid parametresini yakalayıp _fbc cookie'si
 * olarak kalıcılaştırır.
 *
 * Neden: _fbc cookie'sini normalde Meta Pixel'in kendisi oluşturur. Adblock,
 * Safari ITP veya pixel'in geç yüklenmesi durumunda oluşmaz ve tıklama ID'si
 * tamamen kaybolur — o satış hiçbir reklama bağlanamaz.
 *
 * Meta'nın beklediği format: fb.1.<unix_ms>.<fbclid>
 * Referans: developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
 */
export default function FbclidCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const fbclid = params.get('fbclid');
      if (!fbclid) return;

      // Zaten bir _fbc varsa ve aynı fbclid'i taşıyorsa dokunma
      const existing = document.cookie
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('_fbc='))
        ?.slice('_fbc='.length);

      if (existing && existing.endsWith(`.${fbclid}`)) return;

      const value = `fb.1.${Date.now()}.${fbclid}`;
      const maxAge = 90 * 24 * 60 * 60; // Meta'nın tıklama attribution penceresiyle uyumlu

      document.cookie = [
        `_fbc=${value}`,
        'path=/',
        `max-age=${maxAge}`,
        'SameSite=Lax',
        window.location.protocol === 'https:' ? 'Secure' : '',
      ]
        .filter(Boolean)
        .join('; ');
    } catch {
      /* cookie yazılamadıysa sessizce geç — uygulama akışını bozma */
    }
  }, []);

  return null;
}
```

**Düzenle:** `src/app/(frontend)/layout.tsx`

`<CartProvider>` içine, `<MetaPixelRouteTracker />` yanına ekle:

```tsx
import FbclidCapture from '@/components/FbclidCapture';
// ...
<Suspense fallback={null}>
  <FbclidCapture />
</Suspense>
```

**Doğrulama:** `https://www.sphereenglish.com/?fbclid=TEST123` aç → DevTools → Application → Cookies → `_fbc` değeri `fb.1.<timestamp>.TEST123` olmalı.

---

### ✅ GÖREV 3 — Checkout başlangıcında Meta kimlik verisini yakala ve sipariş kaydına yaz

**Bu, attribution kaybını kapatan ana düzeltmedir.**

Mantık: `_fbp` / `_fbc` / gerçek IP / gerçek User-Agent yalnızca **kullanıcı sitedeyken** erişilebilir. Ödeme callback'i Iyzico'dan geldiği için orada erişilemez. Bu yüzden checkout başlarken yakalayıp pending sipariş kaydına yazacağız, callback'te oradan okuyacağız.

#### 3a) Yardımcı fonksiyonu ekle

**Düzenle:** `src/lib/analytics/meta-capi.ts`

Dosyanın sonuna ekle:

```ts
/**
 * Kullanıcının TARAYICI isteğinden Meta kimlik verisini çıkarır.
 *
 * ⚠️ Bunu SADECE kullanıcının kendi isteğini işleyen route'larda çağır
 * (checkout initialize gibi). Iyzico callback'inde ÇAĞIRMA — orada bu
 * değerler Iyzico'nun sunucusuna ait olur ve yanlış eşleşmeye yol açar.
 */
export function captureMetaIdentity(req: Request): {
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
} {
  const headers = req.headers;
  const clientUserAgent = headers.get('user-agent') || undefined;
  const forwardedFor = headers.get('x-forwarded-for') || '';
  const realIp = headers.get('x-real-ip') || '';
  const clientIpAddress = forwardedFor.split(',')[0]?.trim() || realIp || undefined;

  const cookieHeader = headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }),
  );

  return {
    fbp: cookies._fbp || undefined,
    fbc: cookies._fbc || undefined,
    clientIpAddress,
    clientUserAgent,
  };
}
```

Ayrıca **`userDataFromRequest` fonksiyonuna uyarı ekle** (silme — başka yerde kullanılıyor olabilir):

```ts
/**
 * @deprecated Ödeme callback'lerinde KULLANMA — orada request Iyzico'dan gelir,
 * kullanıcının cookie/IP/UA bilgisini taşımaz. Bunun yerine checkout initialize
 * aşamasında `captureMetaIdentity()` ile yakala, sipariş kaydına yaz, callback'te
 * oradan oku.
 */
export function userDataFromRequest(/* ... mevcut kod ... */) { /* ... */ }
```

#### 3b) E-kitap checkout initialize — yakala ve gönder

**Düzenle:** `src/app/api/payment/ebook/initialize/route.ts`

`captureMetaIdentity` import et, `POST` handler içinde `conversationId` üretildikten sonra çağır ve pre-create payload'ına ekle:

```ts
import { captureMetaIdentity } from '@/lib/analytics/meta-capi';

// ... POST içinde, pre-create payload hazırlanırken:
const metaIdentity = captureMetaIdentity(req);

const payload = {
  // ... mevcut alanlar (iyzicoConversationId, email, vb.) ...
  metaFbp: metaIdentity.fbp ?? null,
  metaFbc: metaIdentity.fbc ?? null,
  metaClientIp: metaIdentity.clientIpAddress ?? null,
  metaClientUserAgent: metaIdentity.clientUserAgent ?? null,
};
```

#### 3c) Sepet checkout initialize — aynısı

**Düzenle:** `src/app/api/payment/cart/initialize/route.ts` — 3b ile birebir aynı yaklaşım.

#### 3d) api-server tarafında alanları sakla

**Repo:** `sphere-english-app`

1. `lib/db/src/schema/ebooks.ts` (ve varsa cart/order şeması) içindeki pending purchase tablosuna dört nullable text kolon ekle:
   - `meta_fbp`
   - `meta_fbc`
   - `meta_client_ip`
   - `meta_client_user_agent`
2. Migration üret ve uygula.
3. `/api/internal/ebook-purchase/pre-create` ve sepet karşılığı endpoint'lerde bu alanları kaydet.
4. `/api/order/:orderId` ve pending lookup endpoint'lerinin response'unda bu alanları döndür.

> Şema değişikliği yapamıyorsan alternatif: mevcut bir `metadata` / `notes` JSON kolonuna `{"meta":{"fbp":...,"fbc":...,"ip":...,"ua":...}}` olarak yaz. Tercih edilen yol yine de ayrı kolonlardır.

**Doğrulama:** Test satın alması yap → DB'de pending kayıtta `meta_fbp` ve `meta_fbc` dolu olmalı.

---

### ✅ GÖREV 4 — Callback'lerde CAPI'yi doğru veriyle gönder

#### 4a) E-kitap callback

**Düzenle:** `src/app/api/payment/ebook/callback/route.ts`

**1) `crypto.randomUUID()` fallback'ini kaldır (KN-5).** Deterministik olmayan ID dedup'ı kırar:

```ts
// ÖNCE (hatalı):
// const eventId = `purchase_${conversationId || result?.paymentId || crypto.randomUUID()}`;

// SONRA:
const stableRef = conversationId || result?.paymentId;
if (!stableRef) {
  // Deterministik referans yoksa CAPI göndermek zararlı — rastgele ID her
  // retry'da yeni satış gibi görünür. Logla ve CAPI'yi atla.
  console.error('[payment/ebook/callback] Deterministik referans yok, CAPI atlanıyor');
}
const eventId = stableRef ? `purchase_${stableRef}` : null;
```

**2) `userDataFromRequest(req)` yerine pending kayıttan oku:**

```ts
// pending kaydı zaten çekiliyorsa onu kullan; yoksa lookup ekle
const pending = await fetchPendingByConversationId(conversationId);

if (eventId) {
  sendCapiPurchase({
    orderId: eventId.replace(/^purchase_/, ''),
    value: priceTry,
    currency: result.currency ?? 'TRY',
    contentIds: [productId],
    contentName: `E-Kitap #${ebookId}`,
    eventSourceUrl: `${paymentBaseUrl()}/odeme/basarili?type=ebook`,
    userData: {
      // ✅ Checkout anında yakalanan GERÇEK kullanıcı verisi
      fbp: pending?.metaFbp ?? undefined,
      fbc: pending?.metaFbc ?? undefined,
      clientIpAddress: pending?.metaClientIp ?? undefined,
      clientUserAgent: pending?.metaClientUserAgent ?? undefined,
      // Iyzico'dan gelen kimlik verisi — EMQ'yu asıl yükselten kısım
      email: buyerEmail,
      firstName: result?.buyer?.name,
      lastName: result?.buyer?.surname,
      phone: result?.buyer?.gsmNumber,
      city: result?.buyer?.city,
      country: 'TR',
      externalId: buyerEmail, // hash'i sendCapiEvent içinde atılıyor
    },
  }).then((r) => {
    if (!r.ok) console.warn('[capi] ebook Purchase send hata:', r.error);
  });
}
```

> `externalId` olarak e-postayı vermek EMQ'ya belirgin katkı yapar; `sendCapiEvent` zaten sha256'lıyor.

**3) `warn=manuel` dalında `eventId` ve `value` da gönder** ki oradaki satışlar da ölçülsün. Şu an bu dalda kullanıcı `/odeme/basarili?...&warn=manuel` adresine yönleniyor ve `PurchaseTracker` hiç ateşlenmiyor (çünkü `!warn` koşulu var) — ama para tahsil edilmiş oluyor. Bu satışlar tamamen kayıp.

Öneri: `warn=manuel` dalında da CAPI Purchase gönder (sunucu tarafı zaten yeterli), istemci tarafını değiştirme.

#### 4b) Sepet callback

**Düzenle:** `src/app/api/payment/cart/callback/route.ts` — 4a ile aynı üç değişiklik.
`eventId` zaten deterministik (`purchase_cart_${orderId}`), sadece `userData` kaynağını değiştir.

#### 4c) Abonelik callback — event_name uyumsuzluğunu gider (KN-4)

**Düzenle:** `src/app/api/payment/callback/route.ts`

Sunucu tarafında **hem `Purchase` hem `Subscribe`** gönder, her biri kendi event_id'siyle:

```ts
const purchaseEventId = `purchase_${conversationId}`;
const subscribeEventId = `subscribe_${conversationId}`;

// Purchase — istemcideki trackPurchase ile eşleşecek
sendCapiPurchase({
  orderId: conversationId,
  value: priceTry,
  currency: 'TRY',
  contentIds: [planCode],
  contentName: planName,
  eventSourceUrl: `${paymentBaseUrl()}/odeme/basarili`,
  userData: { /* pending kayıttan + Iyzico buyer verisi */ },
});

// Subscribe — istemcideki trackMetaEvent('Subscribe') ile eşleşecek
sendCapiSubscribe({ /* ... */ });
```

**Düzenle:** `src/components/PurchaseTracker.tsx` — `Purchase` ve `Subscribe` **farklı** eventID kullanmalı:

```tsx
trackPurchase({
  // ...
  eventId: props.purchaseEventId,   // purchase_<conv>
});

if (props.type === 'subscription') {
  trackMetaEvent('Subscribe', { /* ... */ }, props.subscribeEventId); // subscribe_<conv>
}
```

Redirect URL'ine iki ID'yi de ekle ve success page'de prop olarak geçir.

**Doğrulama:** Events Manager → Test Events. Bir test satın alması yap. `Purchase` **tek satır** olarak görünmeli ve "Browser + Server" (deduplicated) etiketi taşımalı — iki ayrı satır değil.

---

### ✅ GÖREV 5 — Sunucu tarafı huni event'leri (dayanıklılık)

`InitiateCheckout` ve `AddPaymentInfo` şu an sadece istemciden gidiyor. Bunlar için CAPI karşılığı ekle — hem adblock kaybını telafi eder hem huni bütünlüğünü sağlar.

**Düzenle:** `src/app/api/payment/ebook/initialize/route.ts` ve `cart/initialize/route.ts`

```ts
import { sendCapiEvent } from '@/lib/analytics/meta-capi';

// conversationId üretildikten sonra:
sendCapiEvent({
  eventName: 'InitiateCheckout',
  eventId: `ic_${conversationId}`,
  eventSourceUrl: req.headers.get('referer') ?? `${paymentBaseUrl()}/e-kitaplar`,
  userData: { ...metaIdentity, email, phone, country: 'TR' },
  customData: { value: price, currency: 'TRY', contentIds: [productId], contentType: 'product', numItems: 1 },
}).catch(() => {});
```

**Düzenle:** İstemci tarafında aynı eventID kullanılmalı, yoksa çift sayılır:
- `src/app/(frontend)/e-kitaplar/[slug]/BuyEbookButton.tsx:196`
- `src/app/(frontend)/sepet/CartCheckoutModal.tsx:197`

`trackInitiateCheckout` fonksiyonuna `eventId` parametresi ekle ve initialize response'undan dönen `conversationId` ile `ic_<conversationId>` üret.

> ⚠️ Bu görev opsiyoneldir ama yapılacaksa **istemci + sunucu aynı eventID'yi kullanmalı**. Emin değilsen bu görevi atla — mevcut istemci event'leri gerçek sayıyla zaten uyumlu.

---

### ✅ GÖREV 6 — ViewContent'i ana landing page'e ekle (KN-6)

**Düzenle:** `src/app/(frontend)/e-kitaplar/paketler/[slug]/page.tsx`

Reklamların indiği "tam set 799 TL" sayfası bu. `EbookViewTracker` mantığını paket için uyarla:

**Yeni dosya:** `src/components/BundleViewTracker.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { trackMetaEvent } from '@/lib/analytics/meta-pixel';

export default function BundleViewTracker(props: {
  bundleSlug: string;
  title: string;
  priceTry: number;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    trackMetaEvent('ViewContent', {
      content_ids: [`bundle-${props.bundleSlug}`],
      content_type: 'product',
      content_name: props.title,
      content_category: 'e-book-bundle',
      value: props.priceTry,
      currency: 'TRY',
    });
  }, [props.bundleSlug, props.title, props.priceTry]);

  return null;
}
```

Paket sayfasına ekle:

```tsx
<BundleViewTracker
  bundleSlug={bundle.slug}
  title={bundle.title}
  priceTry={Number(bundle.price_try ?? 0)}
/>
```

Ayrıca `src/app/(frontend)/e-kitaplar/page.tsx` (liste sayfası) ve `src/app/(frontend)/sepet/page.tsx` için de `ViewContent` eklemeyi değerlendir.

**Doğrulama:** Paket sayfasını aç → Pixel Helper'da `ViewContent` görünmeli, `value` 799 olmalı.

---

### ✅ GÖREV 7 — Kurs akışına Meta tracking ekle (KN-7)

**Düzenle:** `src/app/api/payment/course/callback/route.ts`

GA4 gönderiminin yanına CAPI Purchase ekle (4a'daki desenle aynı). Kurs başarı sayfası `/kurslar/kayit` olduğu için `PurchaseTracker`'ı oraya da ekle veya sadece sunucu tarafı CAPI ile yetin.

---

### ✅ GÖREV 8 — Ölü kodu temizle (KN-8)

**Sil:** `src/components/MetaPixel.tsx`

Hiçbir yerde import edilmiyor; `layout.tsx` inline snippet kullanıyor. Bırakılırsa ileride biri onu da ekleyip `fbq('init')`'i iki kez çağırma riski var.

**Alternatif (daha temiz):** `layout.tsx`'teki inline snippet'i kaldırıp `<MetaPixel />` component'ini kullan. **İkisi birden asla olmasın.**

---

### ✅ GÖREV 9 — `value` parametresini doğrula

Şikâyet: 9 Eylül'de tam set (799 TL) reklamından gelen satışlar Meta'ya **199 TL** olarak düşmüş.

Kontrol edilecek noktalar:

1. `src/app/api/payment/ebook/callback/route.ts` → `const priceTry = Number(result.paidPrice ?? 0);`
   Iyzico `paidPrice` **taksitli ödemede tek taksit tutarını** dönebilir. `price` alanıyla karşılaştır; sepet toplamı hangisiyse onu kullan.
2. Sepet akışında `cartOrder.totalAmount` sipariş toplamını mı yoksa tek kalemi mi tutuyor?
3. `src/app/(frontend)/odeme/basarili/page.tsx:98` → `const priceTry = Number(sp.value ?? (cartOrder?.totalAmount ?? 0));`
   URL'deki `value` parametresi manipüle edilebilir; sunucu tarafı CAPI değerini **her zaman** DB'den al, URL'den değil.
4. Kuponlu satışlarda indirimli tutarın gönderildiğinden emin ol.

**Doğrulama:** 799 TL'lik bir test satın alması yap → Events Manager → Test Events → `Purchase` event'inde `value: 799`, `currency: TRY` görünmeli.

---

## 3. Uçtan uca doğrulama (deploy sonrası)

1. **Events Manager → Test Events**
   - Test event kodu al, `META_CAPI_TEST_EVENT_CODE` env değişkenine yaz
   - Tam bir satın alma akışı yap: reklam linki (`?fbclid=...`) → paket sayfası → sepet → ödeme → başarı sayfası
   - Beklenen sıra: `PageView` → `ViewContent` → `AddToCart` → `InitiateCheckout` → `AddPaymentInfo` → `Purchase`
   - `Purchase` **tek satır** olmalı, "Browser and Server" işaretli (deduplicated)
   - `value` doğru, `currency: TRY`

2. **48 saat sonra Events Manager → Veri Kaynakları → Purchase**
   - Deduplication oranı: %0'a yakın olmalı (yüksekse hâlâ eşleşmeyen event var)
   - Event Match Quality: **5,4 → 7,5+** olmalı
   - `fbc` kapsamı: **%44 → %85+**
   - `em` (e-posta) kapsamı: **%0 → %90+**

3. **Huni tutarlılığı (3 gün sonra)**
   - `Purchase ≤ AddPaymentInfo ≤ InitiateCheckout` sıralaması **her gün** sağlanmalı
   - Günlük Purchase sayısı, işletmenin gerçek sipariş sayısıyla ±1 içinde olmalı

4. **Ads Manager**
   - `Sphere-Kitap-Satış-v3` kampanyasında raporlanan satış sayısı gerçek satışa yaklaşmalı

---

## 4. Beklenen etki ve uyarılar

### ⚠️ Rakamlar önce DÜŞECEK

Görev 1 ve 4 uygulandığında Ads Manager'daki satış sayısı azalacak — çünkü şu an şişik. **Bu bir gerileme değil, düzelmedir.** Panik yapıp geri alma.

### ⚠️ Öğrenme aşaması yeniden başlayabilir

Dönüşüm sinyali belirgin değişince Meta kampanyayı yeniden öğrenme aşamasına alabilir. 3-5 gün dalgalanma normal. Bu süreçte bütçeye dokunma.

### ⚠️ Kişisel veri (KVKK)

CAPI'ye gönderilen e-posta/telefon **sha256 ile hash'lenerek** gidiyor (`meta-capi.ts` içinde zaten doğru yapılmış). Ham veri asla gönderilmemeli. Gizlilik politikasında Meta'ya aktarım maddesi bulunduğundan emin ol.

### ⚠️ Dokunulmayacaklar

- Ödeme akışının kendisi (Iyzico entegrasyonu) — sadece analytics katmanı değişiyor
- GA4 gönderimleri — çalışıyor, dokunma
- Reklam kampanyası ayarları (bütçe, hedefleme, kreatif) — bu görevin kapsamı dışında

### Beklenen sonuç

| Metrik | Şimdi | Hedef |
|---|---|---|
| Event Match Quality | 5,4 | 7,5+ |
| fbc kapsamı | %44,4 | %85+ |
| em (e-posta) kapsamı | %0 | %90+ |
| Purchase / gerçek satış oranı | ~2,9× | 1,0× |
| Reklama bağlanan satış oranı | ~%67 | %90+ |

---

## 5. Öncelik sırası

Zaman kısıtlıysa bu sırayla:

| Öncelik | Görev | Etki | Efor |
|---|---|---|---|
| 1 | Görev 1 — GTM duplicate tag | Duplicate'i bitirir | 15 dk |
| 2 | Görev 4a/4b — callback userData düzeltmesi | Attribution'ı açar | 2-3 saat |
| 3 | Görev 3 — fbp/fbc persist | Görev 4'ün ön koşulu | 3-4 saat |
| 4 | Görev 2 — fbclid capture | fbc kapsamını yükseltir | 30 dk |
| 5 | Görev 9 — value doğrulama | ROAS doğruluğu | 1 saat |
| 6 | Görev 6 — ViewContent | Retargeting + huni | 1 saat |
| 7 | Görev 4c — abonelik dedup | Küçük hacim | 1 saat |
| 8 | Görev 7, 8, 5 | Temizlik / dayanıklılık | 2 saat |

> Görev 3 ile 4 birbirine bağlı: Görev 4'teki `pending?.metaFbp` okuması, Görev 3'teki yazma olmadan `undefined` döner. İkisini birlikte deploy et.

---

## 6. Dosya değişiklik özeti

**`sphereenglish-www` reposu:**

| Dosya | İşlem |
|---|---|
| `src/components/FbclidCapture.tsx` | 🆕 yeni |
| `src/components/BundleViewTracker.tsx` | 🆕 yeni |
| `src/components/MetaPixel.tsx` | 🗑️ sil |
| `src/lib/analytics/meta-capi.ts` | ✏️ `captureMetaIdentity()` ekle, `userDataFromRequest` deprecate |
| `src/app/(frontend)/layout.tsx` | ✏️ `FbclidCapture` ekle |
| `src/app/(frontend)/e-kitaplar/paketler/[slug]/page.tsx` | ✏️ `BundleViewTracker` ekle |
| `src/app/(frontend)/odeme/basarili/page.tsx` | ✏️ ayrı purchase/subscribe eventId prop'ları |
| `src/components/PurchaseTracker.tsx` | ✏️ ayrı eventID'ler |
| `src/app/api/payment/ebook/initialize/route.ts` | ✏️ `captureMetaIdentity` + pre-create payload |
| `src/app/api/payment/cart/initialize/route.ts` | ✏️ aynısı |
| `src/app/api/payment/ebook/callback/route.ts` | ✏️ userData kaynağı + randomUUID fallback kaldır |
| `src/app/api/payment/cart/callback/route.ts` | ✏️ userData kaynağı |
| `src/app/api/payment/callback/route.ts` | ✏️ Purchase + Subscribe ayrı eventId |
| `src/app/api/payment/course/callback/route.ts` | ✏️ CAPI Purchase ekle |

**`sphere-english-app` reposu:**

| Dosya | İşlem |
|---|---|
| `lib/db/src/schema/ebooks.ts` | ✏️ 4 yeni nullable kolon + migration |
| `artifacts/api-server/src/routes/ebook-purchase.ts` | ✏️ pre-create'te meta alanlarını kaydet, lookup'ta döndür |

**GTM:** konteyner `GTM-TTDMJ8HH` — Meta/Facebook tag'lerini denetle ve duraklat.
