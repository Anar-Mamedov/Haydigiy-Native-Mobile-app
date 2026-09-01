/**
 * Insider dil/para birimi sabitleri.
 *
 * Smart Recommender çağrıları `locale` ve `currency` parametrelerini zorunlu tutuyor ve
 * dönen ürünlerin fiyatı bu para biriminin anahtarı altında geliyor. Aynı `locale` değeri
 * kullanıcı objesinde de tanımlı olmalı (Insider'ın Smart Recommender ön koşulu), bu yüzden
 * tracker ve recommender tek kaynaktan besleniyor.
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender
 */

/**
 * `InsiderUser.setLanguage` değeri.
 *
 * ISO 639-1 kısa kodu (`tr`) değil, dil+bölge formatı beklenir. Insider'ın data
 * validation raporu app'ten gelen kayıtlarda `tr` gördüğü için bunu bildirdi;
 * panelin sözleşmesi `tr_TR`. `INSIDER_LOCALE` ile bugün aynı değere sahip ama
 * ayrı Insider alanları oldukları için ayrı sabit olarak tutuluyorlar.
 */
export const INSIDER_LANGUAGE = 'tr_TR';

/** `InsiderUser.setLocale` ve Smart Recommender `locale` parametresi. */
export const INSIDER_LOCALE = 'tr_TR';

/** Ürün objesi ve Smart Recommender `currency` parametresi. */
export const INSIDER_CURRENCY = 'TRY';
