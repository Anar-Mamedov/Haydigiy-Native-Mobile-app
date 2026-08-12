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

## Kullanıcı attribute'ları ve kimlik

`useAuthStore` üzerinden tüm oturum yolları kapsanır:

- **Login / kayıt / hızlı giriş / profil güncelleme** → `insiderTracker.identifyUser(user)`:
  - Attribute'lar: `setName`, `setSurname`, `setEmail`, `setPhoneNumber`
    (E164: `+90…`), `setLanguage('tr')`, `setLocale('tr_TR')`.
  - Identifier'lar: `addUserID` (CRM id), `addEmail`, `addPhoneNumber` →
    `getCurrentUser().login(identifiers)`.
- **Logout ve süresi dolan oturum** → `getCurrentUser().logout()`.

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
