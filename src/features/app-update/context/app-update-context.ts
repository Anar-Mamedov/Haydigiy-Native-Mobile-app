import { createContext, use } from 'react';

export type AppUpdateContextValue = {
  dismissHomeBanner: () => void;
  errorMessage: string | null;
  installedVersionLabel: string;
  isHomeBannerVisible: boolean;
  isOpeningStore: boolean;
  isUpdateAvailable: boolean;
  openStore: () => Promise<void>;
};

export const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);

export function useAppUpdate(): AppUpdateContextValue {
  const context = use(AppUpdateContext);

  if (!context) {
    throw new Error('useAppUpdate must be used inside AppUpdateProvider.');
  }

  return context;
}
