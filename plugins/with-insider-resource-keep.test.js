const fs = require('fs');
const os = require('os');
const path = require('path');

const withInsiderResourceKeep = require('./with-insider-resource-keep');

const { buildKeepXml, writeKeepFile, INSIDER_RESOURCE_PATTERNS, KEEP_FILE_RELATIVE_PATH } =
  withInsiderResourceKeep;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Bir `tools:keep` kalıp listesinin verilen kaynağı tutup tutmadığını kaynak
 * küçültücünün kuralıyla (`*` herhangi bir karakter dizisi) hesaplar.
 */
function isKept(patterns, type, name) {
  return patterns.some((pattern) => {
    const [patternType, patternName] = pattern.replace(/^@/, '').split('/');
    if (patternType !== type) return false;

    return new RegExp(`^${patternName.split('*').map(escapeRegExp).join('.*')}$`).test(name);
  });
}

/**
 * Optimize kaynak küçültme açıkken Insider SDK'sının adıyla aradığı kaynaklar
 * release paketinden siliniyordu; carousel push'ları görselsiz geliyordu. Liste
 * eksilirse hata sessizce geri döner, bu yüzden SDK'nın aradığı her isim ayrı
 * ayrı doğrulanıyor.
 */
describe('INSIDER_RESOURCE_PATTERNS', () => {
  it.each([
    ['layout', 'ins_lay_xcv_carousel'],
    ['layout', 'ins_lay_xcv_slider'],
    ['layout', 'ins_lay_xcv_discovery'],
    ['dimen', 'ins_car_im_size'],
    ['dimen', 'ins_car_disc_size'],
    ['drawable', 'insider_notification_icon'],
    ['mipmap', 'insider_notification_icon'],
    ['drawable', 'insider_notification_large_icon'],
    ['color', 'insider_notification_circle_color'],
    ['integer', 'insider_notification_push_priority'],
    ['bool', 'insider_advanced_notification_icon_flag'],
  ])('keeps the %s resource %s that the Insider SDK resolves by name', (type, name) => {
    expect(isKept(INSIDER_RESOURCE_PATTERNS, type, name)).toBe(true);
  });

  // Kalıplar genişlerse küçültme işe yaramaz hale gelir.
  it.each([
    ['layout', 'activity_main'],
    ['drawable', 'splashscreen_logo'],
    ['dimen', 'notification_large_icon_width'],
  ])('does not keep the unrelated %s resource %s', (type, name) => {
    expect(isKept(INSIDER_RESOURCE_PATTERNS, type, name)).toBe(false);
  });
});

describe('buildKeepXml', () => {
  it('declares every pattern in a single tools:keep attribute', () => {
    const xml = buildKeepXml(['@layout/ins_*', '@dimen/ins_*']);

    expect(xml).toContain('<resources xmlns:tools="http://schemas.android.com/tools"');
    expect(xml).toContain('tools:keep="@layout/ins_*,@dimen/ins_*"');
  });
});

describe('writeKeepFile', () => {
  let platformProjectRoot;

  beforeEach(() => {
    platformProjectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'insider-keep-'));
  });

  afterEach(() => {
    fs.rmSync(platformProjectRoot, { force: true, recursive: true });
  });

  // R8 yalnızca res/raw altındaki XML dosyalarını koruma kuralı olarak okuyor.
  it('writes the keep rules as an XML file under res/raw', () => {
    const filePath = writeKeepFile(platformProjectRoot);

    expect(filePath).toBe(path.join(platformProjectRoot, KEEP_FILE_RELATIVE_PATH));
    expect(path.dirname(KEEP_FILE_RELATIVE_PATH)).toBe(
      path.join('app', 'src', 'main', 'res', 'raw'),
    );
    expect(path.extname(KEEP_FILE_RELATIVE_PATH)).toBe('.xml');
    expect(fs.readFileSync(filePath, 'utf8')).toBe(buildKeepXml(INSIDER_RESOURCE_PATTERNS));
  });

  it('produces the same single file across repeated prebuilds', () => {
    const filePath = writeKeepFile(platformProjectRoot);
    const firstContents = fs.readFileSync(filePath, 'utf8');

    writeKeepFile(platformProjectRoot);

    expect(fs.readFileSync(filePath, 'utf8')).toBe(firstContents);
    expect(fs.readdirSync(path.dirname(filePath))).toEqual([path.basename(filePath)]);
  });
});

describe('withInsiderResourceKeep', () => {
  const baseConfig = { name: 'Haydigiy', slug: 'haydigiy-webview-app' };

  it('registers an Android dangerous mod that writes the keep file', () => {
    const config = withInsiderResourceKeep(baseConfig);

    expect(typeof config.mods?.android?.dangerous).toBe('function');
  });

  it('leaves the rest of the config untouched', () => {
    const config = withInsiderResourceKeep(baseConfig);

    expect(config.name).toBe('Haydigiy');
    expect(config.slug).toBe('haydigiy-webview-app');
  });
});
