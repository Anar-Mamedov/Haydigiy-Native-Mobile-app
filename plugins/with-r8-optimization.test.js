const withR8Optimization = require('./with-r8-optimization');

/**
 * Bileşik plugin, Play Console "R8 optimizasyonu" kartının uygulama tarafından
 * kapatılabilen iki maddesini birlikte uygulamalı. Biri düşerse ilgili madde
 * sessizce geri döneceği için ikisinin de kayıtlı kaldığını doğruluyoruz.
 */
describe('withR8Optimization', () => {
  const baseConfig = { name: 'Haydigiy', slug: 'haydigiy-webview-app' };

  it('registers both the build.gradle and gradle.properties mods', () => {
    const config = withR8Optimization(baseConfig);

    expect(typeof config.mods?.android?.appBuildGradle).toBe('function');
    expect(typeof config.mods?.android?.gradleProperties).toBe('function');
  });

  it('leaves the rest of the config untouched', () => {
    const config = withR8Optimization(baseConfig);

    expect(config.name).toBe('Haydigiy');
    expect(config.slug).toBe('haydigiy-webview-app');
  });
});
