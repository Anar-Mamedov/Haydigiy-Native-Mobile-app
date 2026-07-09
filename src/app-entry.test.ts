/* eslint-disable @typescript-eslint/no-require-imports */
import packageJson from '../package.json';

describe('native app entrypoint', () => {
  it('loads the custom Expo Router entry file', () => {
    expect(packageJson.main).toBe('index.js');
  });

  it('initializes gesture handler before Expo Router registers navigation', () => {
    const loadedModules: string[] = [];

    jest.isolateModules(() => {
      jest.doMock('react-native-gesture-handler', () => {
        loadedModules.push('react-native-gesture-handler');
        return {};
      });
      jest.doMock('expo-router/entry', () => {
        loadedModules.push('expo-router/entry');
        return {};
      });

      require('../index.js');
    });

    expect(loadedModules).toEqual(['react-native-gesture-handler', 'expo-router/entry']);
  });
});
