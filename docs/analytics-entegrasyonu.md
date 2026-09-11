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
| Google Ads (`AW-816642529`) | `GoogleAds.tsx` + `GoogleAdsConversion.tsx` (Ads'e **doğrudan** dönüşüm) | ⚠️ Karar gerektirir — bkz. adım 6, naif import web'i iki kez saydırır |
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

> Google tarafının **tek blokajı** budur. Bu boş olduğu sürece GA4'e hiçbir event
> gitmez ve hata da alınmaz (`isConfigured()` false → iş kuyruğa hiç girmez).

**Site:** [analytics.google.com](https://analytics.google.com)

1. Sol altta **⚙️ Yönetici** (Admin)
2. Üstteki property seçicide **`G-ED6DZ66SH6`** olan property'nin seçili olduğunu doğrulayın
3. **Veri toplama ve değiştirme** (Data collection and modification) → **Veri akışları** (Data streams)
4. Listede MEASUREMENT ID kolonunda `G-ED6DZ66SH6` yazan **web akışına** tıklayın
5. Açılan panelde aşağı kaydırın → **Measurement Protocol API secrets**
   (Türkçe arayüzde de İngilizce kalır)
6. **Oluştur** (Create) → Takma ad: `Mobile App` → **Oluştur**
7. **Gizli değer** (Secret value) kolonundaki ~22 karakterlik değeri kopyalayın

**Gereken yetki:** property üzerinde *Düzenleyen* (Editor) veya üstü. Secret
listede kalıcı durur, sonra da kopyalayabilirsiniz.

**Nereye:** sunucu `backend/.env` → `GA4_API_SECRET=<değer>`

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

Token `.env`'de dolu ama frontend'de **üretilmiş ve hiç kullanılmamış**; kişisel
kullanıcı token'ıysa 60 günde ölmüştür.

### 2a. Geçerliliği kontrol et

**Site:** [developers.facebook.com/tools/debug/accesstoken](https://developers.facebook.com/tools/debug/accesstoken/)

Token'ı yapıştırıp **Debug**'a basın. Şu üç satıra bakın:

| Alan | Olması gereken |
| --- | --- |
| `Valid` | `True` |
| `Expires` | **`Never`** — bir tarih yazıyorsa ölecek/ölmüş |
| `Scopes` | `ads_management` içermeli |

Terminalden de bakabilirsiniz:

```bash
cd backend && TOKEN=$(grep '^META_CAPI_ACCESS_TOKEN=' .env | cut -d= -f2-) && \
  curl -s "https://graph.facebook.com/v21.0/debug_token?input_token=$TOKEN&access_token=$TOKEN" | python3 -m json.tool
```

`"expires_at": 0` → süresiz, iyi.

### 2b. Ölüyse yeni üret

**Site:** [business.facebook.com/events_manager2](https://business.facebook.com/events_manager2)

1. Sol menü **Veri Kaynakları** (Data Sources)
2. Pixel **`246021789341141`**'i seçin
3. **Ayarlar** (Settings) sekmesi
4. Aşağı kaydırın → **Conversions API** bölümü
5. **Erişim belirteci oluştur** (Generate access token) linkine tıklayın

> Link görünmüyorsa manuel yol: **Business Settings** → **Kullanıcılar** →
> **Sistem Kullanıcıları** → yeni sistem kullanıcısı → `ads_management` yetkisi →
> **Varlık Ekle** ile pixel'i atayın → **Belirteç Oluştur**. Bu yol süresiz
> (System User) token verir, tercih edilen budur.

### 2c. Test Events kodunu al (doğrulama için)

Aynı Events Manager → pixel → **Test Events** sekmesi → **Test server events**
bölümündeki `TEST#####` kodunu kopyalayın.

**Nereye:** `META_CAPI_TEST_EVENT_CODE=TEST#####` — doğrulama bitince **boşaltın**,
yoksa event'ler sonsuza kadar yalnızca test ekranında kalır.

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

`backend/.env`'e adım 3'teki değerleri girdikten sonra sunucuda **üç komut** —
sadece `config:clear` yetmez:

```bash
php artisan config:clear
php artisan octane:reload     # Octane yapılandırmayı BELLEKTE tutar
php artisan queue:restart     # işçi ESKİ env ile çalışıyor, yeniden başlamalı
```

> **En sık atlanan yer burası.** `queue:restart` yapılmazsa işçi eski (boş)
> `GA4_API_SECRET` ile çalışmaya devam eder ve GA4'e hiçbir şey gitmez.

### Kuyruk gerçekten işleniyor mu

`QUEUE_CONNECTION=database` olduğu için bekleyen işler tabloda görünür:

```sql
SELECT queue, COUNT(*) FROM jobs GROUP BY queue;
SELECT queue, COUNT(*) FROM failed_jobs GROUP BY queue;
```

`default` satırı sürekli büyüyüp hiç azalmıyorsa işçi o kuyruğu dinlemiyor.
Mevcut `LogProductSearchJob` da `default` kullandığı için muhtemelen dinleniyor.

`ANALYTICS_FORWARDING_ENABLED=false` acil durum şalteridir: kod deploy edilmiş
olsa bile dağıtımı tümden durdurur.

## 5. GA4'te custom dimension tanımla — 2 dakika

Uygulama trafiğini web'den ayırabilmek için:

**Site:** [analytics.google.com](https://analytics.google.com)

1. **⚙️ Yönetici** → **Veri görüntüleme** (Data display) → **Özel tanımlar** (Custom definitions)
2. **Özel boyut oluştur** (Create custom dimension)
3. Boyut adı: `App platform`
4. Kapsam (Scope): **Etkinlik** (Event)
5. Etkinlik parametresi (Event parameter): **`app_platform`** — birebir bu yazım
6. **Kaydet**

> Custom dimension geçmişe dönük çalışmaz; veri toplanmaya başladıktan sonraki
> günleri raporlar.

## 6. Google Ads — ⚠️ ACELE ETMEYİN, karar gerektirir

Bu adım mekanik değil; yanlış yapılırsa **Google Ads raporunuzu bozar.**

### Frontend'in Ads kurulumu GA4'ten bağımsız

Web, `/odeme-basarili` sayfasında **iki ayrı** event atıyor:

| Ne | Nereden | Nereye |
| --- | --- | --- |
| `gtag('event','purchase')` | `PaymentSuccessful.tsx:707` | GA4 |
| `gtag('event','conversion', {send_to:'AW-816642529/d2YmCP…'})` | `GoogleAdsConversion.tsx` → `odeme-basarili/page.tsx:21` | **Google Ads'e DOĞRUDAN** |

İkincisi Ads'te doğrudan oluşturulmuş bir **"web sitesi" dönüşüm işlemi**.
GA4↔Ads bağlantısıyla hiç ilgisi yok. Yani "frontend Ads kullanıyor" demek
"GA4↔Ads bağlantısı var" demek değildir — ikisi bağımsız mekanizma.

### Naif import web dönüşümlerini İKİ KEZ saydırır

GA4 `purchase` event'ini Ads'e dönüşüm olarak içe aktarırsanız, bir web satın
alması Ads'e **iki yoldan** girer: mevcut doğrudan AW tag'i **ve** GA4 import'u.
Web her ikisini de aynı sayfada ateşlediği için çakışma kesin.

### Seçenekler

**A — Hiçbir şey yapma (önerilen).** Ads'te bugünkü düzen korunur, web dönüşümleri
doğru sayılmaya devam eder. Uygulama satın almaları Ads'te dönüşüm olarak
görünmez — ama **GA4'te görünür**, yani ölçüm kaybı yok, yalnızca Ads teklif
verme tarafında uygulama atfı olmaz. Risk sıfır.

**B — Import et + mevcut AW işlemini "İkincil"e çek.** Uygulama ve web tek
kaynaktan (GA4) sayılır. Google'ın önerdiği yol da bu: bir dönüşüm için tek
kaynak. Mevcut AW tag'i raporda kalır, teklif vermede kullanılmaz.
**Dikkat:** canlı reklam teklif verme davranışını değiştirir.

**C — Import et + frontend'den AW tag'ini kaldır.** En temiz sonuç ama frontend'e
dokunmak gerekir ve geçiş gününde veri boşluğu oluşur.

### Karar sizin değil benim değil — reklam ekibinin

B ve C canlı kampanya performansını etkiler. Uygulama satın almalarının Ads
teklif verme tarafına gerçekten girmesi isteniyorsa B'yi reklam ekibiyle
konuşun. Aksi halde **A'da kalın**; GA4 ve Meta entegrasyonu buna ihtiyaç
duymuyor.

### Sadece bağlantıyı görmek isterseniz (salt okunur, zararsız)

[analytics.google.com](https://analytics.google.com) → **⚙️ Yönetici** →
**Ürün bağlantıları** → **Google Ads bağlantıları** → `816642529` listede mi?
Bakmak bir şey değiştirmez; **Bağla**'ya basmak da tek başına dönüşüm
saydırmaz (import ayrı adımdır). Riskli olan Ads tarafındaki import'tur.

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
