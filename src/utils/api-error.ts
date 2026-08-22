import { isAxiosError } from 'axios';

const MISSING_RESOURCE_STATUSES = new Set([404, 410]);

/**
 * Yalnızca sunucunun kaynağın bulunmadığını veya kaldırıldığını kesin olarak
 * bildirdiği yanıtları eşler. Ağ, zaman aşımı ve 5xx hataları 404 sayılmaz.
 */
export function isMissingResourceApiError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;

  const status = error.response?.status;
  return typeof status === 'number' && MISSING_RESOURCE_STATUSES.has(status);
}

/**
 * Bir API hatasından kullanıcıya gösterilecek mesajı çıkarır.
 *
 * Yalnızca backend'in döndüğü `message`/`error` alanı kullanılır; yoksa çağıranın
 * verdiği yedek metne düşülür. Hiçbir durumda boş mesaj dönmez, böylece istekler
 * sessizce başarısız olmaz (bkz. AGENTS.md "Do not allow silent failures").
 *
 * Ağ/çalışma zamanı hatalarının kendi metni ("Network Error" gibi) teknik ve
 * İngilizce olduğu için kullanıcıya gösterilmez; o durumda yedek metin döner.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<{ message?: unknown; error?: unknown }>(error)) {
    const data = error.response?.data;
    const message = typeof data?.message === 'string' ? data.message.trim() : '';
    if (message) return message;

    const alternative = typeof data?.error === 'string' ? data.error.trim() : '';
    if (alternative) return alternative;
  }

  return fallback;
}
