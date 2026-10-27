const { execFileSync } = require('child_process');
const path = require('path');
const { clearActivitySavedState } = require('./with-clear-activity-saved-state');

/**
 * Uygulama arka plana alınırken kaydedilen durum paketi Binder sınırını aşıyor ve
 * `TransactionTooLargeException` ile kilitleniyordu. Paket, onCreate durumu geri
 * yüklemediği için boşaltılıyor. Dönüşüm bozulursa kilitlenme sessizce geri döner.
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

describe('clearActivitySavedState', () => {
  it('clears the saved state right after the base class has written it', () => {
    const result = clearActivitySavedState(TEMPLATE);

    expect(result).toContain(
      [
        '  override fun onSaveInstanceState(outState: Bundle) {',
        '    super.onSaveInstanceState(outState)',
        '    outState.clear()',
        '  }',
      ].join('\n'),
    );
  });

  it('places the override between onCreate and the rest of the activity', () => {
    const lines = clearActivitySavedState(TEMPLATE).split('\n');
    const onCreateEnd = lines.indexOf('    super.onCreate(null)') + 1;

    expect(lines[onCreateEnd]).toBe('  }');
    expect(lines.indexOf('  override fun onSaveInstanceState(outState: Bundle) {')).toBeGreaterThan(onCreateEnd);
    expect(lines.indexOf('  override fun onSaveInstanceState(outState: Bundle) {')).toBeLessThan(
      lines.indexOf('  override fun getMainComponentName(): String = "main"'),
    );
  });

  it('adds the Bundle import only when it is missing', () => {
    const count = (contents) => contents.split('\n').filter((l) => l === 'import android.os.Bundle').length;
    const withoutImport = TEMPLATE.replace('import android.os.Bundle\n', '');

    expect(count(clearActivitySavedState(TEMPLATE))).toBe(1);
    expect(count(clearActivitySavedState(withoutImport))).toBe(1);
  });

  it('is idempotent so repeated prebuilds do not corrupt the file', () => {
    const once = clearActivitySavedState(TEMPLATE);

    expect(clearActivitySavedState(once)).toBe(once);
  });

  // Durum geri yükleniyorsa paketi boşaltmak o durumu bozar; sessizce eklenmemeli.
  it('throws when onCreate restores the saved state', () => {
    const restoring = TEMPLATE.replace('super.onCreate(null)', 'super.onCreate(savedInstanceState)');

    expect(() => clearActivitySavedState(restoring)).toThrow(/super\.onCreate\(null\)/);
  });
});

/**
 * Plugin, Expo şablonunun durumu geri yüklememesine dayanıyor. Expo yükseltildiğinde
 * bu varsayım bozulursa test plugin'in gözden geçirilmesini zorlar.
 */
describe('installed Expo prebuild template', () => {
  const templateArchive = path.join(path.dirname(require.resolve('expo/package.json')), 'template.tgz');
  const readTemplateMainActivity = () =>
    execFileSync('tar', ['-xzOf', templateArchive, 'package/android/app/src/main/java/com/helloworld/MainActivity.kt'], {
      encoding: 'utf8',
    });

  it('still discards the saved state in onCreate and accepts the override', () => {
    const template = readTemplateMainActivity();

    expect(template).toContain('super.onCreate(null)');
    expect(clearActivitySavedState(template)).toContain('outState.clear()');
  });
});
