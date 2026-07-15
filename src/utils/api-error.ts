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
