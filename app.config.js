const insiderConfig = require('./insider.config.json');

const GOOGLE_SERVICES_FILE = './google-services.json';
const OPTIONAL_LOCATION_PERMISSIONS = [
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
];

function getApnsMode() {
  return process.env.INSIDER_APNS_MODE === 'production' ? 'production' : 'development';
}

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || GOOGLE_SERVICES_FILE,
    permissions: [
      ...(config.android?.permissions || []),
      'android.permission.POST_NOTIFICATIONS',
    ],
    blockedPermissions: [
      ...(config.android?.blockedPermissions || []),
      ...OPTIONAL_LOCATION_PERMISSIONS,
    ],
  },
  plugins: [
    ...(config.plugins || []),
    // Play Console "R8 optimizasyonu" kartinin uygulama tarafindan kapatilabilen
    // maddeleri: `-dontoptimize` iceren varsayilan ProGuard dosyasini degistirir ve
    // `android.r8.optimizedResourceShrinking` bayragini acar. expo-build-properties
    // ikisini de ayarlayamiyor.
    //
    // SIRA ONEMLI: Expo mod zincirinde son kaydedilen plugin ILK calisir
    // (@expo/config-plugins withMod.js -> once action(), sonra nextMod()). Bu yuzden
    // bu plugin expo-build-properties'ten ONCE kaydediliyor; boylece bizim mod
    // zincirde en son calisir ve ileride expo-build-properties ayni native dosyalara
    // yazmaya baslarsa bizim degisikligimizi ezemez.
    './plugins/with-r8-optimization',
    // iOS framework modu STATIC olmalı, başka bir değer değil:
    // - Insider push extension'ları (InsiderNotificationService/Content) Podfile'da
    //   `use_frameworks!` ile geliyor. CocoaPods, host ve embedded target'ın aynı
    //   framework moduna sahip olmasını şart koşar; ana hedefte hiç ayar olmazsa
    //   "do not both set use_frameworks!" ile pod install patlar.
    // - `dynamic` ise React Native New Architecture ile desteklenmiyor ve
    //   react-native-webview derlenirken "React/RCTView.h file not found" verir.
    // `static` her iki koşulu da sağlayan tek değerdir.
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
        android: {
          // R8 kapaliyken Play Console "uygulama optimizasyonu" raporunda kod karartma
          // orani %3'te kaliyor; Play, %25'in altindaki uygulamalarin gorunurlugunu
          // kisitliyor. Bu bayrak android/app/build.gradle'daki minifyEnabled'i acar.
          // Keep kurallari react-native, expo-modules-core, expo-updates, reanimated,
          // worklets, svg ve expo-insider-plugin tarafindan saglaniyor; ek kural gerekmiyor.
          enableMinifyInReleaseBuilds: true,
          // Play Console "R8 optimizasyonu" onerisindeki "Kullanilmayan kaynaklari
          // kaldirma etkin degil" maddesi. minifyEnabled'a bagimli.
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    [
      'expo-insider-plugin',
      {
        ...insiderConfig,
        overrideUNUserNotificationCenterDelegate: true,
        enablePushViewOnForegroundStatus: true,
        insiderRichPush: true,
        insiderAdvancedPush: true,
        mode: getApnsMode(),
        minimumDeploymentTarget: '15.1',
      },
    ],
  ],
});
