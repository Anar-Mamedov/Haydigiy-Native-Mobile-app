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

Uygulama içi yönlendirme yalnızca `haydigiy.com`, `www.haydigiy.com`, `/...` yolları ve `haydigiywebviewapp://` şeması için kabul edilir. Insider'daki **External URL** alanı ise doğrulanmış `http`/`https` bağlantısını sistem üzerinden açar.

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
