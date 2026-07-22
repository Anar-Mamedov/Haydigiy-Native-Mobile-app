jest.mock('expo-router', () => ({
  Stack: () => null,
}));

jest.mock('@/components/navigation/bottom-navigation-bar', () => ({
  BottomNavigationBar: () => null,
}));

jest.mock('@/features/app-update/components/home-app-update-banner', () => ({
  HomeAppUpdateBanner: () => null,
}));

import { unstable_settings } from '@/app/(tabs)/_layout';

describe('tabs layout routing', () => {
  it('starts cold launches from the home stack instead of the cart stack', () => {
    expect(unstable_settings).toEqual({ anchor: '(home)' });
  });
});
