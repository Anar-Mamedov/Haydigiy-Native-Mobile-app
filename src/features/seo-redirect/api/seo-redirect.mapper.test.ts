import { mapSeoRedirectDto } from './seo-redirect.mapper';

describe('mapSeoRedirectDto', () => {
  it('maps a matched rule to its target', () => {
    expect(
      mapSeoRedirectDto({ success: true, matched: true, status_code: 301, target_url: '/kadin-aksesuar?c=1' }),
    ).toEqual({ matched: true, statusCode: 301, targetUrl: '/kadin-aksesuar?c=1' });
  });

  it('keeps a temporary redirect status and trims the target', () => {
    expect(mapSeoRedirectDto({ matched: true, status_code: 302, target_url: '  /yeni  ' })).toEqual({
      matched: true,
      statusCode: 302,
      targetUrl: '/yeni',
    });
  });

  it('treats a matched rule without a status code as permanent', () => {
    expect(mapSeoRedirectDto({ matched: true, target_url: '/yeni' })).toEqual({
      matched: true,
      statusCode: 301,
      targetUrl: '/yeni',
    });
  });

  it.each([
    ['no match', { matched: false }],
    ['a match without a target', { matched: true, status_code: 301 }],
    ['an empty target', { matched: true, target_url: '   ' }],
    ['a null target', { matched: true, target_url: null }],
    ['an empty response', null],
  ])('returns no match for %s', (_case, dto) => {
    expect(mapSeoRedirectDto(dto)).toEqual({ matched: false });
  });
});
