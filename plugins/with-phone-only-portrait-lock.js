const { AndroidConfig, withAndroidManifest, withMainActivity } = require('expo/config-plugins');

/**
 * Android'de dikey kilidi yalnızca telefonlara uygular; tablet ve katlanabilirlerde
 * uygulama her yönde çalışır.
 *
 * Play Console "büyük ekranlı cihazlar için yön kısıtlamalarını kaldırın" uyarısı
 * manifest'teki `android:screenOrientation="portrait"`'tan geliyor (`app.json`
 * `orientation`). Android 16, hedef SDK 36 olan uygulamalarda bu kilidi büyük
 * ekranlarda (en kısa kenar >= 600dp) zaten yok sayıyor. Android'in önerdiği yol:
 * manifest'te kilit olmasın, kilit çalışma anında yalnızca küçük ekranlarda
 * istensin. iOS `app.json` ayarını kullanmaya devam eder.
 *
 * Katlanabilir cihaz açılıp kapandığında `configChanges` aktiviteyi yeniden
 * oluşturmadığı için karar `onConfigurationChanged`'da da yeniden veriliyor.
 */
const SCREEN_ORIENTATION = 'android:screenOrientation';
const ON_CREATE_START = /^([ \t]*)override fun onCreate\(savedInstanceState: Bundle\?\) \{[ \t]*$/m;
const CLASS_END = /\n\}\s*$/;
const MARKER = 'lockPortraitOnPhones';
const REQUIRED_IMPORTS = ['import android.content.pm.ActivityInfo', 'import android.content.res.Configuration'];

/**
 * Ana aktivitedeki yön kilidini manifest'ten kaldırır; diğer aktivitelere dokunmaz.
 *
 * @param {object} androidManifest Expo'nun ayrıştırdığı AndroidManifest
 * @returns {object} aynı manifest
 */
function removeMainActivityOrientationLock(androidManifest) {
  const mainActivity = AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);
  delete mainActivity.$[SCREEN_ORIENTATION];
  return androidManifest;
}

function buildMethodsBlock() {
  return [
    '',
    '  override fun onConfigurationChanged(newConfig: Configuration) {',
    '    super.onConfigurationChanged(newConfig)',
    `    ${MARKER}(newConfig)`,
    '  }',
    '',
    '  // plugins/with-phone-only-portrait-lock.js: dikey kilit yalnızca telefonlarda.',
    "  // 600dp, Android'in büyük ekran (sw600dp) eşiği; tablet ve açık katlanabilirler",
    '  // serbest döner.',
    `  private fun ${MARKER}(config: Configuration = resources.configuration) {`,
    '    val orientation = if (config.smallestScreenWidthDp < 600) {',
    '      ActivityInfo.SCREEN_ORIENTATION_PORTRAIT',
    '    } else {',
    '      ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED',
    '    }',
    '    if (requestedOrientation != orientation) {',
    '      requestedOrientation = orientation',
    '    }',
    '  }',
  ].join('\n');
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
 * `MainActivity.kt` içeriğine telefonlara özel dikey kilidi ekler: `onCreate`'in ilk
 * satırında ve her yapılandırma değişikliğinde karar verilir.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string} contents ham MainActivity.kt metni
 * @returns {string} dönüştürülmüş metin
 * @throws {Error} `onCreate` ya da sınıf sonu bulunamazsa
 */
function addPhoneOrientationLock(contents) {
  if (contents.includes(MARKER)) return contents;

  const onCreate = contents.match(ON_CREATE_START);
  if (!onCreate || !CLASS_END.test(contents)) {
    throw new Error(
      '[with-phone-only-portrait-lock] MainActivity.kt içinde onCreate(savedInstanceState: Bundle?) ' +
        "ya da sınıf sonu bulunamadı. Plugin sessizce devre dışı kalırsa manifest'teki kilit " +
        'kaldırıldığı için telefonlar da yatay döner. Şablonu kontrol edip bu plugin\'i güncelleyin.',
    );
  }

  const callAt = onCreate.index + onCreate[0].length;
  const withCall = `${contents.slice(0, callAt)}\n${onCreate[1]}  ${MARKER}()${contents.slice(callAt)}`;
  const withMethods = withCall.replace(CLASS_END, (classEnd) => `\n${buildMethodsBlock()}${classEnd}`);
  return addMissingImports(withMethods);
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withPhoneOnlyPortraitLock = (config) => {
  const withManifest = withAndroidManifest(config, (manifestConfig) => {
    manifestConfig.modResults = removeMainActivityOrientationLock(manifestConfig.modResults);
    return manifestConfig;
  });

  return withMainActivity(withManifest, (mainActivityConfig) => {
    if (mainActivityConfig.modResults.language !== 'kt') {
      throw new Error('[with-phone-only-portrait-lock] Yalnızca Kotlin MainActivity destekleniyor.');
    }
    mainActivityConfig.modResults.contents = addPhoneOrientationLock(mainActivityConfig.modResults.contents);
    return mainActivityConfig;
  });
};

module.exports = withPhoneOnlyPortraitLock;
module.exports.removeMainActivityOrientationLock = removeMainActivityOrientationLock;
module.exports.addPhoneOrientationLock = addPhoneOrientationLock;
