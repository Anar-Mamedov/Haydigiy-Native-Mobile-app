const fs = require('fs');
const path = require('path');
const { enableFindShadowNodeRaceFix } = require('./with-find-shadow-node-race-fix');

/**
 * Play Console'daki en sık kilitlenme (`findShadowNodeByTagRecursively` SIGSEGV),
 * RN'in varsayılanı kapalı `fixFindShadowNodeByTagRaceCondition` düzeltmesi
 * açılarak kapatılıyor. Dönüşüm bozulursa kilitlenme sessizce geri döner.
 */
const TEMPLATE = `package com.faprika.haydigiy

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint

import expo.modules.ApplicationLifecycleDispatcher

class MainApplication : Application(), ReactApplication {
  override fun onCreate() {
    super.onCreate()
    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }
}
`;

const FEATURE_FLAGS_DIR = path.join(
  path.dirname(require.resolve('react-native/package.json')),
  'ReactAndroid/src/main/java/com/facebook/react/internal/featureflags',
);

describe('enableFindShadowNodeRaceFix', () => {
  it('turns the race fix on right after React Native loads its feature flags', () => {
    const lines = enableFindShadowNodeRaceFix(TEMPLATE).split('\n');
    const loadIndex = lines.indexOf('    loadReactNative(this)');

    expect(lines.slice(loadIndex + 1, loadIndex + 10).join('\n')).toContain(
      'override fun fixFindShadowNodeByTagRaceCondition(): Boolean = true',
    );
    expect(lines.indexOf('    ApplicationLifecycleDispatcher.onApplicationCreate(this)')).toBeGreaterThan(
      loadIndex + 9,
    );
  });

  it('keeps the STABLE flag defaults for every other flag', () => {
    const result = enableFindShadowNodeRaceFix(TEMPLATE);

    expect(result).toContain('if (DefaultNewArchitectureEntryPoint.releaseLevel == ReleaseLevel.STABLE) {');
    expect(result).toContain('object : ReactNativeNewArchitectureFeatureFlagsDefaults() {');
  });

  it('adds the feature flag imports without duplicating existing ones', () => {
    const result = enableFindShadowNodeRaceFix(TEMPLATE);
    const count = (line) => result.split('\n').filter((l) => l === line).length;

    expect(count('import com.facebook.react.internal.featureflags.ReactNativeFeatureFlags')).toBe(1);
    expect(
      count('import com.facebook.react.internal.featureflags.ReactNativeNewArchitectureFeatureFlagsDefaults'),
    ).toBe(1);
    expect(count('import com.facebook.react.common.ReleaseLevel')).toBe(1);
  });

  it('is idempotent so repeated prebuilds do not corrupt the file', () => {
    const once = enableFindShadowNodeRaceFix(TEMPLATE);

    expect(enableFindShadowNodeRaceFix(once)).toBe(once);
  });

  // Sessiz başarısızlık, kilitlenmenin fark edilmeden geri dönmesi demek olurdu.
  it('throws instead of silently doing nothing when loadReactNative is missing', () => {
    expect(() => enableFindShadowNodeRaceFix('class MainApplication : Application()')).toThrow(
      /loadReactNative/,
    );
  });
});

/**
 * Override, RN'in bugünkü davranışına dayanıyor. RN yükseltildiğinde bu varsayımlar
 * bozulursa test plugin'in gözden geçirilmesini zorlar.
 */
describe('installed React Native', () => {
  it('still ships the race fix behind a flag that is off by default', () => {
    const defaults = fs.readFileSync(path.join(FEATURE_FLAGS_DIR, 'ReactNativeFeatureFlagsDefaults.kt'), 'utf8');

    // RN 0.88 bayrağı kaldırıp düzeltmeyi koşulsuz yaptı; o zaman bu plugin silinmeli.
    expect(defaults).toContain('override fun fixFindShadowNodeByTagRaceCondition(): Boolean = false');
  });

  it('applies no STABLE overrides on top of the defaults the plugin extends', () => {
    const stable = fs.readFileSync(
      path.join(FEATURE_FLAGS_DIR, 'ReactNativeFeatureFlagsOverrides_RNOSS_Stable_Android.kt'),
      'utf8',
    );

    expect(stable).toMatch(/:\s*ReactNativeNewArchitectureFeatureFlagsDefaults\(\)/);
    expect(stable).not.toMatch(/override fun/);
  });
});
