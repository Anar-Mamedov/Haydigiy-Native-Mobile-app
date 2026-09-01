# Insider event ve attribute entegrasyonu

Insider ekibinin bildirdiği eksik event/attribute aktarımı bu projede tamamlandı.
Tüm eventler `src/features/insider` altındaki tracker üzerinden gönderilir; SDK
yüklü değilse (ör. Expo Go) çağrılar sessizce atlanır ve uygulama akışı asla
bozulmaz.

## Mimari

- `services/insider-tracker.ts` — Domain-facing analytics API'si (`insiderTracker`).
  SDK yükleme, ürün objesi kurma ve hata izolasyonu bu sınırın arkasındadır.
- `utils/insider-product.mapper.ts` — `Product` / `CartLineItem` → Insider ürün
  snapshot'ı (`InsiderProductInput`) dönüşümleri; taxonomy fallback'i `Giyim`,
  para birimi `TRY`.
- `hooks/use-insider-page-tracking.ts` — Sayfa görüntüleme hook'ları (odak
  başına tek event, veri hazır olunca tetiklenir).

## Event haritası

| Insider gereksinimi | SDK metodu | Uygulamadaki tetik noktası |
| --- | --- | --- |
| Ana sayfa ziyareti | `visitHomePage` | `home-screen.tsx` — ana sayfa sekmesi her odaklandığında |
| Kategori sayfası görüntüleme | `visitListingPage(taxonomy)` | `product-list-screen.tsx` — `kategori/[slug]` listesi yüklendiğinde (arama sonuçları hariç) |
| Ürün detay görüntüleme | `visitProductDetailPage(product)` | `product-detail-screen.tsx` — tam ürün verisi geldiğinde, ürün başına bir kez |
| Sepet görüntüleme | `visitCartPage(products)` | `cart-screen.tsx` — sepet senkronu tamamlanınca, ziyaret başına bir kez |
| Favori listesi görüntüleme | `visitWishlistPage(products)` | `favorites-screen.tsx` — liste yüklenince, ziyaret başına bir kez |
| Sepete ürün ekleme | `itemAddedToCart(product)` | `useAddToCartMutation` başarısı — ürün detay, favoriler, yorum/soru ekranları ve sipariş "tekrar satın al" |
| Sepetten ürün çıkarma | `itemRemovedFromCart(productID)` | `useRemoveCartItemMutation` başarısı (son satır silinirse ek olarak `cartCleared`) |
| Sepeti temizleme | `cartCleared` | `useClearCartMutation` başarısı |
| Favoriye ürün ekleme | `itemAddedToWishlist(product)` | `useAddFavoriteMutation` başarısı (ürün kalbi + sepetten favoriye taşı) |
| Favoriden ürün çıkarma | `itemRemovedFromWishlist(productID)` | `useRemoveFavoriteMutation` başarısı |
| Satın alma (Purchase) | `itemPurchased(saleID, product)` | `use-payment-success.ts` — Kapıda Ödeme, Garanti 3D ve İyzico 3DS akışlarının tamamı; sipariş satırı başına bir event, `saleID` = sipariş no |
| Kayıt olma (sign_up) | `signUpConfirmation` | `otp-verification.tsx` — kayıt OTP onayı ve hızlı girişte yeni hesap oluşturma |
| Yorum yapan kullanıcı | `tagEvent('yorum_yapildi')` | `useSubmitReviewMutation` başarısı |
| Oturum açma | `tagEvent('user_login')` | `useAuthStore.login` — şifre ile giriş, OTP ve kayıt sonrası otomatik oturum |
| Oturum kapatma | `tagEvent('user_logout')` | `useAuthStore.logout` (kullanıcı çıkışı) ve `setUser(null)` (süresi dolan oturum) |

Satın alma satırları, ödeme başarı ekranı açıldığında sepet çoktan boşalmış
olabileceği için sipariş gönderilirken alınan snapshot'tan okunur
(`features/checkout/utils/purchase-snapshot.ts`, tek seferlik `consume`).

