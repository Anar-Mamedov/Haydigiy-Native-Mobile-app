import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { analytics } from '../services/analytics-dispatcher';

/**
 * Uygulama arka plana alınırken bekleyen event'leri gönderir.
 *
 * Web'de bu işi `navigator.sendBeacon` + `pagehide` yapıyor; RN'de ikisi de
 * yoktur. Bu kanca olmadan, kullanıcı uygulamayı kapattığında kuyrukta kalan
 * son 5 saniyelik event'ler (sepete ekleme, ödeme başlangıcı) tamamen kaybolur.
 */
export function useAnalyticsFlushOnBackground(): void {
  useEffect(() => {
    const handleChange = (status: AppStateStatus) => {
      if (status === 'active') return;
      analytics.flush();
    };

    const subscription = AppState.addEventListener('change', handleChange);
    return () => subscription.remove();
  }, []);
}
