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