### Snapshot neden MMKV'ye de yazılıyor

3D Secure sırasında kullanıcı SMS kodu için uygulamadan çıkar. **Android arka
plandaki süreci iOS'a göre çok daha agresif öldürür**; dönüşte uygulama sıfırdan
başlarsa JS modül state'i (ve dolayısıyla yalnızca bellekte tutulan snapshot)
kaybolur. Yedek yol olan sepet de işe yaramaz: `OrderService` sipariş
kesinleştiğinde `Cart` satırlarını siler, `CartHydrator` açılışta sepeti çeker ve
store'a boş liste yazar. Sonuç: `purchasedItems` boş kalır ve **satın alma
eventi hiç atılmaz** — üstelik sipariş başarıyla oluşmuş olur.

Bu yüzden snapshot MMKV'ye de yazılır ve süreç yeniden başlasa bile geri
okunabilir. Satırlarda kart/kimlik verisi yoktur, dolayısıyla SecureStore değil
MMKV doğru katmandır. Yarım kalan bir ödemenin satırları çok sonraki bir
siparişe iliştirilmesin diye kayıt 6 saat sonra geçersiz sayılır.

Regresyon testi: `purchase-snapshot.test.ts` → "survives a process restart
through the persisted copy".

## Ürün objesi parametreleri

`createNewProduct` zorunlu alanları (`productID`, `name`, `taxonomy`,
`imageURL`, `price`, `currency`) dışında şu opsiyonel alanlar gönderilir:
`salePrice`, `quantity`, `stock`, `size`, `color`, `brand`, `productURL`.

`color`, Insider ekibinin kampanya kurulumunu kolaylaştırmak için istediği
alandır. Zincir tek yönlüdür ve veri hangi katmanda varsa oradan beslenir:

| Kaynak | Alan | Durum |
| --- | --- | --- |
| Arama/liste (Elasticsearch) | `color: { name }` + `color_name` | ✅ gelir, `Product.color` alanına maplenir |
| Sepet satırı (`/cart`) | `product.color` / `product.color_name` | ⏳ backend henüz döndürmüyor; okuma hazır |
| Ürün detay (`/product/{slug}`) | `color` ilişkisi | ⏳ eager-load edilmiyor, yalnızca `color_id` geliyor |

Renk bulunamazsa `setColor` hiç çağrılmaz; Insider ürün objesinde alan yer
almaz (uydurma değer segmentasyonu bozar). Detay ve sepet uçları renk adını
döndürmeye başladığında mobil tarafta ek değişiklik gerekmez.

## Kullanıcı attribute'ları ve kimlik

`useAuthStore` üzerinden tüm oturum yolları kapsanır:

- **Login / kayıt / hızlı giriş / profil güncelleme** → `insiderTracker.identifyUser(user)`:
  - Identifier'lar: `addUserID` (CRM id), `addEmail`, `addPhoneNumber` →
    `getCurrentUser().login(identifiers)`.
  - Attribute'lar: `setName`, `setSurname`, `setEmail`, `setPhoneNumber`
    (E164: `+90…`), `setLanguage('tr_TR')`, `setLocale('tr_TR')`.
- **Uygulama açılışı (kalıcı oturum)** → `InsiderIdentitySync` →
  `identifyUser(user)`.
- **Logout ve süresi dolan oturum** → `getCurrentUser().logout()`.

### Kimlik kuralları (yanlış profile yazılmayı önleyen üç kural)

1. **`addUserID` String almalı.** SDK identifier'ları `typeof === 'string'`
   kontrolünden geçirir ve başka tipte geleni yalnızca `console.warn` ile
   sessizce düşürür (`react-native-insider/src/InsiderIdentifier.js`). Backend
   `user.id`'yi JSON **number** döndürdüğü için `User.id: string` sözleşmesi
   runtime'da tutmaz. `toInsiderIdentifierValue` değeri sınırda normalize eder;
   aksi halde CRM kimliği hiç gitmez ve profil yalnızca e-posta/telefon ile
   eşleşmeye çalışır.
