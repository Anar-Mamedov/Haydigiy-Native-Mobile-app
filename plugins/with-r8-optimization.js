const withOptimizedProguardFile = require('./with-optimized-proguard-file');
const withOptimizedResourceShrinking = require('./with-optimized-resource-shrinking');

/**
 * Play Console'un "R8 optimizasyonu ile uygulamanızın belleğini ve performansını
 * artırın" önerisindeki, uygulama tarafından kapatılabilen maddeleri toplayan
 * bileşik plugin.
 *
 * Her madde ayrı bir dosyada, çünkü farklı native dosyalara yazıyorlar:
 * - `with-optimized-proguard-file`      -> android/app/build.gradle
 *   ("Optimizasyon etkin değil")
 * - `with-optimized-resource-shrinking` -> android/gradle.properties
 *   ("Optimize edilmiş, kullanılmayan kaynakları kaldırma etkin değil")
 *
 * Kartın "Android Gradle eklentisini 9.0'a yükseltin" maddesi kasıtlı olarak burada
 * DEĞİL: AGP sürümü React Native 0.86'nın version catalog'undan geliyor ve SDK 57'nin
 * Gradle plugin'leri AGP 9'da gizlenen legacy DSL'e (`BaseExtension`,
 * `LibraryExtension`) bağlı. Bu madde ancak Expo SDK 58 / RN 0.87 yükseltmesiyle
 * kapanır; burada zorlanamaz.
 *
 * Doğrudan fonksiyon kompozisyonu kullanılıyor: `withPlugins` statik plugin
 * çözümleyicisinden geçtiği için `_internal.projectRoot` ister ve elimizdeki
 * doğrudan plugin referansları için gereksiz bir bağımlılık yaratır.
 */
/** @type {import('expo/config-plugins').ConfigPlugin} */
const withR8Optimization = (config) =>
  withOptimizedResourceShrinking(withOptimizedProguardFile(config));

module.exports = withR8Optimization;
