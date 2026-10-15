const { withMainApplication } = require('expo/config-plugins');

/**
 * Play Console'daki en sık kilitlenmeyi (`libreactnative.so`
 * `findShadowNodeByTagRecursively` SIGSEGV) kapatan React Native düzeltmesini açar.
 *
 * Kullanıcı bir metin kutusuna dokununca Android, klavyenin "ileri" tuşu için bir
 * sonraki odaklanılabilir öğeyi arıyor (`TextView.onCreateInputConnection` ->
 * `ReactScrollView.focusSearch` -> `FabricUIManager.findNextFocusableElement` /
 * `getRelativeAncestorList`). Bu yol `UIManager::findShadowNodeByTag_DEPRECATED`
 * çağırıyor; fonksiyon kök gölge düğümünü ham işaretçiyle gezdiği için JS aynı anda
 * yeni bir ağaç commit ederse serbest bırakılmış belleğe erişiyor (use-after-free).
 *
 * RN 0.86.3'te düzeltme `fixFindShadowNodeByTagRaceCondition` bayrağının arkasında ve
 * varsayılanı kapalı; RN 0.88'de bayrak kaldırılıp düzeltme koşulsuz hale getirildi.
 * Bu plugin aynı düzeltmeyi bayrakla açar.
 *
 * Bayraklar `loadReactNative` içinde bir kez ayarlanıyor ve RN ikinci kez
 * `override`'a izin vermiyor; bu yüzden hemen ardından `dangerouslyForceOverride`
 * kullanılıyor. Bu noktada React çalışma zamanı henüz başlamamış olduğundan güvenli.
 * Sağlayıcı STABLE seviyesinin kullandığı varsayılanları genişletir, yalnızca bu
 * bayrak farklıdır. `MainApplication.kt` her prebuild'de yeniden üretildiği için
 * değişiklik ancak bir config plugin ile kalıcı olabilir.
 */
const LOAD_REACT_NATIVE = /^([ \t]*)loadReactNative\(this\)[ \t]*$/m;
const MARKER = 'fixFindShadowNodeByTagRaceCondition';
const REQUIRED_IMPORTS = [
  'import com.facebook.react.common.ReleaseLevel',
  'import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint',
  'import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags',
  'import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlagsDefaults',
];

function buildOverrideBlock(indent) {
  return [
    '// plugins/with-find-shadow-node-race-fix.js: RN 0.88\'de varsayılan olan',
    '// findShadowNodeByTag yarış durumu düzeltmesi (Play Console\'daki en sık SIGSEGV).',
    'if (DefaultNewArchitectureEntryPoint.releaseLevel == ReleaseLevel.STABLE) {',
    '  ReactNativeFeatureFlags.dangerouslyForceOverride(',
    '    object : ReactNativeNewArchitectureFeatureFlagsDefaults() {',
    `      override fun ${MARKER}(): Boolean = true`,
    '    }',
    '  )',
    '}',
  ]
    .map((line) => indent + line)
    .join('\n');
}

function addMissingImports(contents) {
  const missing = REQUIRED_IMPORTS.filter((line) => !contents.includes(line));
  if (missing.length === 0) return contents;

  const imports = [...contents.matchAll(/^import .*$/gm)];
  const lastImport = imports[imports.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;
  return `${contents.slice(0, insertAt)}\n${missing.join('\n')}${contents.slice(insertAt)}`;
}

/**
 * `MainApplication.kt` içeriğine bayrak override'ını ekler.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string} contents ham MainApplication.kt metni
 * @returns {string} dönüştürülmüş metin
 * @throws {Error} `loadReactNative(this)` satırı bulunamazsa
 */
function enableFindShadowNodeRaceFix(contents) {
  if (contents.includes(MARKER)) return contents;

  const match = contents.match(LOAD_REACT_NATIVE);
  if (!match) {
    throw new Error(
      '[with-find-shadow-node-race-fix] MainApplication.kt içinde loadReactNative(this) ' +
        'bulunamadı. Expo/React Native şablonu değişmiş olabilir; plugin sessizce devre ' +
        'dışı kalırsa findShadowNodeByTagRecursively kilitlenmesi geri döner. Şablonu ' +
        "kontrol edip bu plugin'i güncelleyin.",
    );
  }

  const insertAt = match.index + match[0].length;
  const withOverride = `${contents.slice(0, insertAt)}\n${buildOverrideBlock(match[1])}${contents.slice(insertAt)}`;
  return addMissingImports(withOverride);
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withFindShadowNodeRaceFix = (config) =>
  withMainApplication(config, (mainApplicationConfig) => {
    if (mainApplicationConfig.modResults.language !== 'kt') {
      throw new Error('[with-find-shadow-node-race-fix] Yalnızca Kotlin MainApplication destekleniyor.');
    }
    mainApplicationConfig.modResults.contents = enableFindShadowNodeRaceFix(
      mainApplicationConfig.modResults.contents,
    );
    return mainApplicationConfig;
  });

module.exports = withFindShadowNodeRaceFix;
module.exports.enableFindShadowNodeRaceFix = enableFindShadowNodeRaceFix;
