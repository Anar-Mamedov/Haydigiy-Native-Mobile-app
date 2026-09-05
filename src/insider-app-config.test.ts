/* eslint-disable @typescript-eslint/no-require-imports */
import appJson from '../app.json';

describe('Insider Expo configuration', () => {
  const createConfig = require('../app.config.js');

  it('configures Insider push targets and Android notification permission', () => {
    const config = createConfig({ config: appJson.expo });
    const buildPropertiesPlugin = config.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties',
    );
    const insiderPlugin = config.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-insider-plugin',
    );

    // Insider push extension'ları Podfile'da `use_frameworks!` ile geldiği için
    // ana hedefin de framework modunda olması gerekir; `dynamic` ise RN New
    // Architecture'ı kırar. Tek geçerli değer `static` (regresyon koruması).
    expect(buildPropertiesPlugin?.[1].ios).toEqual({
      useFrameworks: 'static',
    });

    // R8 kapalıyken Play Console'un "uygulama optimizasyonu" raporunda kod
    // karartma oranı %3'te kalıyor ve Play, %25'in altındaki uygulamaların
    // görünürlüğünü kısıtlıyor (regresyon koruması).
    expect(buildPropertiesPlugin?.[1].android).toEqual({
      enableMinifyInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
    });

    // Play Console "R8 optimizasyonu" kartının uygulama tarafından kapatılabilen
    // maddelerini uygulayan yerel plugin kayıtlı kalmalı.
    expect(config.plugins).toContain('./plugins/with-r8-optimization');

    // Expo mod zincirinde son kaydedilen plugin ilk çalışır; bizim plugin'in
    // native dosyalara en son yazması için expo-build-properties'ten ÖNCE
    // kayıtlı olması gerekiyor (regresyon koruması).
    const r8PluginIndex = config.plugins.indexOf('./plugins/with-r8-optimization');
    const buildPropertiesIndex = config.plugins.findIndex(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties',
    );
    expect(r8PluginIndex).toBeGreaterThanOrEqual(0);
    expect(r8PluginIndex).toBeLessThan(buildPropertiesIndex);
    expect(insiderPlugin?.[1]).toEqual(
      expect.objectContaining({
        appGroup: 'group.com.faprika.haydigiy.app',
        partnerName: 'haydigiyprod',
        insiderRichPush: true,
        insiderAdvancedPush: true,
        minimumDeploymentTarget: '15.1',
      }),
    );
    expect(config.android.googleServicesFile).toBe('./google-services.json');
    expect(config.android.permissions).toContain('android.permission.POST_NOTIFICATIONS');
  });

  it('blocks optional geofence permissions', () => {
    const config = createConfig({ config: appJson.expo });

    expect(config.android.blockedPermissions).toEqual(
      expect.arrayContaining([
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_BACKGROUND_LOCATION',
      ]),
    );
  });
});
