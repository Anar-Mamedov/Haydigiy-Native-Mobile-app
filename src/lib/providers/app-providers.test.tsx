import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { AppProviders } from './app-providers';

jest.mock('../../../tamagui.config', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@/lib/theme/use-app-theme', () => ({
  useAppTheme: () => ({ resolvedTheme: 'light' }),
}));

jest.mock('@/lib/theme/use-android-navigation-bar-style', () => ({
  useAndroidNavigationBarStyle: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');
  const { useQueryClient } = jest.requireActual('@tanstack/react-query');

  return {
    TamaguiProvider: ({ children }: { children: React.ReactNode }) => {
      const client = useQueryClient();
      return React.createElement(
        View,
        { testID: client ? 'portal-has-query-client' : 'portal-missing-query-client' },
        children,
      );
    },
    Theme: ({ children }: { children: React.ReactNode }) => children,
  };
});

describe('AppProviders', () => {
  it('keeps the React Query client available to Tamagui portal hosts', () => {
    render(
      <AppProviders>
        <Text>Uygulama</Text>
      </AppProviders>,
    );

    expect(screen.getByTestId('portal-has-query-client')).toBeTruthy();
    expect(screen.getByText('Uygulama')).toBeTruthy();
  });
});
