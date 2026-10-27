const { execFileSync } = require('child_process');
const path = require('path');
const { clearActivitySavedState } = require('./with-clear-activity-saved-state');
const { addPhoneOrientationLock } = require('./with-phone-only-portrait-lock');
const { skipSplashExitHandoffOnAndroid12To13 } = require('./with-splash-exit-crash-fix');

/**
 * Android 12-13'te açılış ekranı devri SurfaceControl NullPointerException ile çöküyor.
 * Dinleyici resume'dan önce temizlenmezse ya da temizleme Android 14+'ya da uygulanırsa
 * kilitlenme geri döner veya solma efekti gereksiz yere kaybolur.
 */
const PREBUILT = `package com.faprika.haydigiy
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "main"
}
`;

const CLEAR_LINE = '      splashScreen.clearOnExitAnimationListener()';

describe('skipSplashExitHandoffOnAndroid12To13', () => {
  it('clears the listener in onPostCreate, after super and inside the class', () => {
    const result = skipSplashExitHandoffOnAndroid12To13(PREBUILT);
    const lines = result.split('\n');
    const onPostCreate = lines.indexOf('  override fun onPostCreate(savedInstanceState: Bundle?) {');

    expect(lines[onPostCreate + 1]).toBe('    super.onPostCreate(savedInstanceState)');
    expect(lines.indexOf(CLEAR_LINE)).toBeGreaterThan(onPostCreate);
    expect(result.indexOf(CLEAR_LINE)).toBeLessThan(result.trimEnd().lastIndexOf('}'));
  });

  it('only applies to Android 12-13 so newer versions keep the fade', () => {
    expect(skipSplashExitHandoffOnAndroid12To13(PREBUILT)).toContain(
      [
        '    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&',
        '        Build.VERSION.SDK_INT <= Build.VERSION_CODES.TIRAMISU) {',
        CLEAR_LINE,
        '    }',
      ].join('\n'),
    );
  });

  it('adds each missing import once', () => {
    const result = skipSplashExitHandoffOnAndroid12To13(
      PREBUILT.replace('import android.os.Build\n', '').replace('import android.os.Bundle\n', ''),
    );
    const count = (line) => result.split('\n').filter((l) => l === line).length;

    expect(count('import android.os.Build')).toBe(1);
    expect(count('import android.os.Bundle')).toBe(1);
  });

  it('is idempotent so repeated prebuilds do not corrupt the file', () => {
    const once = skipSplashExitHandoffOnAndroid12To13(PREBUILT);

    expect(skipSplashExitHandoffOnAndroid12To13(once)).toBe(once);
  });

  it('works together with the other MainActivity plugins in any order', () => {
    const transforms = [addPhoneOrientationLock, clearActivitySavedState, skipSplashExitHandoffOnAndroid12To13];

    for (const order of [transforms, [...transforms].reverse()]) {
      const result = order.reduce((contents, transform) => transform(contents), PREBUILT);

      expect(result).toContain('    lockPortraitOnPhones()');
      expect(result).toContain('    outState.clear()');
      expect(result).toContain(CLEAR_LINE);
    }
  });

  // İki override çakışırsa Kotlin derlemesi bozulur; sessizce atlamak da kilitlenmeyi geri getirir.
  it('throws when the template already defines onPostCreate', () => {
    const withOwnOnPostCreate = PREBUILT.replace(
      '  override fun getMainComponentName',
      '  override fun onPostCreate(savedInstanceState: Bundle?) {\n    super.onPostCreate(savedInstanceState)\n  }\n\n  override fun getMainComponentName',
    );

    expect(() => skipSplashExitHandoffOnAndroid12To13(withOwnOnPostCreate)).toThrow(/onPostCreate/);
  });
});

/**
 * Kayıt satırını prebuild sırasında expo-splash-screen'in kendi plugin'i ekliyor ve
 * app.json'daki sırası yüzünden bu plugin'den SONRA çalışıyor. Test, kurulu Expo
 * şablonuna kurulu expo-splash-screen mod'unu her iki sırada uygulayıp kaydın
 * onCreate'te, temizlemenin onPostCreate'te kaldığını doğrular; Expo yükseltmesi bu
 * varsayımı bozarsa plugin'in gözden geçirilmesini zorlar.
 */
describe('installed Expo prebuild template with expo-splash-screen', () => {
  function packageFile(packageName, relativePath) {
    return path.join(path.dirname(require.resolve(`${packageName}/package.json`)), relativePath);
  }

  async function applyExpoSplashScreenMod(contents) {
    const { withAndroidSplashMainActivity } = require(
      packageFile('expo-splash-screen', 'plugin/build/withAndroidSplashMainActivity.js'),
    );
    const config = withAndroidSplashMainActivity({ name: 'haydigiy', slug: 'haydigiy' });
    const result = await config.mods.android.mainActivity({
      modRequest: { introspect: false, modName: 'mainActivity', platform: 'android' },
      modResults: { contents, language: 'kt', path: 'MainActivity.kt' },
    });
    return result.modResults.contents;
  }

  const template = () =>
    execFileSync(
      'tar',
      ['-xzOf', packageFile('expo', 'template.tgz'), 'package/android/app/src/main/java/com/helloworld/MainActivity.kt'],
      { encoding: 'utf8' },
    );

  it.each([
    ['before', async (contents) => applyExpoSplashScreenMod(skipSplashExitHandoffOnAndroid12To13(contents))],
    ['after', async (contents) => skipSplashExitHandoffOnAndroid12To13(await applyExpoSplashScreenMod(contents))],
  ])('registers in onCreate and clears in onPostCreate when this plugin runs %s expo', async (_, run) => {
    const lines = (await run(template())).split('\n');
    const register = lines.indexOf('    SplashScreenManager.registerOnActivity(this)');
    const onCreate = lines.indexOf('  override fun onCreate(savedInstanceState: Bundle?) {');
    const onPostCreate = lines.indexOf('  override fun onPostCreate(savedInstanceState: Bundle?) {');

    expect(register).toBeGreaterThan(onCreate);
    expect(register).toBeLessThan(lines.indexOf('    super.onCreate(null)'));
    expect(lines.indexOf(CLEAR_LINE)).toBeGreaterThan(onPostCreate);
    expect(onPostCreate).toBeGreaterThan(-1);
  });
});
