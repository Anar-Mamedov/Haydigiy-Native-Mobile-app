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

  // Normalize link: ensure it starts with /
  let normalizedLink = link;
  if (!normalizedLink.startsWith('/')) {
    normalizedLink = '/' + normalizedLink;
  }

  // Parse path and search params
  const [pathWithSlash, queryString] = normalizedLink.split('?');
  const path = pathWithSlash.toLowerCase();

  // Parse query params
  const params: Record<string, string> = {};
  if (queryString) {
    queryString.split('&').forEach((pair) => {
      const [key, val] = pair.split('=');
      if (key) {
        params[key] = decodeURIComponent(val || '');
      }
    });
  }

  // 1. Cart
  if (path === '/sepet' || path === '/cart') {
    router.push('/(tabs)/cart');
    return;
  }

  // 2. Favorites
  if (path === '/favori-listem' || path === '/favorites') {
    router.push('/(tabs)/favorites');
    return;
  }

  // 3. Profile
  if (path === '/hesabim' || path === '/profile') {
    router.push('/(tabs)/profile');
    return;
  }

  // 4. Checkout
  if (path === '/checkout' || path === '/odeme') {
    router.push('/checkout');
    return;
  }

  // 5. Product Detail
  if (path.startsWith('/product/')) {
    const parts = pathWithSlash.split('/');
    const id = parts[parts.length - 1];
    if (id) {
      router.push(`/product/${id}` as any);
      return;
    }
  }

  // 6. Search
  if (path === '/search' || path === '/search-products') {
    const q = params.q || '';
    router.push({
      pathname: '/kategori/search',
      params: { q },
    } as any);
    return;
  }

  // 7. Category Route
  // E.g. /kategori/elbise?c=40 or /elbise?c=40
  const parts = pathWithSlash.split('/').filter(Boolean);
  let slug = parts[parts.length - 1] || 'all';
  if (parts[0] === 'kategori' && parts.length > 1) {
    slug = parts.slice(1).join('/');
  }

  router.push({
    pathname: `/kategori/${slug}`,
    params: {
      c: params.c || '',
      q: params.q || '',
      ...params,
    },
  } as any);
}
