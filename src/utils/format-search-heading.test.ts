import {
  formatSearchResultsHeading,
  formatSearchTerm,
  toTurkishLowerCase,
  toTurkishTitleCase,
} from './format-search-heading';

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

describe('formatSearchTerm', () => {
  it('de-slugs and title-cases the query', () => {
    expect(formatSearchTerm('ışıklı pijama')).toBe('Işıklı Pijama');
    expect(formatSearchTerm('  kız çocuk_pijama  ')).toBe('Kız Çocuk Pijama');
    expect(formatSearchTerm('kadin-giyim')).toBe('Kadin Giyim');
  });

  it('does not decode percent signs a second time', () => {
    // Router parametreleri zaten çözülmüş gelir; "%50" gerçek bir indirim araması.
    expect(formatSearchTerm('%50 indirim')).toBe('%50 İndirim');
    expect(formatSearchTerm('indirim %')).toBe('İndirim %');
  });

  it('keeps digits and punctuation such as product codes intact', () => {
    expect(formatSearchTerm('55041.1397')).toBe('55041.1397');
  });

  it('returns undefined for empty input', () => {
    expect(formatSearchTerm(undefined)).toBeUndefined();
    expect(formatSearchTerm(null)).toBeUndefined();
    expect(formatSearchTerm('   ')).toBeUndefined();
    expect(formatSearchTerm('--_')).toBeUndefined();
  });
});

describe('formatSearchResultsHeading', () => {
  it('mirrors the web search results heading', () => {
    expect(formatSearchResultsHeading('pijama')).toBe('"Pijama" için sonuçlar');
    expect(formatSearchResultsHeading('  kız çocuk_pijama  ')).toBe(
      '"Kız Çocuk Pijama" için sonuçlar',
    );
    expect(formatSearchResultsHeading('ışıklı pijama')).toBe('"Işıklı Pijama" için sonuçlar');
  });

  it('produces no heading for an empty query', () => {
    expect(formatSearchResultsHeading(undefined)).toBeUndefined();
    expect(formatSearchResultsHeading('   ')).toBeUndefined();
  });
});
