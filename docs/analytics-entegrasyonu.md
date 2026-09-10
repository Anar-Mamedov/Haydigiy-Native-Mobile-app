# Analytics entegrasyonu (GA4 + Meta Pixel + kendi collector'ımız)

Web (`frontend`) tarafında beş ayrı ölçüm hattı var; mobil uygulamada bunlardan
yalnızca Insider kuruluydu. Bu doküman mobil tarafta **ne yapıldığını** ve
**GA4/Meta'yı canlıya almak için kalan tek adımı** anlatır.

## Web ↔ mobil durum tablosu

| Hat | Web'deki yer | Mobil durumu |
| --- | --- | --- |
| Insider | `components/analytics/InsiderScript.tsx` + `InsiderInit.tsx` | ✅ Tam — `docs/insider-events.md` |
| HaydiGiy kendi collector'ı | `src/lib/analytics.ts` → `/analytics/events/batch` | ✅ Tam — bu doküman |
| Google Analytics 4 (`G-ED6DZ66SH6`) | `layout.tsx` + `src/lib/ga4.ts` | ✅ Kod tamam — env değerleri bekliyor |
| Meta Pixel (`246021789341141`) | `components/analytics/FacebookPixel.tsx` (yalnızca `PageView`) | ✅ Kod tamam — env değerleri bekliyor |
| Google Ads (`AW-816642529`) | `GoogleAds.tsx` + `GoogleAdsConversion.tsx` | ✅ GA4↔Ads bağlantısından otomatik gelir, kod gerekmez |
| Google Tag Manager (`GTM-NZ79DJB`) | `layout.tsx` | ❌ Mobilde karşılığı yok — GTM tarayıcı DOM'una bağlıdır |

## Neden web'in kodu native'de çalışmaz

`gtag.js` ve `fbevents.js` `window`/DOM gerektirir; React Native'de ikisi de
yoktur. Native'de üç seçenek var:

1. **Native SDK** (Firebase Analytics + Meta SDK) — GA4 tarafında **ayrı bir app
   data stream** açar, yani web ile aynı raporda birleşmez. Ayrıca iOS için
   `GoogleService-Info.plist` ve Meta App ID + Client Token gerektirir; ikisi de
   projede yok. Bu proje Firebase'i ürün olarak kullanmıyor (repodaki
   `google-services.json` yalnızca Insider push'unun FCM taşıyıcısı içindir).
2. **Sunucu tarafı HTTPS** — GA4 Measurement Protocol ve Meta Conversions API,
   web'in kullandığı **aynı** `measurement_id` ve **aynı** Pixel ID'yi kabul
   eder. Mobil event'ler web ile aynı property/pixel'e düşer.
3. **İstemciden doğrudan HTTPS** — GA4 `api_secret` ve Meta CAPI access token'ı
   uygulama paketine gömmek gerekir. **Yapılmadı ve yapılmamalı:** APK/IPA açılıp
   token okunabilir; o token'la üçüncü bir taraf pixel'e sahte dönüşüm basıp
   reklam optimizasyonunu bozabilir.

Seçilen yol **2**: mobil uygulama sırsız olarak kendi API'mize yazar, dağıtımı
backend yapar.

```text
Mobil uygulama ──(sır yok, public uç)──> /api/analytics/events/batch
                                                │
                                                ├──> ClickHouse (mevcut davranış)
                                                ├──> GA4 Measurement Protocol
                                                └──> Meta Conversions API
```

## Mobil taraftaki mimari

```text
src/features/analytics/
  types/analytics.types.ts            # Domain event sözleşmesi (ayrık birleşim)
  services/
    analytics-sink.ts                 # AnalyticsSink arayüzü + AnalyticsContext
    analytics-dispatcher.ts           # Fan-out, izin kapısı, hata yalıtımı, sıra garantisi
    analytics-consent.ts              # KVKK kapısı (varsayılan: izin yok)
    analytics-session.ts              # anonymous_id (kalıcı) + session_id (30 dk TTL)
    analytics-device.ts               # deviceType / os / uygulama sürümü / ekran
    first-party.sink.ts               # Kendi collector'ımız — kuyruk + batch
    first-party.mapper.ts             # Domain event → backend DTO
  utils/
    analytics-product.mapper.ts       # Product / CartLineItem → AnalyticsProduct
    analytics-identity.ts             # User → AnalyticsIdentity (user_id normalize)
  hooks/                              # Ekran seviyesindeki tetikleyiciler
  components/analytics-integration.tsx # Kökte: rota ölçümü, kimlik bağlama, flush
src/services/analytics.service.ts     # Uç tanımı + DTO
```

