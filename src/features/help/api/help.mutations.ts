import { useMutation } from '@tanstack/react-query';
import { sendHelpFeedbackDto } from '@/services/help.service';

/** Sends "Faydalı" feedback for a help article (`POST /help/feedback`). */
export function useHelpFeedbackMutation() {
  return useMutation({
    mutationFn: (articleId: number) => sendHelpFeedbackDto(articleId, true),
  });
}