2. **Önce `login()`, sonra attribute.** Attribute'lar o an aktif olan profile
   yazılır. Kimlik önce bildirilmezse isim/e-posta/telefon anonim ya da cihazda
   daha önce tanıtılmış başka bir kullanıcının profiline düşer.
3. **Açılışta kimlik tazelenir.** Zustand `persist` oturumu MMKV'den geri
   yüklerken `login`/`setUser` çalışmaz; kimlik yalnızca native SDK'nın kendi
   kalıcı kaydına bağlı kalırdı. O kayıt sıfırlandığında (yeniden kurulum,
   uygulama verisinin temizlenmesi, `logout()` tetikleyen geçici bir token okuma
   hatası) oturum sessizce anonim devam ediyor ve **satın alma dahil tüm
   eventler anonim profile düşüyordu**. `InsiderIdentitySync` açılışta bir kez
   `identifyUser` çağırarak bu boşluğu kapatır.

Hiçbir identifier üretilemiyorsa (id, e-posta ve telefonun üçü de yoksa)
`login()` hiç çağrılmaz; kimliksiz bir login yalnızca login bayrağını açar,
birleştirilecek bir anahtar sağlamaz.

## user_login / user_logout custom eventleri

Insider ekibinin talebi üzerine oturum açma/kapatma ayrıca custom event olarak da
gönderilir. Her ikisi de `useAuthStore` üzerinden tetiklenir; ekranların ayrıca
event göndermesi gerekmez.

| Event | Parametre | Tip | Değerler |
| --- | --- | --- | --- |
| `user_login` | `logged_in` | Boolean | `true` |
| `user_login` | `login_method` | String | `password`, `otp`, `register` |
| `user_logout` | `logged_in` | Boolean | `false` |
| `user_logout` | `logout_reason` | String | `user`, `session_expired` |

`login_method` yalnızca çağıran taraf yöntemi bildirdiğinde gönderilir; bilinmiyorsa
parametre hiç eklenmez (uydurma değer segmentasyonu bozar).

**Sıralama iki yönde de kritiktir ve testlerle korunur:**

- `user_login`, `identifyUser` çağrıldıktan **sonra** gider — aksi halde event
  kimliksiz profile yazılır.
- `user_logout`, `clearUser` çağrılmadan **önce** gider — aksi halde kullanıcı
  çoktan anonimleşmiş olur.

Profil güncellemesi (`setUser(user)`) yalnızca attribute'ları tazeler, `user_login`
göndermez. Hesap silme akışı ortak `logout()` üzerinden gittiği için şu an
`logout_reason: 'user'` ile düşer; ayrı bir sebep isteniyorsa `InsiderLogoutReason`
tipine yeni değer eklemek yeterlidir.

## yorum_yapildi custom eventi

Insider event adları küçük Latin harfi ister; bu yüzden panelde/Test Lab'de
event **`yorum_yapildi`** adıyla tanımlanmalıdır ("yorum_yapıldı" değil).
Gönderilen parametreler:

| Parametre | Tip | Örnek |
| --- | --- | --- |
| `product_id` | String | `"1234"` |
| `rating` | Int | `5` |

Test Lab'de farklı parametre adı/tipi tanımlandıysa
`src/features/insider/services/insider-tracker.ts` içindeki
`trackReviewSubmitted` metodu tek noktadan güncellenebilir.

## Test Lab doğrulama adımları

1. Development/preview build ile Test Lab'e cihazı ekleyin (production partner:
   `haydigiyprod`).
2. Sırasıyla şu akışları gezin ve eventlerin düştüğünü doğrulayın: ana sayfa →
   kategori → ürün detay → sepete ekle → sepet → favoriye ekle/çıkar →
   favoriler sekmesi → satın alma (test siparişi) → sipariş detayından yorum.
