import { isExpoGoRuntime } from './mmkv';

describe('isExpoGoRuntime', () => {
  it('detects Expo Go from expoGoConfig', () => {
    expect(isExpoGoRuntime({ expoGoConfig: {} })).toBe(true);
  });

  it('detects Expo Go from app ownership', () => {
    expect(isExpoGoRuntime({ appOwnership: 'expo' })).toBe(true);
  });

  it('detects Expo Go from store client execution with an Expo Go version', () => {
    expect(
      isExpoGoRuntime({
        executionEnvironment: 'storeClient',
        expoVersion: '55.0.0',
      }),
    ).toBe(true);
  });

  it('keeps development builds eligible for MMKV', () => {
    expect(
      isExpoGoRuntime({
        executionEnvironment: 'storeClient',
        expoVersion: null,
      }),
    ).toBe(false);
  });
});
