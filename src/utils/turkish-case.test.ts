import {
  toTurkishCapitalized,
  toTurkishLowerCase,
  toTurkishTitleCase,
  toTurkishUpperCase,
} from './turkish-case';

describe('toTurkishUpperCase', () => {
  it('keeps the dot on the capital İ', () => {
    expect(toTurkishUpperCase('Siparişleriniz')).toBe('SİPARİŞLERİNİZ');
    expect(toTurkishUpperCase('iade')).toBe('İADE');
  });

  it('turns the dotless ı into I and the other Turkish letters into their capitals', () => {
    expect(toTurkishUpperCase('ışık')).toBe('IŞIK');
    expect(toTurkishUpperCase('güvenlik ödeme çağrı')).toBe('GÜVENLİK ÖDEME ÇAĞRI');
  });

  it('leaves capitals, digits and symbols as they are', () => {
    expect(toTurkishUpperCase('%100 Güvenli')).toBe('%100 GÜVENLİ');
    expect(toTurkishUpperCase('')).toBe('');
  });
});

describe('toTurkishTitleCase', () => {
  it('capitalises Turkish dotless and dotted i correctly', () => {
    // Web e3e9620b9: `\b` ASCII dışı harfleri tanımadığı için "ışıKlı" çıkıyordu.
    expect(toTurkishTitleCase('ışıklı')).toBe('Işıklı');
    expect(toTurkishTitleCase('istanbul')).toBe('İstanbul');
    expect(toTurkishTitleCase('çiçekli şal')).toBe('Çiçekli Şal');
    expect(toTurkishTitleCase('ğ ü ö')).toBe('Ğ Ü Ö');
  });

  it('lowercases the rest of each word with Turkish rules', () => {
    expect(toTurkishTitleCase('IŞIKLI PİJAMA')).toBe('Işıklı Pijama');
    expect(toTurkishTitleCase('İPEK')).toBe('İpek');
  });

  it('collapses repeated spaces', () => {
    expect(toTurkishTitleCase('uzun   elbise')).toBe('Uzun Elbise');
  });
});

describe('toTurkishLowerCase', () => {
  it('maps I to ı and İ to i', () => {
    expect(toTurkishLowerCase('IŞIK')).toBe('ışık');
    expect(toTurkishLowerCase('İNCİ')).toBe('inci');
  });
});

describe('toTurkishCapitalized', () => {
  it('capitalises the first letter of every word the Turkish way and keeps the rest', () => {
    expect(toTurkishCapitalized('ilk sipariş')).toBe('İlk Sipariş');
    expect(toTurkishCapitalized('ışık ve ipek')).toBe('Işık Ve İpek');
    expect(toTurkishCapitalized('kargo İADE')).toBe('Kargo İADE');
  });

  it('keeps spacing and empty text as they are', () => {
    expect(toTurkishCapitalized('  uzun   elbise')).toBe('  Uzun   Elbise');
    expect(toTurkishCapitalized('')).toBe('');
  });
});
