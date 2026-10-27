/**
 * Uygulamanın yazı tipi aileleri. Anahtarlar Tamagui'nin native aile adlarıdır
 * (`@tamagui/config` gövde fontu `Inter`, kalın ağırlıklar `InterBold`).
 *
 * Android'de app.json'daki `expo-font` eklentisi bu dosyaları APK'ya aynı adla
 * (`fonts/Inter.otf`) gömer; dosya adı aile adı olur. `useFonts` gömülü aileleri ilk
 * render'da yüklü görür, böylece açılış asenkron font yüklemesini beklemez (Android
 * vitals: yavaş sıcak başlatma). iOS aynı dosyaları çalışma anında yükler.
 * Bir aile eklenirse app.json'daki listeye de eklenmeli; app-fonts.test.ts denetler.
 */
export const APP_FONTS = {
  Inter: require('../../../assets/fonts/Inter.otf'),
  InterBold: require('../../../assets/fonts/InterBold.otf'),
};
