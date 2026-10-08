import { useMutation } from '@tanstack/react-query';
import { sendFeedbackDto } from '@/services/feedback.service';

/** Genel geri bildirim gönderir (`POST /feedback`). */
export function useSendFeedbackMutation() {
  return useMutation({
    mutationFn: (message: string) => sendFeedbackDto({ message }),
    // Kullanıcının metni tekrar tekrar gönderilmesin; hata ekranda gösterilir.
    retry: false,
  });
}
