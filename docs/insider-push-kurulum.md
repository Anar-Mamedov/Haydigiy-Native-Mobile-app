# Insider push notification kurulum rehberi

Bu projede Insider Expo entegrasyonu kod tarafında hazırdır. Yapılandırılan sabitler:

- Insider partner adı: `haydigiyprod`
- Android package: `com.faprika.haydigiy`
- iOS bundle ID: `com.faprika.haydigiy.app`
- iOS App Group: `group.com.faprika.haydigiy.app`
- iOS Notification Service: `com.faprika.haydigiy.app.InsiderNotificationService`
- iOS Notification Content: `com.faprika.haydigiy.app.InsiderNotificationContent`

Native SDK nedeniyle uygulama Expo Go ile çalışmaz. Test için development build ve gerçek bir cihaz kullanın.

## 1. Firebase projesini oluşturun (Android)

1. [Firebase Console](https://console.firebase.google.com/) içinde Google hesabınızla oturum açın.
2. **Create a project** seçeneğiyle örneğin `haydigiy-mobile` isimli bir proje oluşturun. Google Analytics bu entegrasyon için zorunlu değildir.
3. Project Overview ekranında Android simgesini seçin.
4. Android package name alanına tam olarak `com.faprika.haydigiy` yazın.
5. Uygulamayı kaydedin ve `google-services.json` dosyasını indirin.
6. Yerel test için dosyayı proje köküne, `package.json` ile aynı dizine koyun. Dosya Git ve EAS yüklemesinden özellikle hariç tutulmuştur.

EAS cloud build için Expo dashboard'da bu dosyayı bir **file environment variable** olarak tanımlayın:

1. Expo projesini açın: project ID `74d084b0-27e0-4668-a29b-e958789de835`.
2. Project settings > Environment variables > Add variable yoluna gidin.
3. Adı `GOOGLE_SERVICES_JSON`, türü **File**, visibility değeri **Secret** olsun.
4. İndirdiğiniz `google-services.json` dosyasını yükleyin.
5. Değişkeni `development`, `preview` ve `production` ortamlarına ekleyin.

`google-services.json`, Insider'a yüklenecek servis hesabı anahtarıyla aynı dosya değildir.

## 2. FCM servis hesabını Insider'a bağlayın

1. Firebase > Project settings > Cloud Messaging ekranında Firebase Cloud Messaging API'nin etkin olduğunu doğrulayın.
2. Google Cloud Console > IAM & Admin > Service Accounts ekranında aynı Firebase projesini seçin.
3. Yeni bir servis hesabı oluşturun.
4. Role olarak tam adıyla **Firebase Cloud Messaging API Admin** seçin. Benzer isimli **Firebase Cloud Messaging Admin** rolünü seçmeyin.
5. Servis hesabı > Keys > Add key > Create new key > JSON ile özel anahtarı indirin.
6. Insider InOne > Settings > Mobile App Settings > Push Notification (bazı panellerde Push Certificates) > Android Certificate alanına gidin.
7. Firebase Cloud Messaging Credentials seçeneğiyle bu servis hesabı JSON dosyasını yükleyin ve kaydedin.
8. Yükleme doğrulandıktan sonra servis hesabı JSON dosyasını bilgisayarınızdan silin. Bu özel anahtarı projeye, Git'e, e-postaya veya mesaja koymayın.

## 3. Apple hesabını hazırlayın (iOS)

iOS push için ücretli Apple Developer üyeliği ve fiziksel iPhone gerekir.

1. Apple Developer > Certificates, Identifiers & Profiles > Identifiers bölümünde ana App ID `com.faprika.haydigiy.app` için **Push Notifications** ve **App Groups** yeteneklerini açın.
2. `group.com.faprika.haydigiy.app` App Group kaydını oluşturun.
3. Aşağıdaki iki extension App ID kaydını oluşturun:
   - `com.faprika.haydigiy.app.InsiderNotificationService`
   - `com.faprika.haydigiy.app.InsiderNotificationContent`
4. Aynı App Group'u ana uygulama ve iki extension için de etkinleştirin.
5. Mevcut provisioning profile'ları bu değişikliklerden sonra yeniden üretin. EAS Credentials bunu sonraki build sırasında yönetebilir.

APNs `.p8` anahtarını oluşturmak için:

1. Apple Developer > Certificates, Identifiers & Profiles > Keys > `+` yolunu açın.
2. Apple Push Notifications service (APNs) seçin ve **Sandbox & Production** erişimini kullanın.
3. Anahtarı kaydedin; `.p8` dosyasını yalnızca bir kez indirebileceğiniz için Key ID ve Team ID ile birlikte güvenli saklayın.
4. Insider InOne > Settings > Mobile App Settings > Push Notification > iOS alanında `.p8`, Key ID, Team ID ve `com.faprika.haydigiy.app` Bundle ID değerlerini girin.
5. Aynı `.p8` anahtarını development ve production alanlarına yükleyip kaydedin; doğru server state'i seçin.

## 4. Development build alın

Firebase ve Apple adımları tamamlandıktan sonra:

```bash
# Android development build
npx eas build --platform android --profile development

# iOS development build (fiziksel cihaz)
npx eas build --platform ios --profile development

# Build cihazda kurulduktan sonra Metro
npx expo start --dev-client
```

İlk açılışta bildirim iznini kabul edin. iOS Simulator gerçek remote push testi için kullanılmamalıdır.

## 5. Insider test cihazını bağlayın

1. Insider Integration Wizard > Connect Test Device adımına gidin.
2. Development build yüklü fiziksel cihazdan QR kodunu açın veya panelin verdiği test bağlantısını kullanın.
3. Uygulamanın `insiderhaydigiyprod://` test bağlantısını işlediğini ve cihazın panelde göründüğünü doğrulayın.
4. Önce basit test push, sonra rich/advanced test push gönderin.
5. Uygulama açıkken, arka plandayken ve tamamen kapalıyken ayrı ayrı deneyin.

## 6. Deep-link formatı

Insider kampanyasında **Internal URL** kullanın. Güvenli uygulama içi yönlendirme örnekleri:

- Ürün: `https://www.haydigiy.com/urun-slug`
- Sepet: `https://www.haydigiy.com/sepet`
- Favoriler: `https://www.haydigiy.com/favori-listem`
- Kategori: `https://www.haydigiy.com/kategori-slug?c=147`

Uygulama içi yönlendirme yalnızca `haydigiy.com`, `www.haydigiy.com`, `/...` yolları ve `haydigiywebviewapp://` şeması için kabul edilir. Insider'daki **External URL** alanı ise `https` bağlantısını sistem üzerinden açar.

## 7. Targeted App Push API entegrasyonu

[Targeted App Push API](https://academy.insiderone.com/docs/send-targeted-app-pushes-api)
sunucudan çağrılır. API anahtarı uygulamaya eklenmez. Backend gereksinimleri ve
kabul kriterleri [GitLab #2](https://git.haydigiytr.com/root/connect/-/work_items/2)
içindedir; bu mobil çalışmada backend kodu değiştirilmemiştir.

Mobil SDK oturum açarken `addUserID(String(user.id))` kullanır. Backend'deki
`INSIDER.uuid` bu değerle aynı olmalıdır. Kalıcı oturum geri yüklendiğinde kimlik
SDK'ya yeniden bildirilir; telefon/e-posta tanımlayıcıları mevcut normalizasyondan geçer.
SDK cihaz kaydını ve bildirim token'ını yönetir; mobil ayrıca bu gönderim API'sini çağırmaz.

### Hedef sözleşmesi

Backend aşağıdaki nesnelerden birini `android.deep_link`, `ios.deep_link` veya
carousel/slider öğesinin `deep_links` alanına koyabilir. SDK callback'i hedefi
doğrudan ya da `{ type, data }` içinde iletir. Uygulama yalnızca bildirim açılışı
ve InApp buton tıklamasında yönlendirir; bildirimin ulaşması tek başına ekranı değiştirmez.

| Hedef türü | Deep-link nesnesi örneği |
| --- | --- |
| Internal URL | `{"ins_dl_internal":"https://www.haydigiy.com/sepet"}` |
| URL scheme | `{"ins_dl_url_scheme":"haydigiywebviewapp://product/12345"}` |
| External URL | `{"ins_dl_external":"https://example.com/kampanya"}` |
| Ürün kimliği | `{"screen":"product","product_id":"12345"}` |
| Ürün slug | `{"screen":"product","product_slug":"siyah-elbise"}` |
| Kategori | `{"screen":"category","category_id":"147","category_slug":"elbise"}` |
| Sipariş | `{"screen":"order","order_id":"940225"}` |
| Sabit ekran | `{"screen":"cart"}`; diğerleri: `home`, `favorites`, `orders`, `profile` |
| JSON | `{"ins_dl_json":"{\"screen\":\"product\",\"product_id\":\"12345\"}"}` |

`product_detail`, `product` için geriye uyumlu bir eş addır. Ürün slug'ı varsa
önceliklidir; yalnızca sayısal kimlik geldiğinde mevcut ürün sorgusu güncel slug'ı
bulur. Kimlikler pozitif olmalıdır. Kategori slug'ı opsiyoneldir; kategori kimliği
filtreye taşınır. Sipariş bağlantıları mevcut oturum ve sunucu yetki kontrolünü kullanır.

`ins_dl_json` nesne olarak da kabul edilir; içinde yukarıdaki URL veya `screen`
alanları bulunmalıdır. Serbest bir JSON, bilinmeyen bir `screen` veya bozuk içerik
uygulamada rastgele bir işlem çalıştırmaz. Geçersiz hedefler yok sayılır.
Bir bildirimde tek hedef biçimi kullanın. Birden fazlası varsa geçerli alanların
önceliği internal URL, URL scheme, external URL, JSON ve custom screen şeklindedir.

Uygulama soğuk açılışta son tıklanan hedefi navigator hazır olana kadar tutar.
Rich push, carousel ve slider görünümünü native Insider SDK/extension'ları oluşturur.
Advanced push'ta tıklanan öğenin hedefini SDK seçer; uygulama payload içindeki ilk
öğeyi kendiliğinden açmaz.

### Platform seçenekleri ve yayın

- Metin, görsel, ses, badge, thread/channel, TTL, frequency cap ve kampanya alanları
  backend gönderim gövdesinde hazırlanır. Mobil SDK mevcut rich/advanced ve ön
  planda gösterim ayarlarıyla bunları işler. Özel ses ancak uygulamada paketlenmiş
  bir dosya varsa kullanılabilir; mevcut senaryoda `default` tercih edilir.
- iOS `content-available` için `UIBackgroundModes: remote-notification` eklenmiştir.
  Bu bir platform yeteneğidir; kendiliğinden JavaScript arka plan işi oluşturmaz.
  Özel bir arka plan iş mantığı bu entegrasyonda tanımlı değildir. Sessiz payload
  görünür push'tan ayrıdır ve teslimi iOS tarafından geciktirilebilir veya atlanabilir.
  [Apple arka plan bildirimleri](https://developer.apple.com/documentation/usernotifications/pushing-background-updates-to-your-app)
  açıklamasına göre OS teslimi garanti etmez.
- Bu iOS yeteneği için **yeni native build gerekir**; yalnızca OTA güncellemesi
  yeterli değildir. Store/build yayını bu kod değişikliğinin parçası değildir.
- Yeni JSON/custom-screen hedefleri yayınlanmadan önce eski mobil sürümlere
  gönderim yapılıyorsa HTTPS `ins_dl_internal` formatını kullanın.

### Doğrulama

Birim/bileşen testleri hedef çözümleme, kullanıcı kimliği, izin akışı, callback
tipleri, config ve navigator hazır olma davranışını doğrular. Bunlar gerçek
FCM/APNs teslimini veya görsel extension çıktısını kanıtlamaz.

Backend işi ve sertifika ayarları tamamlandıktan sonra yetkili test cihazlarında:

1. Oturumdaki kullanıcıya metin ve görselli push gönderin; açık, arka plan ve soğuk
   açılış durumlarında doğru hedefe gidildiğini doğrulayın.
2. Carousel ve slider'da iki farklı öğeye basın; her birinin kendi ürününü açtığını kontrol edin.
3. JSON, URL scheme, external URL, kategori/sepet/sipariş ve geçersiz hedefleri deneyin.
4. İzin reddi, logout/hesap değişimi ve bir kullanıcının iki cihazı senaryolarını kontrol edin.
5. Sessiz payload'ı görünür push'tan ayrı doğrulayın; API'nin kabul/gönderim yanıtını
   cihazda teslim veya açılış kanıtı olarak değerlendirmeyin.

## iOS build: framework modu neden `static` olmak zorunda

`insiderRichPush` / `insiderAdvancedPush` açıkken plugin, Podfile'a iki push
extension hedefi ekler ve her ikisini de `use_frameworks!` ile tanımlar:

```ruby
target 'InsiderNotificationService' do
    use_frameworks!
    pod 'InsiderMobileAdvancedNotification'
end
```

Bu yüzden `app.config.js` içindeki `expo-build-properties` ayarı
`ios.useFrameworks: 'static'` olmalıdır. Üç durumun sonucu:

| Ayar | Sonuç |
| --- | --- |
| Ayar yok | `pod install` çöker: *"Haydigiy (false) and InsiderNotificationService (true) do not both set use_frameworks!"* — CocoaPods host ve extension hedefinin aynı modda olmasını şart koşar |
| `dynamic` | `pod install` geçer, Xcode çöker: `react-native-webview` derlenirken `React/RCTView.h file not found` — dynamic frameworks React Native New Architecture ile desteklenmiyor |
| **`static`** | ✅ Her ikisi de çalışır; Expo pod install sırasında *"Created non-framework React modulemap for use_frameworks! compatibility"* ile başlık uyumunu kurar |

Bu davranış `src/insider-app-config.test.ts` ile kilitlenmiştir; testi değiştirmeden
framework modunu değiştirmeyin.

## Sorun giderme kontrol listesi

- Android Firebase uygulamasının package adı `com.faprika.haydigiy` ile birebir aynı mı?
- EAS ortamında `GOOGLE_SERVICES_JSON` file değişkeni seçili mi?
- Insider'a yüklenen servis hesabında **Firebase Cloud Messaging API Admin** rolü var mı?
- Apple App Group üç App ID için de etkin mi?
- Insider iOS server state, aldığınız build türüyle uyumlu mu?
- Test cihazında sistem bildirim izni açık mı?
- Test push'ta mobile push opt-in değeri true görünüyor mu?