3. Yeni bir telefonla kayıt olup `sign_up` eventini ve kullanıcı
   attribute'larını (isim, soyisim, telefon) kontrol edin.
4. Çıkış yapıp kullanıcının anonimleştiğini doğrulayın.

## iOS APNs production kontrol listesi

Kod tarafı hazır: `eas.json` içinde `preview`, `preview-apk` ve `production`
profilleri `INSIDER_APNS_MODE=production` gönderir; `app.config.js` bu değeri
`expo-insider-plugin`'in `mode` özelliğine geçirir ve plugin iOS
`aps-environment` entitlement'ını `production` yazar. (`ios/` klasörü gitignore
altındadır; EAS her build'de prebuild'i sunucuda yeniden çalıştırır. Yereldeki
`ios/` klasöründe `development` görünmesi yalnızca lokal çalıştırma içindir.)

Insider panelinde yapılması gerekenler:

1. Insider InOne > Settings > Mobile App Settings > Push Notification > iOS
   alanına **Production** APNs credential ekleyin. `.p8` Auth Key kullanılıyorsa
   aynı anahtar Sandbox + Production destekler; paneldeki ortam seçimini
   **Production** yapın.
2. `Key ID` ve `Team ID` değerlerini Apple Developer hesabındaki .p8 anahtarıyla
   karşılaştırın; Bundle ID tam olarak `com.faprika.haydigiy.app` olmalıdır.
3. Değişiklik sonrası App Store/TestFlight build'i yüklü bir cihaza Insider
   panelinden test push gönderin.

## InApp (uygulama içi pop-up) callback'leri

Insider SDK'sı `init` sırasında verilen callback üzerinden **yedi ayrı tip** yayınlar
(`react-native-insider/src/InsiderCallbackType`):

| Tip | Değer | Ne zaman gelir |
| --- | --- | --- |
| `NOTIFICATION_OPEN` | 0 | Push bildirimine tıklanınca |
| `INAPP_BUTTON_CLICK` | 1 | **InApp pop-up'ındaki butona tıklanınca** |
| `TEMP_STORE_PURCHASE` | 2 | InApp üzerinden satın alma |
| `TEMP_STORE_ADDED_TO_CART` | 3 | InApp üzerinden sepete ekleme |
| `TEMP_STORE_CUSTOM_ACTION` | 4 | InApp özel aksiyon |
| `INAPP_SEEN` | 5 | InApp gösterildiğinde |
| `SESSION_STARTED` | 6 | Oturum başladığında |

Uygulama yalnızca **yönlendirme taşıyan** tipleri işler: `NOTIFICATION_OPEN` ve
`INAPP_BUTTON_CLICK`. İkisi de aynı `ins_dl_internal` / `ins_dl_url_scheme` /
`ins_dl_external` alanlarını gönderdiği için tek bir çözümleyici kullanılır:
`utils/insider-url.ts` → `resolveInsiderCallbackAction`.

Daha önce handler `if (type !== 0) return;` yaptığı için InApp pop-up'ındaki butona
basıldığında **hiçbir şey olmuyordu** — SDK hedefi veriyordu ama callback sessizce
düşüyordu. Regresyon testi: `utils/insider-url.test.ts` → "InApp buton tıklamasında
da aynı yönlendirmeyi çözer".

Callback tipi sabitleri `types/insider.types.ts` içinde tanımlıdır (SDK Expo Go'da
yüklenemediği için statik import edilmiyor). Değerlerin SDK ile aynı kaldığını
`types/insider-callback-type.test.ts` gerçek SDK'ya karşı doğrular.

### InApp teşhis günlüğü

"InApp görünmüyor" şikâyeti iki bambaşka nedenden gelir ve dışarıdan ikisi aynı
görünür:

1. **InApp cihaza hiç ulaşmıyor** (kampanya yayında değil, hedef kitle tutmuyor,
   tetikleyici event eşleşmiyor) → SDK hiçbir callback yayınlamaz.
