import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { useLatestAppVersionQuery } from '../api/app-update.queries';
import { AppUpdateDialog } from './app-update-dialog';
import { getCurrentStorePlatform, openAppStore } from '../utils/app-store';
import { getInstalledAppVersion } from '../utils/installed-app-version';
import { isRemoteVersionNewer } from '../utils/version-comparison';

const STORE_OPEN_ERROR = 'Uygulama mağazası açılamadı. Lütfen daha sonra tekrar deneyin.';

export function AppUpdateChecker() {
  const isNativePlatform = getCurrentStorePlatform() !== null;
  const latestVersionQuery = useLatestAppVersionQuery(isNativePlatform);
  const installedVersion = useMemo(() => getInstalledAppVersion(), []);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
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
  const isDialogOpen = isUpdateAvailable && dismissedVersion !== remoteVersion;

  useEffect(() => {
    let isSubscribed = true;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isNativePlatform) {
        setIsRefreshingVersion(true);
        setStoreError(null);

        void refetch().then((result) => {
          if (!isSubscribed) {
            return;
          }

          if (!result.error) {
            setDismissedVersion(null);
          }
          setIsRefreshingVersion(false);
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

  const dismissDialog = useCallback(() => {
    if (remoteVersion) {
      setDismissedVersion(remoteVersion);
    }
    setStoreError(null);
  }, [remoteVersion]);

  const openStore = useCallback(async () => {
    setIsOpeningStore(true);
    setStoreError(null);

    try {
      await openAppStore();
      if (remoteVersion) {
        setDismissedVersion(remoteVersion);
      }
    } catch (error) {
      console.error('App store could not be opened:', error);
      setStoreError(STORE_OPEN_ERROR);
    } finally {
      setIsOpeningStore(false);
    }
  }, [remoteVersion]);

  return (
    <AppUpdateDialog
      errorMessage={storeError}
      isOpeningStore={isOpeningStore}
      onConfirm={openStore}
      onDismiss={dismissDialog}
      open={isDialogOpen}
    />
  );
}
