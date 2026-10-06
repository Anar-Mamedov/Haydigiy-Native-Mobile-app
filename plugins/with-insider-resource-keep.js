const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

/**
 * Insider Android SDK'sının çalışma anında ADIYLA aradığı kaynakları release
 * kaynak küçültmesinden korur.
 *
 * SDK (`com.useinsider:insider`) carousel / slider / discovery push'larının
 * layout'larını ve görsel boyutlarını kodda `R.layout.x` gibi sabitlerle değil,
 * `Resources.getIdentifier(isim, tür, paket)` ile buluyor. Klasik kaynak küçültücü
 * `getIdentifier` çağrısı gördüğünde koddaki string sabitleriyle eşleşen kaynakları
 * tutuyordu. `android.r8.optimizedResourceShrinking` (bkz.
 * `with-optimized-resource-shrinking`) bu korumayı uygulamıyor. Bayrak build
 * 41'de açıldığından beri bu kaynaklar release paketinden siliniyor: SDK carousel'i
 * kuramıyor ve bildirim görselsiz geliyor. SDK kendi `keep.xml` dosyasını
 * göndermediği için koruma listesini uygulama veriyor.
 *
 * `res/raw` altındaki `tools:keep` dosyası hem klasik hem optimize küçültücüde
 * geçerli ve uygulamaya paketlenmiyor:
 * https://developer.android.com/topic/performance/app-optimization/customize-which-resources-to-keep
 *
 * `android/` her prebuild'de yeniden üretildiği için dosya ancak bir config plugin
 * ile kalıcı olabilir. Native klasöre yeni bir dosya ekleyen hazır bir mod
 * olmadığından dangerous mod kullanılıyor.
 */

/** `android/` köküne göre koruma dosyasının yolu. */
const KEEP_FILE_RELATIVE_PATH = path.join('app', 'src', 'main', 'res', 'raw', 'insider_keep.xml');

/**
 * SDK'nın adıyla aradığı kaynak kalıpları:
 * - `ins_` önekliler SDK'nın kendi kaynakları (`ins_lay_xcv_carousel`,
 *   `ins_lay_xcv_slider`, `ins_lay_xcv_discovery`, `ins_car_im_size`, `ins_car_disc_size`).
 * - `insider_` önekliler uygulamanın isteğe bağlı tanımlayabileceği push
 *   özelleştirmeleri (`insider_notification_icon`, `insider_notification_large_icon`,
 *   `insider_notification_circle_color`, `insider_notification_push_priority`,
 *   `insider_advanced_notification_icon_flag`). Şu an hiçbiri tanımlı değil; kalıp
 *   yalnızca var olan kaynakları tutar, ileride eklenirlerse sessizce silinmezler.
 */
const INSIDER_RESOURCE_PATTERNS = [
  '@layout/ins_*',
  '@dimen/ins_*',
  '@drawable/insider_*',
  '@mipmap/insider_*',
  '@color/insider_*',
  '@integer/insider_*',
  '@bool/insider_*',
];

/**
 * Verilen kalıpları koruyan `tools:keep` dosyasının içeriğini üretir.
 *
 * Saf fonksiyon: Expo mod sisteminden bağımsız test edilebilir.
 *
 * @param {string[]} patterns `@tür/isim` biçiminde, `*` joker karakterli kalıplar
 * @returns {string} XML metni
 */
function buildKeepXml(patterns) {
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<!-- plugins/with-insider-resource-keep.js tarafından üretilir; elle düzenlemeyin. -->',
    '<resources xmlns:tools="http://schemas.android.com/tools"',
    `    tools:keep="${patterns.join(',')}" />`,
    '',
  ].join('\n');
}

/**
 * Koruma dosyasını native Android projesine yazar.
 *
 * Her çağrıda aynı içeriği baştan yazar; tekrarlanan prebuild'lerde dosya
 * çoğalmaz veya bozulmaz.
 *
 * @param {string} platformProjectRoot `android/` klasörünün mutlak yolu
 * @returns {string} yazılan dosyanın yolu
 */
function writeKeepFile(platformProjectRoot) {
  const filePath = path.join(platformProjectRoot, KEEP_FILE_RELATIVE_PATH);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buildKeepXml(INSIDER_RESOURCE_PATTERNS), 'utf8');

  return filePath;
}

/** @type {import('expo/config-plugins').ConfigPlugin} */
const withInsiderResourceKeep = (config) =>
  withDangerousMod(config, [
    'android',
    async (modConfig) => {
      writeKeepFile(modConfig.modRequest.platformProjectRoot);
      return modConfig;
    },
  ]);

module.exports = withInsiderResourceKeep;
module.exports.buildKeepXml = buildKeepXml;
module.exports.writeKeepFile = writeKeepFile;
module.exports.INSIDER_RESOURCE_PATTERNS = INSIDER_RESOURCE_PATTERNS;
module.exports.KEEP_FILE_RELATIVE_PATH = KEEP_FILE_RELATIVE_PATH;
