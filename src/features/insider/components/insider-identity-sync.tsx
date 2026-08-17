import { useInsiderIdentityRestore } from '../hooks/use-insider-identity-restore';

/**
 * Insider kimliğini kalıcı oturumla hizalar. `InsiderIntegration`'dan ayrı
 * durur çünkü o bileşenin sorumluluğu push/InApp yönlendirmesidir; kimlik
 * senkronu ayrı bir eksendir. `_layout.tsx` içinde SDK başlatıldıktan sonra
 * mount edilmelidir.
 */
export function InsiderIdentitySync() {
  useInsiderIdentityRestore();
  return null;
}
