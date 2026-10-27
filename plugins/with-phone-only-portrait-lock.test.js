const { execFileSync } = require('child_process');
const path = require('path');
const { clearActivitySavedState } = require('./with-clear-activity-saved-state');
const { addPhoneOrientationLock, removeMainActivityOrientationLock } = require('./with-phone-only-portrait-lock');

/**
 * Dikey kilit manifest'ten kaldırılıp çalışma anında yalnızca telefonlarda
 * uygulanıyor. Kotlin tarafı bozulursa telefonlar da yatay döner; manifest tarafı
 * bozulursa Play büyük ekran uyarısı geri gelir.
 */
const TEMPLATE = `package com.faprika.haydigiy
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    SplashScreenManager.registerOnActivity(this)
    super.onCreate(null)
  }

  override fun getMainComponentName(): String = "main"
}
`;

function buildManifest() {
  return {
    manifest: {
      application: [
        {
          activity: [
            {
              $: {
                'android:name': '.MainActivity',
                'android:screenOrientation': 'portrait',
                'android:launchMode': 'singleTask',
              },
              'intent-filter': [
                {
                  action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
                  category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
                },
              ],
            },
            { $: { 'android:name': '.OtherActivity', 'android:screenOrientation': 'landscape' } },
          ],
        },
      ],
    },
  };
}

describe('removeMainActivityOrientationLock', () => {
  it('drops the portrait lock from the launcher activity only', () => {
    const [main, other] = removeMainActivityOrientationLock(buildManifest()).manifest.application[0].activity;

    expect(main.$).not.toHaveProperty('android:screenOrientation');
    expect(main.$['android:launchMode']).toBe('singleTask');
    expect(other.$['android:screenOrientation']).toBe('landscape');
  });
});

describe('addPhoneOrientationLock', () => {
  it('decides the orientation before anything else runs in onCreate', () => {
    const lines = addPhoneOrientationLock(TEMPLATE).split('\n');
    const onCreate = lines.indexOf('  override fun onCreate(savedInstanceState: Bundle?) {');

    expect(lines[onCreate + 1]).toBe('    lockPortraitOnPhones()');
  });

  it('locks portrait below the 600dp large-screen threshold and frees larger screens', () => {
    const result = addPhoneOrientationLock(TEMPLATE);

    expect(result).toContain('if (config.smallestScreenWidthDp < 600) {');
    expect(result).toContain('      ActivityInfo.SCREEN_ORIENTATION_PORTRAIT');
    expect(result).toContain('      ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED');
  });

  it('re-evaluates when a foldable is opened or closed', () => {
    expect(addPhoneOrientationLock(TEMPLATE)).toContain(
      [
        '  override fun onConfigurationChanged(newConfig: Configuration) {',
        '    super.onConfigurationChanged(newConfig)',
        '    lockPortraitOnPhones(newConfig)',
        '  }',
      ].join('\n'),
    );
  });

  it('keeps the methods inside the class and adds each import once', () => {
    const result = addPhoneOrientationLock(TEMPLATE);
    const count = (line) => result.split('\n').filter((l) => l === line).length;

    expect(result.trimEnd().endsWith('}')).toBe(true);
    expect(result.indexOf('private fun lockPortraitOnPhones')).toBeLessThan(result.trimEnd().lastIndexOf('}'));
    expect(count('import android.content.pm.ActivityInfo')).toBe(1);
    expect(count('import android.content.res.Configuration')).toBe(1);
  });

  it('is idempotent so repeated prebuilds do not corrupt the file', () => {
    const once = addPhoneOrientationLock(TEMPLATE);

    expect(addPhoneOrientationLock(once)).toBe(once);
  });

  it('works together with the saved-state plugin in either order', () => {
    const lockFirst = clearActivitySavedState(addPhoneOrientationLock(TEMPLATE));
    const clearFirst = addPhoneOrientationLock(clearActivitySavedState(TEMPLATE));

    for (const result of [lockFirst, clearFirst]) {
      expect(result).toContain('    lockPortraitOnPhones()');
      expect(result).toContain('    outState.clear()');
    }
  });

  // Sessiz başarısızlık, manifest kilidi kalktığı için telefonların da dönmesi demek.
  it('throws instead of silently doing nothing when onCreate is missing', () => {
    expect(() => addPhoneOrientationLock('class MainActivity : ReactActivity() {\n}\n')).toThrow(/onCreate/);
  });
});

/**
 * Plugin, Expo şablonundaki onCreate imzasına dayanıyor. Expo yükseltildiğinde bu
 * varsayım bozulursa test plugin'in gözden geçirilmesini zorlar.
 */
describe('installed Expo prebuild template', () => {
  it('still accepts the phone orientation lock', () => {
    const templateArchive = path.join(path.dirname(require.resolve('expo/package.json')), 'template.tgz');
    const template = execFileSync(
      'tar',
      ['-xzOf', templateArchive, 'package/android/app/src/main/java/com/helloworld/MainActivity.kt'],
      { encoding: 'utf8' },
    );

    expect(addPhoneOrientationLock(template)).toContain('    lockPortraitOnPhones()');
  });
});
