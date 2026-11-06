import { formatSearchResultsHeading, formatSearchTerm } from './format-search-heading';

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