2. **InApp ulaşıyor ama çizilemiyor** → SDK `INAPP_SEEN` (tip 5) yayınlar.

SDK bu ayrımı yalnızca callback üzerinden verir ve uygulama yönlendirme
taşımayan tipleri sessizce atıyordu; hiçbir iz kalmıyordu.
`utils/insider-diagnostics.ts` artık `SESSION_STARTED`, `INAPP_SEEN` ve
`INAPP_BUTTON_CLICK` tiplerini tek satırlık log'a çevirir. Payload'da kişisel
veri olabileceği için **yalnızca alan adları** yazılır, değerler yazılmaz.

**`INAPP_SEEN` tek başına "gösterildi" demek değildir.** Insider'ın Block InApps
dokümanına göre gösterim anında engellenen InApp de `inapp_seen` gönderir ve bu
durum **`dismiss_type: 9`** ile işaretlenir. Bu yüzden `dismiss_type`,
`ins_camp_id` ve `ins_variant_id` değerleri log'a yazılır (üçü de kampanya
kimliği/enum, kişisel veri değil); diğer alanların yalnızca adı yazılır.

Cihaz log'unda `[Insider]` ile filtreleyin:

- `session başladı` yok → SDK init olmuyor.
- `session başladı` var, `INAPP_SEEN` yok → InApp cihaza ulaşmıyor (panel /
  kampanya tarafı).
- `INAPP_SEEN` + `ENGELLENDİ (dismiss_type=9)` → InApp ulaşıyor ama engelleniyor.
- `INAPP_SEEN` var, `dismiss_type` 9 değil, ekranda bir şey yok → render sorunu.

Not: `isDisplayInappEnabled` (SDK 6.6.0 ile gelen durum sorgulama metodu)
**React Native SDK'sında dışa açılmamıştır** — yalnızca native Android/iOS
tarafında var. Bu yüzden InApp'lerin açık olup olmadığı JS'ten sorgulanamıyor ve
`dismiss_type` dolaylı kanıt olarak kullanılıyor.

### SDK sürümü

