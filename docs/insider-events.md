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
    (E164: `+90…`), `setLanguage('tr')`, `setLocale('tr_TR')`.
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

### InApp görüntülenmesini etkileyen ayarlar

Native tarafta InApp **varsayılan olarak açıktır** (`Insider.h`: "Inapps are enabled
by default"). Uygulama bunları hiç çağırmaz, dolayısıyla kapalı değildir:

- `disableInAppMessages()` / `enableInAppMessages()` — geçici kapatma/açma
- `setGDPRConsent(false)` — SDK'yı tamamen dondurur
- `setMobileAppAccess(false)` — push ve InApp dahil tüm mobil özellikleri kapatır

Expo kurulumunda `AppDelegate.swift` düzenlenmez; `expo-insider-plugin` ayarları
`Info.plist` içindeki `Insider` sözlüğüne yazar. Mevcut değerler doğrudur:
`OverrideUNUserNotificationCenterDelegate = true`, `EnablePushViewOnForegroundStatus = true`.
