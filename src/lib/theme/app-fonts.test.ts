/* eslint-disable @typescript-eslint/no-require-imports */
import appJson from '../../../app.json';
import { APP_FONTS } from './app-fonts';

function getEmbeddedAndroidFonts(): string[] {
  const createConfig = require('../../../app.config.js');
  const config = createConfig({ config: appJson.expo });
  const fontPlugin = config.plugins.find(
    (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-font',
  );

  return fontPlugin?.[1]?.android?.fonts ?? [];
}

/** Android, gömülü font dosyasının adını aile adı olarak kullanır. */
function familyOf(fontPath: string): string {
  return fontPath.split('/').pop()!.replace(/\.(otf|ttf)$/, '');
}

describe('app fonts', () => {
  // Bir aile gömülmezse `useFonts` açılışta asenkron yüklemeyi bekler ve splash'i
  // o kadar uzun tutar.
  it.each(Object.keys(APP_FONTS))('embeds the %s family on Android under its own name', (family) => {
    const embedded = getEmbeddedAndroidFonts().find((fontPath) => familyOf(fontPath) === family);

    expect(embedded).toBeDefined();
    expect(() => require(`../../../${embedded}`)).not.toThrow();
  });

  it('embeds no font the app does not load', () => {
    const families = getEmbeddedAndroidFonts().map(familyOf);

    expect(families.sort()).toEqual(Object.keys(APP_FONTS).sort());
  });
});
