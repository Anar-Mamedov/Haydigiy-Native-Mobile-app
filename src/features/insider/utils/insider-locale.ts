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

/** `InsiderUser.setLanguage` değeri. */
export const INSIDER_LANGUAGE = 'tr';

/** `InsiderUser.setLocale` ve Smart Recommender `locale` parametresi. */
export const INSIDER_LOCALE = 'tr_TR';

/** Ürün objesi ve Smart Recommender `currency` parametresi. */
export const INSIDER_CURRENCY = 'TRY';
