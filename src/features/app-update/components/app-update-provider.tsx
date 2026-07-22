import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useLatestAppVersionQuery } from '../api/app-update.queries';
import { AppUpdateContext } from '../context/app-update-context';
import { getCurrentStorePlatform, openAppStore } from '../utils/app-store';
import {
  getInstalledAppVersion,
  type InstalledAppVersion,
} from '../utils/installed-app-version';
import { isRemoteVersionNewer } from '../utils/version-comparison';

const STORE_OPEN_ERROR = 'Uygulama mağazası açılamadı. Lütfen daha sonra tekrar deneyin.';

export function formatInstalledVersion(version: InstalledAppVersion): string {
  const { applicationVersion, buildVersion } = version;

  if (applicationVersion && buildVersion) {
    return `${applicationVersion} (${buildVersion})`;
  }

  return applicationVersion ?? buildVersion ?? 'Bilinmiyor';
}

export function AppUpdateProvider({ children }: PropsWithChildren) {
  const isNativePlatform = getCurrentStorePlatform() !== null;
  const latestVersionQuery = useLatestAppVersionQuery(isNativePlatform);
  const installedVersion = useMemo(() => getInstalledAppVersion(), []);
  const installedVersionLabel = useMemo(
    () => formatInstalledVersion(installedVersion),
    [installedVersion],
  );
  const [dismissedHomeVersion, setDismissedHomeVersion] = useState<string | null>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [isOpeningStore, setIsOpeningStore] = useState(false);
  const [isRefreshingVersion, setIsRefreshingVersion] = useState(false);
  const { data, error, isFetchedAfterMount, isFetching, refetch } = latestVersionQuery;
  const remoteVersion =
    isFetchedAfterMount && !isFetching && !isRefreshingVersion && !error
      ? (data ?? null)
      : null;

  const isUpdateAvailable = remoteVersion
    ? isRemoteVersionNewer(remoteVersion, installedVersion)
    : false;
  const isHomeBannerVisible =
    isUpdateAvailable && remoteVersion !== dismissedHomeVersion;

  useEffect(() => {
    let isSubscribed = true;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isNativePlatform) {
        setIsRefreshingVersion(true);
        setStoreError(null);

        void refetch().then(() => {
          if (isSubscribed) {
            setIsRefreshingVersion(false);
          }
        });
      }
    });

    return () => {
      isSubscribed = false;
      subscription.remove();
    };
  }, [isNativePlatform, refetch]);

  useEffect(() => {
    if (error) {
      console.error('App version check failed:', error);
    }
  }, [error]);

  const dismissHomeBanner = useCallback(() => {
    if (remoteVersion) {
      setDismissedHomeVersion(remoteVersion);
    }
    setStoreError(null);
  }, [remoteVersion]);

  const openStore = useCallback(async () => {
    setIsOpeningStore(true);
    setStoreError(null);

    try {
      await openAppStore();
    } catch (error) {
      console.error('App store could not be opened:', error);
      setStoreError(STORE_OPEN_ERROR);
    } finally {
      setIsOpeningStore(false);
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      dismissHomeBanner,
      errorMessage: storeError,
      installedVersionLabel,
      isHomeBannerVisible,
      isOpeningStore,
      isUpdateAvailable,
      openStore,
    }),
    [
      dismissHomeBanner,
      installedVersionLabel,
      isHomeBannerVisible,
      isOpeningStore,
      isUpdateAvailable,
      openStore,
      storeError,
    ],
  );

  return <AppUpdateContext value={contextValue}>{children}</AppUpdateContext>;
}
