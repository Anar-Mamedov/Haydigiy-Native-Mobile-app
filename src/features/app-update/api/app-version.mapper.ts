import { AppVersionNumberResponseDto } from '@/services/app-settings.service';

const NUMERIC_VERSION_PATTERN = /^v?\d+(?:\.\d+)*$/i;

/** Validates the settings response and returns a comparison-ready version string. */
export function mapAppVersionNumber(dto: AppVersionNumberResponseDto): string {
  if (dto.status && dto.status.toLowerCase() !== 'success') {
    throw new Error('Uygulama sürüm servisi başarısız bir durum döndürdü.');
  }

  const version = dto.data == null ? '' : String(dto.data).trim();
  if (!version || !NUMERIC_VERSION_PATTERN.test(version)) {
    throw new Error('Uygulama sürüm servisinden geçerli bir sürüm numarası alınamadı.');
  }

  return version.replace(/^v/i, '');
}
