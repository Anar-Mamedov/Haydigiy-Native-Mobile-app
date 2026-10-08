import axios from 'axios';

/**
 * Blog içerikleri ana API'de (`connect`) değil, herkese açık `internal` API'de
 * duruyor; web de `BLOG_API_BASE_URL` yoksa aynı adrese düşüyor (bkz. frontend
 * `src/lib/blog.ts`). Ortam değişkeni yalnızca test/staging için ezme imkânı verir.
 */
const DEFAULT_BLOG_API_BASE_URL = 'https://internal.haydigiy.com/api';

/** Web'deki `BLOG_REQUEST_TIMEOUT_MS` ile aynı süre. */
const BLOG_REQUEST_TIMEOUT_MS = 10_000;

export const blogApiBaseUrl = (
  process.env.EXPO_PUBLIC_BLOG_API_BASE_URL?.trim() || DEFAULT_BLOG_API_BASE_URL
).replace(/\/+$/, '');

/**
 * Herkese açık blog uçları için ayrı Axios istemcisi.
 *
 * Paylaşılan `apiClient` her isteğe kullanıcının JWT'sini ekliyor; o token başka
 * bir sunucuya gitmesin diye blog istekleri kimlik bilgisi taşımayan bu istemciden
 * geçer. Web de blog isteklerini kimliksiz atıyor.
 */
export const blogApiClient = axios.create({
  baseURL: blogApiBaseUrl,
  timeout: BLOG_REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});
