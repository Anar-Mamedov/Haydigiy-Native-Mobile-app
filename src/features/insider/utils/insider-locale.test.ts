import { INSIDER_CURRENCY, INSIDER_LANGUAGE, INSIDER_LOCALE } from './insider-locale';

/**
 * Insider'ın data validation raporu app kayıtlarında `language: 'tr'` gördüğü için
 * hata bildirdi; panelin beklediği sözleşme dil+bölge formatı. Kısa ISO 639-1
 * koduna geri dönülmesini engellemek için formatı burada sabitliyoruz.
 */
describe('Insider locale constants', () => {
  const LANGUAGE_REGION = /^[a-z]{2}_[A-Z]{2}$/;

  it('sends language in Insider language_region format, not the bare ISO 639-1 code', () => {
    expect(INSIDER_LANGUAGE).toMatch(LANGUAGE_REGION);
    expect(INSIDER_LANGUAGE).toBe('tr_TR');
  });

  it('keeps locale in the same language_region format', () => {
    expect(INSIDER_LOCALE).toMatch(LANGUAGE_REGION);
    expect(INSIDER_LOCALE).toBe('tr_TR');
  });

  it('sends currency as an ISO 4217 code', () => {
    expect(INSIDER_CURRENCY).toMatch(/^[A-Z]{3}$/);
    expect(INSIDER_CURRENCY).toBe('TRY');
  });
});