Ekranlar ve mutasyonlar **yalnızca** `analytics.track({ name: '…' })` çağırır.
Hangi sağlayıcının hangi alanı hangi isimle beklediği sink'lerin içindedir.

**Yeni bir sağlayıcı eklemek** = yeni bir `AnalyticsSink` dosyası + dispatcher'ın
`sinks` listesine bir satır. Çağrı yerlerinin hiçbiri değişmez.

### Güvence altına alınan davranışlar

- **İzin kapısı** — Kullanıcı çerez sayfasını cevaplamadan hiçbir event gitmez.
  Ölçüm sink'leri `analytics`, reklam/dönüşüm sink'leri `marketing` iznine bağlıdır.
  Dispatcher ilk event'i, kayıtlı tercih bellekten okunana kadar bekletir.
- **Hata yalıtımı** — Bir sağlayıcının patlaması diğerlerini durdurmaz ve
  uygulama akışını hiç etkilemez. Hatalar sessizce yutulmaz, log'a düşer.
- **Sıra garantisi** — Bağlam çözümü asenkron olduğu hâlde event'ler üretildikleri
  sırada gider (`add_to_cart` ile `purchase_completed` yer değiştiremez).
- **Arka plana geçişte boşaltma** — RN'de `sendBeacon` yoktur; `AppState`
  değişiminde kuyruk zorla gönderilir, yoksa son 5 saniyelik event'ler kaybolur.
- **Kimlik** — `user_id` her event'e işlenir; kalıcı oturum açılışta yeniden bağlanır.

## Event haritası

Event adları web `src/lib/analytics.ts` ile birebir aynı tutulmuştur; mobil ve
web aynı ClickHouse tablosunda tek raporla okunabilir.

| Domain event | Collector `event_name` | Tetik noktası | GA4 karşılığı | Meta karşılığı |
| --- | --- | --- | --- | --- |
| `screen_viewed` | `page_viewed` | Her rota değişimi (`use-analytics-screen-tracking`) | `page_view` | `PageView` |
| `product_viewed` | `product_viewed` | `use-product-detail-controller` — ürün başına bir kez | `view_item` | `ViewContent` |
| `category_viewed` | `category_viewed` | `product-list-screen` — arama sonuçları hariç | — | — |
| `search_performed` | `search_performed` | `product-list-screen` — sonuç sayısı gelince | — | `Search` |
| `filter_applied` | `filter_applied` | (sözleşme hazır, çağrı yeri henüz bağlanmadı) | — | — |
| `add_to_cart` | `add_to_cart` | `useAddToCartMutation` + `useAddBundleToCartMutation` başarısı | `add_to_cart` | `AddToCart` |
| `remove_from_cart` | `remove_from_cart` | `useRemoveCartItemMutation` / `useRemoveBundleMutation` başarısı | — | — |
| `cart_cleared` | `cart_cleared` | `useClearCartMutation` başarısı + son satırın silinmesi | — | — |
| `add_to_wishlist` | `add_to_wishlist` | `useAddFavoriteMutation` başarısı | `add_to_wishlist` | `AddToWishlist` |
| `remove_from_wishlist` | `remove_from_wishlist` | `useRemoveFavoriteMutation` başarısı | — | — |
| `checkout_started` | `checkout_started` | `checkout-screen` dolu sepetle açılınca bir kez | `begin_checkout` | `InitiateCheckout` |
| `payment_result` | `payment_result` | Başarı ekranı + `payment-failed-screen` (`success` / `failed` / `pending`) | — | — |
| `purchase_completed` | `purchase_completed` | `use-payment-success` — Kapıda Ödeme, Garanti 3D, İyzico 3DS | `purchase` | `Purchase` |
| `user_signed_up` | `user_signed_up` | `otp-verification` — yeni hesap | `sign_up` | `CompleteRegistration` |
| `user_logged_in` | `user_logged_in` | `useAuthStore.login` | `login` | — |
| `user_logged_out` | `user_logged_out` | `useAuthStore.logout` + süresi dolan oturum | — | — |

### Web'den bilinçli olarak taşınmayanlar

