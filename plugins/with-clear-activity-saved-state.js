const { withMainActivity } = require('expo/config-plugins');

/**
 * Play Console'daki `TransactionTooLargeException` kilitlenmesini kapatır
 * (`ActivityClient.activityStopped` -> `BinderProxy.transactNative`).
 *
 * Uygulama arka plana alınınca Android, `onSaveInstanceState` paketini Binder ile
 * sistem sürecine gönderiyor; Binder tamponu ~1 MB. Fabric her native görünüme
 * React etiketini `id` olarak verdiği için görünüm hiyerarşisinin tamamı (ve
 * react-native-screens fragment'larının kendi hiyerarşileri) bu pakete yazılıyor.
 * Uzun ürün listeleri ve açık ekran yığını paketi sınırın üstüne çıkarıyor.
 *
 * Paket zaten hiçbir yerde kullanılmıyor: Expo şablonu `super.onCreate(null)`
 * çağırdığı için fragment'lar, SavedStateRegistry ve diğer durum hiç geri
 * yüklenmiyor. Geriye kalan tek tüketici `onRestoreInstanceState`'teki görünüm
 * hiyerarşisi; o anda RN görünümleri henüz oluşmadığından onun da etkisi yok. Bu
 * yüzden paketi kaydedildikten sonra boşaltmak davranış kaybı olmadan kilitlenmeyi
 * önler. `MainActivity.kt` her prebuild'de yeniden üretildiği için değişiklik ancak
 * bir config plugin ile kalıcı olabilir.
 */
const ON_CREATE_END = /^[ \t]*super\.onCreate\(null\)[ \t]*\n([ \t]*)\}[ \t]*$/m;
const MARKER = 'override fun onSaveInstanceState(outState: Bundle)';
const BUNDLE_IMPORT = 'import android.os.Bundle';

function buildOverrideBlock(indent) {
  return [
    '',
    '// plugins/with-clear-activity-saved-state.js: onCreate durumu hiç geri yüklemiyor',
    '// (super.onCreate(null)); boşaltılmayan paket Binder sınırını aşıp',
    '// TransactionTooLargeException ile kilitleniyordu.',
    `${MARKER} {`,
    '  super.onSaveInstanceState(outState)',
    '  outState.clear()',
    '}',
  ]
    .map((line) => (line ? indent + line : line))
    .join('\n');
}

function addBundleImport(contents) {
  if (contents.includes(BUNDLE_IMPORT)) return contents;

  const imports = [...contents.matchAll(/^import .*$/gm)];
  const lastImport = imports[imports.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;
  return `${contents.slice(0, insertAt)}\n${BUNDLE_IMPORT}${contents.slice(insertAt)}`;
}

/**
 * `MainActivity.kt` içeriğine, kaydedilen durumu boşaltan `onSaveInstanceState`
 * override'ını `onCreate`'in hemen arkasına ekler.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string} contents ham MainActivity.kt metni
 * @returns {string} dönüştürülmüş metin
 * @throws {Error} `onCreate` `super.onCreate(null)` ile bitmiyorsa
 */
function clearActivitySavedState(contents) {
  if (contents.includes(MARKER)) return contents;

  const match = contents.match(ON_CREATE_END);
  if (!match) {
    throw new Error(
      '[with-clear-activity-saved-state] MainActivity.kt içinde super.onCreate(null) ile ' +
        'biten bir onCreate bulunamadı. Şablon kaydedilen durumu geri yüklemeye başladıysa ' +
        'paketi boşaltmak o durumu bozar; kendi onSaveInstanceState override\'ı eklendiyse ' +
        "ikisi çakışır. Şablonu kontrol edip bu plugin'i güncelleyin.",
    );
  }

  const insertAt = match.index + match[0].length;
  const withOverride = `${contents.slice(0, insertAt)}\n${buildOverrideBlock(match[1])}${contents.slice(insertAt)}`;
  return addBundleImport(withOverride);
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withClearActivitySavedState = (config) =>
  withMainActivity(config, (mainActivityConfig) => {
    if (mainActivityConfig.modResults.language !== 'kt') {
      throw new Error('[with-clear-activity-saved-state] Yalnızca Kotlin MainActivity destekleniyor.');
    }
    mainActivityConfig.modResults.contents = clearActivitySavedState(mainActivityConfig.modResults.contents);
    return mainActivityConfig;
  });

module.exports = withClearActivitySavedState;
module.exports.clearActivitySavedState = clearActivitySavedState;
