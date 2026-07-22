import { useAppUpdate } from '../context/app-update-context';
import { AppUpdateBanner } from './app-update-banner';

export function ProfileAppUpdateBanner() {
  const {
    errorMessage,
    installedVersionLabel,
    isOpeningStore,
    isUpdateAvailable,
    openStore,
  } = useAppUpdate();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <AppUpdateBanner
      errorMessage={errorMessage}
      installedVersionLabel={installedVersionLabel}
      isOpeningStore={isOpeningStore}
      onUpdatePress={openStore}
    />
  );
}
