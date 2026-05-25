import { router } from 'expo-router';
import { Linking } from 'react-native';

export function handleLinkPress(link: string | null | undefined) {
  if (!link || link === '#' || link === 'javascript:void(0)') {
    return;
  }

  // If it's an absolute URL
  if (link.startsWith('http://') || link.startsWith('https://')) {
    Linking.openURL(link).catch((err) =>
      console.warn('Failed to open external link:', link, err)
    );
    return;
  }

  // Handle category search/filter relative web links (e.g. /elbise-ikili-takim?c=40)
  if (link.startsWith('/')) {
    // Navigate to categories tab and pass query filter as parameters
    router.push({
      pathname: '/(tabs)/categories',
      params: { query: link },
    });
    return;
  }

  // Fallback to standard routing
  try {
    router.push(link as any);
  } catch (err) {
    console.warn('Could not route link:', link, err);
  }
}