Web `src/lib/analytics.ts` içindeki tıklama ısı haritası (`initClickTracking`),
scroll derinliği (`initScrollTracking`) ve exit-intent (`initExitIntent`)
ölçümleri **mobilde yok**: üçü de fare imleci ve DOM olaylarına dayanıyor,
native'de karşılıkları bulunmuyor.

### Web'de olmayıp mobilde eklenenler

`payment_result`, `cart_cleared` ve `filter_applied`. AGENTS.md'nin istediği
ticaret sözlüğünü (ödeme sonucu, filtre kullanımı) tamamlamak için eklendi.

## Web ile davranış farkı: izin

Web tarafında `src/lib/analytics.ts` izin durumuna **bakmadan** event gönderiyor.
Mobil taraf çerez tercihine uyar (`analytics` izni kapalıysa event gitmez).
Bu bilinçli bir tercih: mobilde KVKK aydınlatma sayfası (`CookieConsentGate`)
zaten var ve cevabına uymamak onu anlamsız kılardı. Webde de aynı davranışın
istenmesi hâlinde bu, web tarafında ayrı bir iş kalemidir.

## Backend dağıtımı (yazıldı)

`AnalyticsEventController` event'i Redis buffer'ına yazdıktan sonra
`AnalyticsForwarder`'ı çağırır; o da hedef başına birer kuyruk işi başlatır.

```text
backend/
  config/analytics.php                              # GA4 + Meta ayarları
  app/Services/Analytics/
    AnalyticsForwarder.php                          # Tek giriş noktası: neyi kime göndereceğine karar verir
    AnalyticsEventMap.php                           # Event sözlüğü + uygulama trafiği tespiti
    Ga4EventBuilder.php                             # Event → GA4 MP gövdesi (saf)
    Ga4MeasurementProtocolClient.php                # HTTP + ziyaretçi bazlı gruplama
    MetaEventBuilder.php                            # Event → Meta CAPI girdisi (saf)
    MetaConversionsApiClient.php                    # HTTP + test_event_code
    MetaUserDataResolver.php                        # user_id → SHA-256'lı e-posta/telefon
  app/Jobs/
    ForwardAnalyticsToGa4Job.php
    ForwardAnalyticsToMetaJob.php
```

### Hedef başına ayrı iş — neden

GA4'ün Meta'daki `event_id` gibi bir mükerrerlik koruması **yok**. İki hedef tek
işte olsaydı, GA4 başarılı olup Meta patladığında yeniden deneme GA4'e aynı
event'i ikinci kez gönderirdi. Ayrı işler bağımsız retry alır.

### Çift sayım koruması — en kritik nokta

Web tarayıcısı `gtag.js` ve `fbevents.js` ile event'ini **kendisi** gönderiyor
ve **aynı zamanda** `/analytics/events/batch`'e de yazıyor. Backend her iki
kaynağı iletseydi her web dönüşümü iki kez sayılırdı.

Ayrım `browser` alanından yapılır: uygulama `"HaydiGiy App <sürüm>"`, web ise
tarayıcı adını (`Chrome`, `Safari`, …) gönderir. `AnalyticsEventMap::isAppEvent`
yalnızca ilkini geçirir.

> **Çapraz repo sözleşmesi:** Bu etiket mobil tarafta
> `first-party.mapper.ts` → `buildClientLabel` içinde üretilir. Biri
> değişirse diğeri de değişmek zorundadır.

### Eşlenmeyen event'ler

`cart_cleared`, `remove_from_wishlist`, `payment_result`, `user_logged_out` ve
`filter_applied` GA4/Meta'ya **gitmez** — standart sözlüklerinde karşılıkları
yok, custom event olarak gönderilseler kitle/optimizasyon tarafında işe
yaramazlar. Bu event'ler kendi collector'ınızda (ClickHouse) durmaya devam eder.

### GA4 tarafındaki incelikler

- `client_id`, `anonymous_id`'den **deterministik** türetilir (`crc32` çifti).
  Rastgele/zaman bazlı bir parça eklenirse aynı ziyaretçi her event'te yeni
  kullanıcı sayılırdı.
- `session_id` ve `engagement_time_msec` her event'te gönderilir; GA4 bunlar
  olmadan event'i raporların çoğunda göstermez.
- Aynı ziyaretçinin event'leri tek istekte birleştirilir (MP gövdesinde
  `client_id` event seviyesinde değil), istek başına en fazla 25 event.
- `purchase` için `transaction_id` zorunlu; sipariş numarası sayısal değilse
  `properties.raw_order_id`'den okunur.

