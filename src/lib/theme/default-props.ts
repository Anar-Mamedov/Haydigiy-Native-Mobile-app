import { FONT_SCALE_DEFAULT_PROPS } from './font-scale';
import { TEXT_FIELD_DEFAULT_PROPS } from './text-field-defaults';

/**
 * Uygulamanın Tamagui config varsayılanları (`createTamagui({ defaultProps })`). Uygulama
 * config'i ve test sarmalayıcısı aynı nesneyi kullanır, testler gerçek davranışı görür.
 * Bileşen adları çakışmamalı; çakışırsa sonraki girdi öncekini tamamen ezer.
 */
export const APP_DEFAULT_PROPS = {
  ...FONT_SCALE_DEFAULT_PROPS,
  ...TEXT_FIELD_DEFAULT_PROPS,
};
