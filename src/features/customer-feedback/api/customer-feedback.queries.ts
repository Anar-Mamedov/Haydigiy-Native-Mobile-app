import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { getFeedbackFormDto } from '@/services/customer-feedback.service';
import type { FeedbackForm } from '@/types/customer-feedback.types';
import { toFeedbackApiError } from '../utils/feedback-api-error';
import { customerFeedbackKeys } from './customer-feedback.keys';
import { mapFeedbackForm } from './customer-feedback.mapper';

/**
 * Site geneli geri bildirim formu (`GET /customer-feedback/forms?context=general`). Kategoriler ve
 * sorular panelden değişir; her açılışta arka planda yeniden doğrulanır. Üye bilgisi (`viewer`) oturuma
 * göre değiştiği için anahtar kullanıcıya bağlıdır (giriş/çıkışta yeni form çekilir).
 */
export function useFeedbackFormQuery(enabled = true) {
  const viewerKey = useAuthStore((state) => (state.user?.id ? String(state.user.id) : 'guest'));

  return useQuery<FeedbackForm>({
    queryKey: customerFeedbackKeys.form(viewerKey),
    enabled,
    staleTime: 60_000,
    refetchOnMount: 'always',
    // Özellik kapalıysa (`503 disabled`) yeniden denemek anlamsız.
    retry: (failureCount, error) => toFeedbackApiError(error).kind !== 'disabled' && failureCount < 1,
    queryFn: async () => {
      const form = mapFeedbackForm(await getFeedbackFormDto());
      if (!form) throw new Error('customer-feedback: malformed forms response');
      return form;
    },
  });
}
