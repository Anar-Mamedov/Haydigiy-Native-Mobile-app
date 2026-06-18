import { matchesSearch, normalizeSearchText } from './search';

describe('normalizeSearchText', () => {
  it('lowercases and folds Turkish accents to ASCII', () => {
    expect(normalizeSearchText('Nilüfer')).toBe('nilufer');
    expect(normalizeSearchText('ÇANKAYA')).toBe('cankaya');
    expect(normalizeSearchText('  Şişli ')).toBe('sisli');
  });
});

describe('matchesSearch', () => {
  it('matches accent- and case-insensitively', () => {
    expect(matchesSearch('Nilüfer', 'nilu')).toBe(true);
    expect(matchesSearch('İstanbul', 'istan')).toBe(true);
    expect(matchesSearch('Ankara', 'izmir')).toBe(false);
  });
});
