import { useCallback } from 'react';
import { Linking } from 'react-native';
import { type Href, useRouter } from 'expo-router';
import { resolveBlogLinkTarget } from '../utils/blog-link';

/** Yazı içi bağlantıya basıldığında uygulama içi rotaya ya da sistem tarayıcısına yönlendirir. */
export function useBlogLinkPress() {
  const router = useRouter();

  return useCallback(
    (href: string | undefined) => {
      const target = resolveBlogLinkTarget(href);
      if (!target) return;

      if (target.type === 'internal') {
        router.push(target.path as Href);
        return;
      }

      Linking.openURL(target.url).catch((error) => {
        console.warn('Blog bağlantısı açılamadı:', target.url, error);
      });
    },
    [router],
  );
}
