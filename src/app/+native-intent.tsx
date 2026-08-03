import { isInsiderSdkUrl } from '@/features/insider/utils/insider-url';
import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';

/**
 * Expo Router gelen derin bağlantıları (iOS Universal Links, Android App Links,
 * `haydigiywebviewapp://` custom scheme) uygulama açılmadan önce buradan geçirir.
 * Web URL'lerini app rotalarına çevirir; eşleme mantığı test edilebilir olması
 * için saf `resolveDeepLinkPath` yardımcısında tutulur.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  if (isInsiderSdkUrl(path)) return '/';

  return resolveDeepLinkPath(path);
}
