import type { SeoRedirectResolution } from '@/types/seo-redirect.types';
import type { SeoRedirectResolveDto } from './seo-redirect.dtos';

/** Kural durum kodu göndermezse web middleware'indeki gibi kalıcı yönlendirme sayılır. */
const DEFAULT_REDIRECT_STATUS = 301;

/** Hedefi olmayan ya da eksik yanıt eşleşme sayılmaz; ekran 404'e düşer. */
export function mapSeoRedirectDto(dto: SeoRedirectResolveDto | null | undefined): SeoRedirectResolution {
  const targetUrl = typeof dto?.target_url === 'string' ? dto.target_url.trim() : '';
  if (dto?.matched !== true || !targetUrl) {
    return { matched: false };
  }

  return {
    matched: true,
    statusCode: typeof dto.status_code === 'number' ? dto.status_code : DEFAULT_REDIRECT_STATUS,
    targetUrl,
  };
}
