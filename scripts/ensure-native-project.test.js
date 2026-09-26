const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  getStampPath,
  needsRegeneration,
  readStoredHash,
  removeNativeDirectory,
  withUtf8Locale,
} = require('./ensure-native-project');

/**
 * Native proje yalnızca gerçekten gerektiğinde yeniden üretilmeli: gereksiz üretim
 * her `npm run ios` çalıştırmasını dakikalarca uzatır, eksik üretim ise eski
 * Podfile.lock ile `pod install` sürüm uyuşmazlığı hatasını geri getirir.
 */
describe('needsRegeneration', () => {
  const hash = 'abc123';

  it('regenerates when the native directory is missing', () => {
    expect(needsRegeneration({ nativeDirExists: false, storedHash: hash, currentHash: hash })).toBe(
      true,
    );
  });

  it('regenerates a native directory that was never stamped', () => {
    expect(needsRegeneration({ nativeDirExists: true, storedHash: null, currentHash: hash })).toBe(
      true,
    );
  });

  it('regenerates when native inputs changed since the last prebuild', () => {
    expect(needsRegeneration({ nativeDirExists: true, storedHash: 'old', currentHash: hash })).toBe(
      true,
    );
  });

  it('keeps an up-to-date native directory', () => {
    expect(needsRegeneration({ nativeDirExists: true, storedHash: hash, currentHash: hash })).toBe(
      false,
    );
  });
});

describe('withUtf8Locale', () => {
  it('forces a UTF-8 locale when none is set, as CocoaPods requires', () => {
    expect(withUtf8Locale({ PATH: '/bin' })).toEqual({
      PATH: '/bin',
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
    });
  });

  it('keeps an existing UTF-8 locale untouched', () => {
    const env = { LANG: 'tr_TR.UTF-8' };

    expect(withUtf8Locale(env)).toBe(env);
  });

  it('overrides a non-UTF-8 LC_ALL, which takes precedence over LANG', () => {
    expect(withUtf8Locale({ LC_ALL: 'C', LANG: 'en_US.UTF-8' }).LC_ALL).toBe('en_US.UTF-8');
  });
});

describe('stamp file', () => {
  it('lives inside the generated native directory so --clean removes it too', () => {
    expect(getStampPath('/app', 'ios')).toBe(path.join('/app', 'ios', '.native-fingerprint'));
  });

  it('reads as missing when the file does not exist', () => {
    expect(readStoredHash('/definitely/missing/.native-fingerprint')).toBeNull();
  });
});

describe('removeNativeDirectory', () => {
  it('removes the whole generated tree, including Finder metadata files', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ensure-native-'));
    fs.mkdirSync(path.join(projectRoot, 'ios', 'Pods'), { recursive: true });
    fs.writeFileSync(path.join(projectRoot, 'ios', '.DS_Store'), '');
    fs.writeFileSync(path.join(projectRoot, 'ios', 'Pods', 'Manifest.lock'), '');

    removeNativeDirectory(projectRoot, 'ios');

    expect(fs.existsSync(path.join(projectRoot, 'ios'))).toBe(false);
    fs.rmSync(projectRoot, { force: true, recursive: true });
  });

  it('does nothing when the native directory does not exist', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ensure-native-'));

    expect(() => removeNativeDirectory(projectRoot, 'android')).not.toThrow();
    fs.rmSync(projectRoot, { force: true, recursive: true });
  });
});
