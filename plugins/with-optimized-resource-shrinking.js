const { withGradleProperties } = require('expo/config-plugins');

/**
 * Play Console "R8 optimizasyonu" önerisindeki "Optimize edilmiş, kullanılmayan
 * kaynakları kaldırma etkin değil" maddesi.
 *
 * `shrinkResources` (expo-build-properties'teki `enableShrinkResourcesInReleaseBuilds`)
 * ile AYNI ŞEY DEĞİL: klasik kaynak küçültme kaynakları ayrı bir geçişte tarar,
 * optimize edilmiş varyant ise kaynak ve kod analizini tek R8 geçişinde birleştirir
 * ve yalnızca silinmiş koddan referans alınan kaynakları da kaldırır.
 *
 * AGP 8.12'de varsayılan kapalı; AGP 9.0'dan itibaren `shrinkResources` açıkken
 * varsayılan olarak devreye giriyor. RN 0.86 AGP 8.12'ye pinli olduğu için bu
 * bayrağı elle açmamız gerekiyor.
 *
 * `expo-build-properties` bu property'yi yazamadığı (desteklenen android anahtarları
 * arasında yok) ve `android/` her prebuild'de yeniden üretildiği için tek kalıcı yol
 * bir config plugin.
 *
 * @see https://developer.android.com/build/releases/agp-9-0-0-release-notes
 */
const PROPERTY_KEY = 'android.r8.optimizedResourceShrinking';
const PROPERTY_VALUE = 'true';

/**
 * `android/gradle.properties` listesinde optimize edilmiş kaynak küçültmeyi açar.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir. Var olan bir kayıt
 * varsa değerini günceller, yoksa sona ekler; böylece tekrarlanan prebuild'lerde
 * property çoğalmaz.
 *
 * @param {import('@expo/config-plugins').AndroidConfig.Properties.PropertiesItem[]} properties
 * @returns {import('@expo/config-plugins').AndroidConfig.Properties.PropertiesItem[]}
 */
function enableOptimizedResourceShrinking(properties) {
  let replaced = false;

  const updated = properties.map((item) => {
    if (item.type !== 'property' || item.key !== PROPERTY_KEY) return item;

    replaced = true;
    return { ...item, value: PROPERTY_VALUE };
  });

  if (replaced) return updated;

  return [...updated, { type: 'property', key: PROPERTY_KEY, value: PROPERTY_VALUE }];
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withOptimizedResourceShrinking = (config) =>
  withGradleProperties(config, (gradleConfig) => {
    gradleConfig.modResults = enableOptimizedResourceShrinking(gradleConfig.modResults);
    return gradleConfig;
  });

module.exports = withOptimizedResourceShrinking;
module.exports.enableOptimizedResourceShrinking = enableOptimizedResourceShrinking;
module.exports.PROPERTY_KEY = PROPERTY_KEY;
