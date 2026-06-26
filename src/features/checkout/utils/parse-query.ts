/**
 * Parses a URL's query string into a flat record. Used to read the params off the
 * web success/failure URL the payment WebView intercepts (RN's URL.searchParams is
 * not reliable, so we parse manually).
 */
export function parseQuery(url: string | undefined | null): Record<string, string> {
  if (!url) return {};
  const queryStart = url.indexOf('?');
  if (queryStart === -1) return {};

  const result: Record<string, string> = {};
  for (const pair of url.slice(queryStart + 1).split('&')) {
    if (!pair) continue;
    const eq = pair.indexOf('=');
    const rawKey = eq >= 0 ? pair.slice(0, eq) : pair;
    const rawValue = eq >= 0 ? pair.slice(eq + 1) : '';
    try {
      result[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    } catch {
      result[rawKey] = rawValue;
    }
  }
  return result;
}
