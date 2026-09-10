import { TABLET_MIN_WIDTH, resolveDeviceType, resolveOsName } from './analytics-device';

describe('resolveDeviceType', () => {
  it('classifies a phone-sized shortest side as mobile', () => {
    expect(resolveDeviceType(390)).toBe('mobile');
  });

  it('treats the breakpoint itself as tablet (matches the web >= 768 rule)', () => {
    expect(resolveDeviceType(TABLET_MIN_WIDTH)).toBe('tablet');
  });

  it('classifies a tablet shortest side as tablet', () => {
    expect(resolveDeviceType(834)).toBe('tablet');
  });
});

describe('resolveOsName', () => {
  it.each([
    ['ios', 'iOS'],
    ['android', 'Android'],
    ['web', 'Other'],
    ['windows', 'Other'],
  ])('maps %s to %s', (platform, expected) => {
    expect(resolveOsName(platform)).toBe(expected);
  });
});
