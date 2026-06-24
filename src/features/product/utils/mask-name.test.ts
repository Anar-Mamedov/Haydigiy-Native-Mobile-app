import { maskName } from './mask-name';

describe('maskName', () => {
  it('masks the middle letters of each word', () => {
    expect(maskName('Yusuf Onal')).toBe('Y***f O**l');
  });

  it('handles short words and single names', () => {
    expect(maskName('Al')).toBe('A*');
    expect(maskName('A')).toBe('A');
    expect(maskName('Mehmet')).toBe('M****t');
  });

  it('returns an empty string for empty input', () => {
    expect(maskName('')).toBe('');
    expect(maskName('   ')).toBe('');
  });
});
