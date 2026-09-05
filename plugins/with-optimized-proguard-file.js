const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * AGP iki varsayılan ProGuard dosyası üretir (bkz. `ProguardFiles.ProguardFile`):
 * `proguard-android.txt` `-dontoptimize` içerir, `proguard-android-optimize.txt`
 * içermez. React Native şablonu optimizasyonu kapatan varyantı yazıyor, bu yüzden
 * R8 açık olsa bile yalnızca küçültme/karartma çalışıyor; Play Console bunu
 * "Optimizasyon etkin değil" olarak raporluyor.
 *
 * `expo-build-properties` bu dosyayı seçmek için bir seçenek sunmadığından ve
 * `android/` klasörü her prebuild'de yeniden üretildiğinden, değişiklik ancak bir
 * config plugin ile kalıcı olabilir.
 */
const DONT_OPTIMIZE = 'getDefaultProguardFile("proguard-android.txt")';
const OPTIMIZE = 'getDefaultProguardFile("proguard-android-optimize.txt")';

/**
 * `android/app/build.gradle` içeriğini optimize eden varyanta çevirir.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string} contents ham build.gradle metni
 * @returns {string} dönüştürülmüş metin
 * @throws {Error} beklenen satır bulunamazsa
 */
function useOptimizedProguardFile(contents) {
  if (contents.includes(OPTIMIZE)) return contents;

  if (!contents.includes(DONT_OPTIMIZE)) {
    throw new Error(
      '[with-optimized-proguard-file] android/app/build.gradle içinde ' +
        `${DONT_OPTIMIZE} bulunamadı. React Native şablonu değişmiş olabilir; ` +
        'plugin sessizce devre dışı kalırsa Play Console "Optimizasyon etkin değil" ' +
        'uyarısı geri döner. Şablondaki proguardFiles satırını kontrol edip bu ' +
        "plugin'i güncelleyin.",
    );
  }

  return contents.replace(DONT_OPTIMIZE, OPTIMIZE);
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withOptimizedProguardFile = (config) =>
  withAppBuildGradle(config, (gradleConfig) => {
    gradleConfig.modResults.contents = useOptimizedProguardFile(gradleConfig.modResults.contents);
    return gradleConfig;
  });

module.exports = withOptimizedProguardFile;
module.exports.useOptimizedProguardFile = useOptimizedProguardFile;
