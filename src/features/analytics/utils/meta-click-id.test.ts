import { buildFbc, extractFbclid } from './meta-click-id';

const FBCLID = 'IwZXh0bgNhZW0BMABhZGlkAasR_x-9Lk';

describe('extractFbclid', () => {
  it('reads fbclid from a universal link opened from an ad', () => {
    expect(
      extractFbclid(
        `https://haydigiy.com/kot-pantolon-siyah-751362049?utm_source=ig&fbclid=${FBCLID}&utm_medium=paid`,
      ),
    ).toBe(FBCLID);
  });

  it('reads fbclid from the target_url inside Meta App Links data', () => {
    const appLinkData = encodeURIComponent(
      JSON.stringify({
        target_url: `https://haydigiy.com/v-yaka-yelek-5181577?media_type=image&fbclid=${FBCLID}&utm_source=ig`,
        extras: [],
      }),
    );

    expect(
      extractFbclid(
        `haydigiywebviewapp:///?to=%2Fv-yaka-yelek-5181577&al_applink_data=${appLinkData}`,
      ),
    ).toBe(FBCLID);
  });

  it('decodes an encoded fbclid value', () => {
    expect(extractFbclid(`https://haydigiy.com/?fbclid=${encodeURIComponent(FBCLID)}`)).toBe(
      FBCLID,
    );
  });

  it('returns null when the link carries no click id', () => {
    expect(extractFbclid('https://haydigiy.com/kadin-kot-pantolon?c=174')).toBeNull();
    expect(extractFbclid('haydigiywebviewapp:///?to=%2Fsepet')).toBeNull();
    expect(extractFbclid('')).toBeNull();
    expect(extractFbclid(null)).toBeNull();
    expect(extractFbclid(undefined)).toBeNull();
  });

  it('ignores malformed, too short or unexpected values', () => {
    expect(extractFbclid('https://haydigiy.com/?fbclid=')).toBeNull();
    expect(extractFbclid('https://haydigiy.com/?fbclid=abc')).toBeNull();
    expect(extractFbclid('https://haydigiy.com/?fbclid=%E0%A4%A')).toBeNull();
    expect(extractFbclid('https://haydigiy.com/?fbclid=<script>alert(1)</script>')).toBeNull();
    expect(extractFbclid(`https://haydigiy.com/?fbclid=${'a'.repeat(401)}`)).toBeNull();
    expect(extractFbclid('haydigiywebviewapp:///?al_applink_data=%7Bbozuk')).toBeNull();
    expect(
      extractFbclid(
        `haydigiywebviewapp:///?al_applink_data=${encodeURIComponent(JSON.stringify({ target_url: 42 }))}`,
      ),
    ).toBeNull();
  });

  it('does not mistake a similarly named parameter for the click id', () => {
    expect(extractFbclid(`https://haydigiy.com/?xfbclid=${FBCLID}`)).toBeNull();
  });
});

describe('buildFbc', () => {
  it('uses the Meta fbc format with the first-seen time in milliseconds', () => {
    expect(buildFbc(FBCLID, 1_700_000_000_123)).toBe(`fb.1.1700000000123.${FBCLID}`);
  });
});