### Meta tarafındaki incelikler

- `user_data` içinde **en az bir** eşleşme alanı zorunlu, yoksa event tümden
  reddedilir. Misafirde e-posta/telefon olmadığı için `external_id`
  (`sha256(anonymous_id)`) her zaman gönderilir.
- E-posta/telefon mobil uygulamadan **gelmez**: uygulama yalnızca `user_id`
  gönderir, backend kendi veritabanından okuyup SHA-256'lar. Kişisel veri ölçüm
  ucundan hiç geçmez ve ClickHouse'a yazılmaz.
- `event_id` deterministiktir (satın almada sipariş numarası), böylece kuyruk
  yeniden denemesi mükerrer dönüşüm üretmez.
- 4xx yeniden denenmez (geçersiz token/şema), 5xx denenir.

## Testler

`src/features/analytics` altında 9 suite / 128 test:

- `analytics-dispatcher.test.ts` — izin kapısı, sink yalıtımı, sıra, kimlik, flush
- `first-party.sink.test.ts` — batch eşiği, zamanlayıcı, kuyruk sınırı, hata raporlama
- `first-party.mapper.test.ts` — kolon/`properties` ayrımı, tam sayı zorlaması
- `analytics-session.test.ts` — kalıcı `anonymous_id`, 30 dk kayan oturum penceresi
- `analytics-consent.test.ts` — varsayılan ret, kısmi izin, depo hatası
- `use-analytics-commerce-tracking.test.ts` — tek event garantileri
- `analytics-product.mapper.test.ts` / `analytics-identity.test.ts` / `analytics-device.test.ts`

Backend'de 84 test (`backend/tests/.../Analytics`):

- `AnalyticsEventMapTest` — uygulama/web ayrımı (çift sayım koruması), event sözlüğü
- `Ga4EventBuilderTest` — `client_id` kararlılığı, oturum parametreleri, `transaction_id`, satır toplamı
- `MetaEventBuilderTest` — `action_source: app`, `external_id` garantisi, `event_id` kararlılığı, ham PII sızmadığı
- `MetaUserDataResolverTest` — e-posta/telefon normalizasyonu ve hash
- `AnalyticsForwarderTest` — hangi durumda hangi işin kuyruğa gireceği
- `AnalyticsHttpClientsTest` — istek URL'leri, ziyaretçi gruplama, 25 event sınırı, test kodu, 4xx/5xx davranışı

---

# Sizin yapacaklarınız (adım adım)

Mobil taraf bitti, sizden bir şey gerekmiyor. Aşağıdakiler GA4 + Meta'yı canlıya
almak için kalan işler. **Sıra önemli:** 1 ve 2 olmadan 4 çalışmaz.

## 1. GA4 API secret oluştur — 2 dakika

