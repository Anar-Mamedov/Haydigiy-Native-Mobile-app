// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    // TypeScript testlerinde `no-undef` zaten kapalı (tip denetleyicisi devralıyor),
    // ama düz JS testlerinde jest global'leri tanımlanmadan hata veriyor.
    files: ['**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  {
    ignores: ['dist/*'],
  },
]);
