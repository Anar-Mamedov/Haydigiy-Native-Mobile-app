/**
 * Tamagui metin alanlarının tema renkleri.
 *
 * Tamagui `Input` yazı rengini (`$color`) kendi verir, placeholder rengini vermez; prop
 * verilmezse native varsayılan kullanılır. Native katman telefonun koyu modunu izlediğinde
 * (eski build'lerde Android DayNight, iOS Automatic) bu varsayılan açık renk olur ve uygulamanın
 * hep açık kalan zemininde placeholder kaybolur (HMA-65, Tüm Siparişlerim arama kutusu).
 * Renk burada tek yerden verilir; ekranlar ayrıca `placeholderTextColor` geçmek zorunda kalmaz,
 * açıkça verilen değer bu varsayılanı ezer.
 *
 * `TextArea` ve `AppInput` gibi `styled(Input)` türevleri config varsayılanını kendi adlarıyla
 * arar, bu yüzden adları ayrıca listelenir.
 */
const TEXT_FIELD_COMPONENTS = ['Input', 'TextArea', 'AppInput'];

export const TEXT_FIELD_PLACEHOLDER_COLOR = '$color9';

/** `createTamagui({ defaultProps })` için. */
export const TEXT_FIELD_DEFAULT_PROPS = Object.fromEntries(
  TEXT_FIELD_COMPONENTS.map((name) => [name, { placeholderTextColor: TEXT_FIELD_PLACEHOLDER_COLOR }]),
);