`react-native-insider` **8.1.0-nh** (05.08.2026). `-nh` varyantı Huawei
servisleri olmadan derlenen sürümdür; projenin build'i buna bağlı olduğu için
düz `8.1.0`'a geçilmemelidir. Native SDK karşılıkları: iOS `InsiderMobile
15.1.2`, Android `16.0.9`. Native bağımlılık değiştiği için **EAS Update ile
gitmez, yeni build gerekir.**

### Doğrulanan kurulum şartları

| Şart | Durum |
| --- | --- |
| Uygulama InApp'leri kapatmıyor (`disableInAppMessages`, `disableTemplatesForIOS`, `removeInapp`, `setGDPRConsent(false)`, `setMobileAppAccess(false)`) | ✅ hiçbiri çağrılmıyor |
| iOS SDK varsayılanı (`Insider.h`: "Inapps are enabled by default") | ✅ açık |
| Android partner adı (`manifestPlaceholders`) | ✅ `haydigiyprod` |
| `android:allowBackup` **`false` olmamalı** | ✅ `true` |
| `INTERNET` + `ACCESS_NETWORK_STATE` izinleri | ✅ var |
| Callback tip sırası SDK ile aynı | ✅ `insider-callback-type.test.ts` doğruluyor |

### Bilinen sapma: init zamanlaması

Insider dokümanı SDK'nın mümkün olan **en erken** anda (iOS'ta
`didFinishLaunchingWithOptions` hemen ardından) başlatılmasını ister.
Bu projede `insiderClient.initialize` bir React `useEffect` içinden çalışır ve
`_layout.tsx` font yüklemesi bitene kadar `return null` verdiği için
`InsiderIntegration` o ana kadar mount **olmaz**. Yani init, native açılıştan
birkaç yüz milisaniye sonraya kayar.

Bunun InApp'leri tek başına engellediği kanıtlanmadı; ancak "uygulama tamamen
kapalıyken açılışta tetiklenen" InApp'ler için risk taşır. Düzeltilecekse
headless entegrasyonlar font kapısının üstüne alınmalıdır — bu, `router`
callback'i Stack mount olmadan tetiklenebileceği için ayrı bir doğrulama ister.

### InApp görüntülenmesini etkileyen ayarlar

Native tarafta InApp **varsayılan olarak açıktır** (`Insider.h`: "Inapps are enabled
by default"). Uygulama bunları hiç çağırmaz, dolayısıyla kapalı değildir:

- `disableInAppMessages()` / `enableInAppMessages()` — geçici kapatma/açma
- `setGDPRConsent(false)` — SDK'yı tamamen dondurur
- `setMobileAppAccess(false)` — push ve InApp dahil tüm mobil özellikleri kapatır

Expo kurulumunda `AppDelegate.swift` düzenlenmez; `expo-insider-plugin` ayarları
`Info.plist` içindeki `Insider` sözlüğüne yazar. Mevcut değerler doğrudur:
`OverrideUNUserNotificationCenterDelegate = true`, `EnablePushViewOnForegroundStatus = true`.

## Smart Recommender (öneri kampanyaları)

Insider'ın Smart Recommender kampanyaları uygulamada dört slot üzerinden çalışır.
Kampanya kimlikleri panelden geldiği için kod tarafı kimlik olmadan da güvenle
çalışır: slot tanımlı değilken sorgu hiç kurulmaz, SDK çağrılmaz ve ekranda
hiçbir şey render edilmez.

### Mimari

| Dosya | Sorumluluk |
| --- | --- |
| `config/recommendation-campaigns.ts` | Slot → kampanya listesi (ID, başlık, SDK metodu). **Kampanya eklemek/kaldırmak için tek dokunulacak yer.** |
| `services/insider-recommender.ts` | SDK sınırı; callback tabanlı API'yi promise'e çevirir, hata/zaman aşımı izolasyonu burada. |
| `utils/insider-recommendation.mapper.ts` | Yanıt → domain modeli, tracker girdisi ve ürün rotası dönüşümleri. |
| `api/insider-recommendation.queries.ts` | TanStack Query hook'u; anahtarlar `insiderKeys.recommendation(...)`. |
| `components/insider-recommendation-slider.tsx` | Yalnızca sunum: yatay slider, loading/error/empty durumları. |
| `components/insider-recommendation-section.tsx` | Tek kampanya: veri + tıklama logu + yönlendirme. |
| `components/insider-recommendation-sections.tsx` | Ekrandaki tüm kampanyaları sırayla çizer; ekranlar bunu kullanır. |
| `hooks/use-last-viewed-insider-product.ts` | Ana sayfadaki ürünlü kampanya için en son gezilen ürünü bağlam olarak verir. |

### Panelde tanımlı kampanyalar (2026-08-26)

| ID | Panel adı | Ekran | SDK metodu | Uygulamadaki başlık |
| --- | --- | --- | --- | --- |
| 1 | Ürün Detay 1 \| Birlikte Satın Alınanlar | Ürün detay | `getSmartRecommendationWithProduct` | Birlikte Satın Alınanlar |
| 2 | Ürün Detay 2 \| Çok Satanlar | Ürün detay | `getSmartRecommendation` | Çok Satanlar |
| 3 | Anasayfa 1 \| Son Görüntülenenler | Ana sayfa | `getSmartRecommendationWithProduct` | Son Görüntülediklerin |
| 4 | Anasayfa 2 \| Kullanıcıya Özel | Ana sayfa | `getSmartRecommendation` | Sana Özel |
| 5 | Sepet 1 \| Benzer Ürünler | Sepet | `getSmartRecommendationWithProductIDs` | Benzer Ürünler |
| 6 | Sepet 2 \| Popüler Ürünler | Sepet | `getSmartRecommendation` | Popüler Ürünler |
| 7 | Sipariş Sonrası \| Siparişinle Uyumlu | Sipariş başarılı | `getSmartRecommendation` | Siparişinle Uyumlu |

**Metot ekranın değil kampanyanın özelliğidir.** Aynı ekranda iki farklı algoritma
olabiliyor (ör. sepette biri ürün kimlikleriyle, diğeri kimliksiz çalışıyor), bu yüzden
`method` alanı kampanya kaydında duruyor ve sorgu bu alana bakarak metodu seçiyor.

**Kampanya 3 (Son Görüntülenenler) dikkat gerektiriyor:** Insider dokümanı Recently Viewed
algoritmasını yalnızca ürünlü metotta listeliyor, ama ana sayfada ürün bağlamı yok.
Uygulama en son gezilen ürünü (`utils/recently-viewed`) bağlam olarak gönderiyor. Hiç ürün
gezilmemişse o kampanya için sorgu çalışmaz ve slider görünmez.

### Doküman ile SDK arasındaki fark (dikkat)

Insider dokümanındaki örnekler SDK'nın gerçek imzalarıyla çelişiyor. Kod, SDK'nın
kendi tanımına göre yazıldı (`react-native-insider@8.1.0-nh/index.js`):

- Metot adı `getSmartRecommendationWithID` değil **`getSmartRecommendation`**.
- **`getSmartRecommendationWithProduct` currency almaz** (4 parametre:
  `product, recommendationID, locale, callback`). Dokümandaki örnekte olduğu gibi
  fazladan `"currency"` gönderilirse SDK'nın `checkParameters` kontrolü callback'i
  string sanar, yalnızca `console.warn` atıp **çağrıyı sessizce düşürür**.

Regresyon testi: `insider-recommender.test.ts` → "calls the product-based method
with exactly four arguments (no currency)".

### Ön koşullar

| Ön koşul | Durum |
| --- | --- |
| Kullanıcı objesinde `locale` | ✅ `identifyUser` oturum açanlarda, `applyDefaultLocale` misafirlerde (`InsiderIdentitySync`). Değer `tr_TR` (`utils/insider-locale.ts`). |
| Ürün objesinde `stock` | ✅ `productToInsiderInput` → `Product.totalQuantity`; recommender ürün objesini kurarken `setStock` çağırır. |

### İstatistik zinciri (logger)

Panel dört metrik gösterir: **Impression**, **Click**, **Add to Cart**, **Revenue**.
Impression'ı Insider `getSmartRecommendation*` çağrısında kendisi sayar; kalan üçü
uygulamanın göndereceği event'lere bağlıdır.

| Metrik | Metot | Nerede |
| --- | --- | --- |
| Impression | — (SDK öneriyi sunarken Insider sayar) | `insider-recommender.ts` |
| Click | `clickSmartRecommendationProduct` | `trackRecommendationClick` |
| Add to Cart | `itemAddedToCart` | `trackAddToCart` |
| Revenue | `itemPurchased` | `trackPurchase` |

Tıklama **zorunlu ilk halka**: aynı oturumda bir ürün için tıklama gönderilmeden o ürünün
sepete ekleme ve satın alma eventleri panelde öneri kampanyasına bağlanmaz.
`InsiderRecommendationSection` tıklamayı yönlendirmeden **önce** gönderir; sıralama testle
korunur.

Sepete ekleme ve satın alma için ayrı bir metot yok — mevcut `itemAddedToCart` ve
`itemPurchased` çağrıları kullanılır. **Eşleşme ürün kimliği üzerinden yapılır:** event'teki
kimlik, tıklamada gönderilen kimlikle birebir aynı olmak zorundadır, aksi halde event panele
hiç düşmez.

#### Kimlik hizalaması (`insider-recommendation-attribution.ts`)

Öneri kartındaki kimlik Insider feed'inden gelen `item_id`, sepet/sipariş tarafındaki kimlik
ise backend ürün kimliğidir. İkisinin eşit olduğu **varsayılıyordu ama garanti edilmiyordu**;
ayrıştıkları anda Add to Cart ve Revenue istatistikleri sessizce kaybolur.

Bu yüzden tıklama anında Insider'a gönderilen kimlik hatırlanır:

1. `trackRecommendationClick` SDK çağrısı **başarılı olduysa** kaydı yazar
   (kimlik + slug eşleşme anahtarları, kampanya kimliği, zaman damgası).
2. `trackAddToCart` ve `trackPurchase` ürünü bu kayıtla eşleştirir; eşleşme varsa event
   **tıklamadaki kimlikle** gönderilir. Kimlikler zaten aynıysa çağrı hiçbir şeyi değiştirmez.
3. Kayıt MMKV'ye de yazılır. 3D Secure sırasında Android süreci öldürebiliyor; bellek
   sıfırlanırsa satın alma eventi tıklamayla eşleşemezdi (`purchase-snapshot` ile aynı gerekçe).
   Uygulama açılışında `InsiderIntegration` → `restoreRecommendationAttribution()` geri yükler.

Pencere `RECOMMENDATION_CLICK_TTL_MS` (6 saat), kapasite `MAX_REMEMBERED_CLICKS` (20 kayıt).

#### Cihazda doğrulama

Zincirin çalıştığı cihaz log'undan izlenebilir (PII taşımaz):

```
[Insider] öneri tıklaması gönderildi · kampanya=1 · kimlik=12345
[Insider] öneri eşleşmesi · kampanya=1 · kimlik 12345 → P-12345
[Insider] öneri tıklaması atlandı (eksik ürün alanı) · kampanya=1 · kimlik=12345
```

Üçüncü satır önemli: ürün objesinde kimlik/ad/fiyat eksikse (`isValidInsiderProductInput`)
tıklama gönderilmez ve o ürünün Add to Cart / Revenue istatistiği de oluşmaz. Feed fiyatsız
ürün döndürüyorsa panelde tıklama görünmemesinin sebebi budur.

#### Sürüm notu

Öneri sliderları ve tıklama logger'ı `8783902` (2026-08-26) ve `1d2c01c` (2026-08-27)
commit'leriyle geldi. En son mağaza sürümü olan **2.3.19 / build 36 bu tarihten öncedir
(2026-08-22)**, yani tıklama/sepet/gelir istatistikleri ilk kez **2.3.20 / build 37** ile
sahaya çıkar. Panelde bu metrikler görünmüyorsa önce yayındaki sürümün kontrol edilmesi
gerekir.

### Kampanya ekleme / çıkarma

Kampanya kimlikleri sabit ve Insider ekibi tarafından elle iletiliyor; bu yüzden
`config/recommendation-campaigns.ts` içinde tutuluyorlar. Yeni kampanya için ilgili slotun
dizisine bir kayıt eklemek yeterli:

```ts
{ id: 8, title: 'Yeni Kampanya', method: 'byId' }
```

`method` seçerken panelde seçilen algoritmaya bakın: ürün bağlamı isteyen algoritmalar
(Purchased Together, Viewed Together, Recently Viewed) `byProduct`; yalnızca Purchased/Viewed
Together destekleyen kimlik listesi metodu `byProductIds`; geri kalanlar `byId`.

Kampanya panelde kapatılırsa `id` alanını `0` yapmak yeterli — o kayıt çağrılmaz ve
render edilmez. Ekran dosyalarına hiç dokunulmaz; kampanya listesi ekranların dışındadır.

Kimlikler saf JS sabiti olduğu için değişiklik **EAS Update (OTA)** ile gidebilir; yeni
mağaza sürümü gerekmez.

Yanıt `details: false` ile kurulduysa Insider yalnızca ürün kimliklerini döner; mapper bunu
`productIds` alanına yazar ama slider ürün bilgisi olmadan çizim yapamaz. Bu parametrenin
nerede ayarlandığı Insider dokümanında açıklanmıyor — Insider ekibine sorulması gereken bir
madde; gerekirse kimliklerden ürünleri kendi API'mizle çekecek yol açık.
