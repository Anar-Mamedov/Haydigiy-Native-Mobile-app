const { withMainActivity } = require('expo/config-plugins');

/**
 * Play Console'daki `SurfaceControl` NullPointerException kilitlenmesini kapatır
 * (`ActivityThread.syncTransferSplashscreenViewTransaction` ->
 * `SurfaceControl$Transaction.hide`; Android 13, çoğunlukla OPPO/realme).
 *
 * expo-splash-screen, açılış ekranını soldurarak kapatmak için `onCreate`'te bir çıkış
 * animasyonu dinleyicisi kaydediyor. Dinleyici kayıtlıyken Android 12-13, açılış
 * ekranı görünümünü sistemden uygulamaya devrediyor ve devir ilk çizimde, yüzey
 * (surface) serbest bırakılmışsa NullPointerException ile çöküyor
 * (https://issuetracker.google.com/issues/242118185). expo-splash-screen'in kendi
 * önlemi dinleyiciyi yalnızca aktivite durunca temizliyor; kilitlenme ise ilk
 * çizimde olduğundan o önlem yetmiyor.
 *
 * Sistem devre, aktivite devam ettiğinde (`ResumeActivityItem` ->
 * `activityResumed(token, isHandleSplashScreenExit(token))`) dinleyicinin kayıtlı olup
 * olmadığına bakarak karar veriyor. Dinleyici `onPostCreate`'te (onCreate ve onStart
 * sonrası, onResume öncesi) temizlenince devir hiç olmuyor ve sistem açılış ekranını
 * kendi varsayılan geçişiyle kaldırıyor. Bedeli yalnızca Android 12-13'te solma
 * efektinin olmaması; Android 14 ve üstünde efekt korunuyor.
 *
 * `onPostCreate` seçildi çünkü expo-splash-screen'in kayıt satırı app.json'daki plugin
 * sırası yüzünden bu plugin çalıştıktan sonra ekleniyor; `onCreate`'e eklenen bir
 * temizleme kayıttan önce kalırdı. `MainActivity.kt` her prebuild'de yeniden
 * üretildiği için değişiklik ancak bir config plugin ile kalıcı olabilir.
 */
const CLASS_END = /\n\}\s*$/;
const MARKER = '// plugins/with-splash-exit-crash-fix.js:';
const EXISTING_ON_POST_CREATE = /override fun onPostCreate\(/;
const REQUIRED_IMPORTS = ['import android.os.Build', 'import android.os.Bundle'];

function buildOverrideBlock() {
  return [
    '',
    `  ${MARKER} Android 12-13 açılış ekranını uygulamaya`,
    '  // devrederken SurfaceControl NullPointerException ile çöküyor. Dinleyici resume',
    '  // öncesinde temizlenince devir olmaz ve sistem açılış ekranını kendisi kaldırır.',
    '  override fun onPostCreate(savedInstanceState: Bundle?) {',
    '    super.onPostCreate(savedInstanceState)',
    '    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&',
    '        Build.VERSION.SDK_INT <= Build.VERSION_CODES.TIRAMISU) {',
    '      splashScreen.clearOnExitAnimationListener()',
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
 * `MainActivity.kt` içeriğine, Android 12-13'te açılış ekranı çıkış dinleyicisini
 * resume öncesinde temizleyen `onPostCreate` override'ını ekler.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string} contents ham MainActivity.kt metni
 * @returns {string} dönüştürülmüş metin
 * @throws {Error} sınıf sonu bulunamazsa ya da sınıfta zaten bir `onPostCreate` varsa
 */
function skipSplashExitHandoffOnAndroid12To13(contents) {
  if (contents.includes(MARKER)) return contents;

  if (EXISTING_ON_POST_CREATE.test(contents) || !CLASS_END.test(contents)) {
    throw new Error(
      '[with-splash-exit-crash-fix] MainActivity.kt içinde sınıf sonu bulunamadı ya da şablon ' +
        "artık kendi onPostCreate'ini tanımlıyor. Plugin sessizce devre dışı kalırsa Android 13 " +
        "açılış ekranı kilitlenmesi geri döner. Şablonu kontrol edip bu plugin'i güncelleyin.",
    );
  }

  const withOverride = contents.replace(CLASS_END, (classEnd) => `\n${buildOverrideBlock()}${classEnd}`);
  return addMissingImports(withOverride);
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withSplashExitCrashFix = (config) =>
  withMainActivity(config, (mainActivityConfig) => {
    if (mainActivityConfig.modResults.language !== 'kt') {
      throw new Error('[with-splash-exit-crash-fix] Yalnızca Kotlin MainActivity destekleniyor.');
    }
    mainActivityConfig.modResults.contents = skipSplashExitHandoffOnAndroid12To13(
      mainActivityConfig.modResults.contents,
    );
    return mainActivityConfig;
  });

module.exports = withSplashExitCrashFix;
module.exports.skipSplashExitHandoffOnAndroid12To13 = skipSplashExitHandoffOnAndroid12To13;