1. [analytics.google.com](https://analytics.google.com) → **Admin** (sol altta dişli)
2. **Data streams** → `G-ED6DZ66SH6` olan web stream'ini aç
3. Aşağıda **Measurement Protocol API secrets** → **Create**
4. Nickname: `Mobile App`, oluştur, **secret değerini kopyala**

> **Bilmeniz gereken kısıt:** GA4'te iOS/Android data stream'i açmak Firebase
> zorunlu kılıyor. Firebase kullanmadığımız için uygulama event'leri **web
> stream'ine** düşecek, yani GA4 raporunda platform "web" görünecek. Ayırt etmek
> için event'lere `app_platform` (`ios` / `android`) parametresi göndereceğiz;
> adım 5'te bunu custom dimension olarak tanımlıyorsunuz.
>
> Mobil tarafta ek bir iş yok: uygulama zaten `os: "iOS 18.2"` ve
> `browser: "HaydiGiy App 2.3.24"` alanlarını gönderiyor, backend `app_platform`
> değerini bunlardan türetir (uygulama trafiğini web'den ayıran işaret `browser`).

## 2. Meta CAPI token'ını doğrula — 3 dakika

Elinizdeki `EAADKk...` token'ın hâlâ geçerli ve **uzun ömürlü** olması gerekiyor
(kişisel kullanıcı token'ları 60 günde ölür).

1. [business.facebook.com/events_manager](https://business.facebook.com/events_manager)
2. **Data Sources** → Pixel `246021789341141` → **Settings**
3. **Conversions API** bölümü → **Generate access token**
   (System User token üretir, süresizdir — mevcut token'ın kaynağı buysa değiştirmeyin)
4. Aynı sayfada **Test Events** sekmesine gidin ve **`test_event_code`** değerini kopyalayın
   — canlıya almadan önce event'lerin geldiğini burada göreceğiz

## 3. Backend env değerlerini gir — 1 dakika

`backend/.env` içine (mobil `.env`'e **değil**):

```dotenv
GA4_MEASUREMENT_ID=G-ED6DZ66SH6
GA4_API_SECRET=<adım 1'den>
META_PIXEL_ID=246021789341141
META_CAPI_ACCESS_TOKEN=<adım 2'den>
META_CAPI_TEST_EVENT_CODE=<adım 2'den, canlıya geçince silinecek>
```

## 4. Backend'i deploy et

Kod yazıldı (yukarıdaki "Backend dağıtımı" bölümü). Sizin yapacağınız:

1. `backend/.env`'e adım 3'teki değerleri girin
2. `php artisan config:clear`
3. Kuyruk işçisinin çalıştığını doğrulayın — event'ler kuyrukta işleniyor
   (`ANALYTICS_FORWARDING_QUEUE`, varsayılan `default`)

`ANALYTICS_FORWARDING_ENABLED=false` acil durum şalteridir: kod deploy edilmiş
olsa bile dağıtımı tümden durdurur.

## 5. GA4'te custom dimension tanımla — 2 dakika

Uygulama trafiğini web'den ayırabilmek için:

1. GA4 → **Admin** → **Custom definitions** → **Create custom dimension**
2. Dimension name: `App platform`, Scope: **Event**, Event parameter: `app_platform`
3. Kaydet

> Custom dimension geçmişe dönük çalışmaz; veri toplanmaya başladıktan sonraki
> günleri raporlar.

## 6. Google Ads bağlantısını kontrol et — 2 dakika

`AW-816642529` için ayrı kod yazılmıyor; dönüşümler GA4'ten akıyor.

1. GA4 → **Admin** → **Product links** → **Google Ads links**
2. `816642529` hesabının bağlı olduğunu doğrulayın (bağlı değilse **Link**)
3. Google Ads → **Goals** → **Conversions** → **Summary** → **New conversion action**
   → **Import** → **Google Analytics 4 properties** → `purchase` event'ini içe alın

## 7. Doğrulama — canlıya almadan önce

| Ne kontrol edilecek | Nerede |
| --- | --- |
| Kendi collector'ınıza event düşüyor mu | ClickHouse: `browser = 'HaydiGiy App 2.3.24'` olan satırlar |
| GA4'e event düşüyor mu | GA4 → **Reports** → **Realtime** (30 sn içinde görünür) |
| Meta'ya event düşüyor mu | Events Manager → Pixel → **Test Events** sekmesi |
| Google Ads dönüşümü | Ads → Conversions → durum "Recording conversions" olmalı |

### ⚠️ Test ederken en sık düşülen tuzak

Uygulama **çerez izni verilmeden hiçbir event göndermez.** Test cihazında
açılışta çıkan KVKK sayfasında **"Tümünü Kabul Et"**e basın, yoksa hiçbir yerde
veri görmezsiniz ve entegrasyonun bozuk olduğunu düşünürsünüz.

Uygulamayı daha önce açıp reddettiyseniz: uygulamayı silip yeniden kurun ya da
Profil → Çerez Tercihleri'nden izni açın.

## 8. Uygulamayı native'de gözden geçir

Kod dokunduğu için şu üç akışı iOS/Android'de bir kez deneyin — ölçüm değil,
**akış bozulmadı mı** diye:

1. Ürün detay → beden seç → sepete ekle
2. Sepet → satır sil → sepeti temizle
3. Ödeme ekranını aç → siparişi tamamla → başarı ekranı

## Bu yolun bilmeniz gereken iki sınırı

1. **Install attribution ve deferred deep link yok.** Sunucu taraflı ölçüm
   dönüşüm ve retargeting verir; "App Install" kampanyası yürütmek isterseniz
   Meta App ID + Meta SDK ayrıca gerekir.
2. **Misafir kullanıcılarda Meta eşleşme kalitesi düşük olacak.** SDK olmadığı
   için reklam kimliği (`madid`) gönderilemiyor; eşleşme hash'li e-posta/telefona
   dayanıyor, yani **oturum açmış** kullanıcılarda iyi, misafirlerde zayıf.
