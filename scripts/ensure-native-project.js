#!/usr/bin/env node
/**
 * `expo run:<platform>` öncesi native projenin güncel olduğunu garanti eder.
 *
 * ios/ ve android/ gitignore'da (Continuous Native Generation). Expo bu klasörleri
 * yalnızca hiç yoksa üretir; SDK veya native paket yükseltmesinden sonra eski
 * klasörü kullanmaya devam eder ve `pod install` / Gradle sürüm uyuşmazlığıyla
 * patlar. Expo'nun bu durumdaki önerisi `npx expo prebuild --clean` çalıştırmak:
 * https://docs.expo.dev/workflow/continuous-native-generation/
 *
 * Bu script native tarafı etkileyen girdilerin (@expo/fingerprint) hash'ini,
 * klasör son üretildiğinde yazılan damgayla karşılaştırır ve yalnızca fark varsa
 * klasörü yeniden üretir. Fingerprint gitignore'daki native klasörleri hash'e
 * katmaz; bu yüzden yeniden üretim hash'i değiştirmez.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PLATFORMS = ['ios', 'android'];
const STAMP_FILE = '.native-fingerprint';
const UTF8_LOCALE = 'en_US.UTF-8';

function getStampPath(projectRoot, platform) {
  return path.join(projectRoot, platform, STAMP_FILE);
}

function readStoredHash(stampPath) {
  try {
    return fs.readFileSync(stampPath, 'utf8').trim() || null;
  } catch {
    return null;
  }
}

function needsRegeneration({ nativeDirExists, storedHash, currentHash }) {
  return !nativeDirExists || storedHash !== currentHash;
}

// CocoaPods, UTF-8 olmayan bir locale'de (IDE görevleri, CI, .zshrc okumayan
// kabuklar) proje yolunu normalize ederken Encoding::CompatibilityError ile çöker.
function withUtf8Locale(env) {
  const locale = env.LC_ALL || env.LC_CTYPE || env.LANG || '';
  if (/utf-?8/i.test(locale)) {
    return env;
  }
  return { ...env, LANG: UTF8_LOCALE, LC_ALL: UTF8_LOCALE };
}

async function computeNativeHash(projectRoot, platform) {
  const { createProjectHashAsync } = require('@expo/fingerprint');
  return createProjectHashAsync(projectRoot, { platforms: [platform], silent: true });
}

// `expo prebuild --clean` klasörü tek denemede siler. Finder o sırada klasöre
// `.DS_Store` yazarsa silme ENOTEMPTY ile yarıda kalır. Node'un rmSync'i bu hatada
// (ve EBUSY/EPERM'de) bekleyip tekrar dener.
function removeNativeDirectory(projectRoot, platform) {
  fs.rmSync(path.join(projectRoot, platform), {
    force: true,
    maxRetries: 10,
    recursive: true,
    retryDelay: 200,
  });
}

function regenerateNativeProject(projectRoot, platform) {
  removeNativeDirectory(projectRoot, platform);
  const result = spawnSync('npx', ['expo', 'prebuild', '--platform', platform, '--clean'], {
    cwd: projectRoot,
    env: withUtf8Locale(process.env),
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(
      `expo prebuild --platform ${platform} --clean başarısız oldu (çıkış kodu ${result.status}).`,
    );
  }
}

async function ensureNativeProject(projectRoot, platform) {
  const stampPath = getStampPath(projectRoot, platform);
  const currentHash = await computeNativeHash(projectRoot, platform);
  const nativeDirExists = fs.existsSync(path.join(projectRoot, platform));

  if (!needsRegeneration({ nativeDirExists, storedHash: readStoredHash(stampPath), currentHash })) {
    console.log(`✓ ${platform}/ native projesi güncel.`);
    return;
  }

  console.log(
    `→ ${platform}/ native projesi eski veya eksik; yeniden üretiliyor (expo prebuild --clean)…`,
  );
  regenerateNativeProject(projectRoot, platform);
  // Prebuild, fingerprint girdilerini (ör. package.json) değiştirebilir. Damgaya
  // üretimden sonraki hash yazılır ki sonraki çalıştırma gereksiz yere tekrar üretmesin.
  fs.writeFileSync(stampPath, `${await computeNativeHash(projectRoot, platform)}\n`);
}

module.exports = {
  getStampPath,
  needsRegeneration,
  readStoredHash,
  removeNativeDirectory,
  withUtf8Locale,
};

if (require.main === module) {
  const platform = process.argv[2];
  if (!PLATFORMS.includes(platform)) {
    console.error(`Kullanım: node scripts/ensure-native-project.js <${PLATFORMS.join('|')}>`);
    process.exit(1);
  }
  ensureNativeProject(path.resolve(__dirname, '..'), platform).catch((error) => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
  });
}
