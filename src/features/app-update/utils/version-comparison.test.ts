import { isRemoteVersionNewer } from './version-comparison';

const installedVersion = {
  applicationVersion: '2.3.9',
  buildVersion: '26',
};

describe('isRemoteVersionNewer', () => {
  it('compares an integer API value with the native build number', () => {
    expect(isRemoteVersionNewer('27', installedVersion)).toBe(true);
    expect(isRemoteVersionNewer('26', installedVersion)).toBe(false);
    expect(isRemoteVersionNewer('1', installedVersion)).toBe(false);
  });

  it('compares a dotted API value with the user-facing app version', () => {
    expect(isRemoteVersionNewer('2.4.0', installedVersion)).toBe(true);
    expect(isRemoteVersionNewer('2.3.9', installedVersion)).toBe(false);
    expect(isRemoteVersionNewer('2.3.8', installedVersion)).toBe(false);
  });

  it('compares arbitrary-size numeric segments without precision loss', () => {
    expect(
      isRemoteVersionNewer('99999999999999999999', {
        applicationVersion: '2.3.9',
        buildVersion: '99999999999999999998',
      }),
    ).toBe(true);
  });

  it('returns false when the installed version cannot be read', () => {
    expect(
      isRemoteVersionNewer('2.4.0', {
        applicationVersion: null,
        buildVersion: null,
      }),
    ).toBe(false);
  });
});
