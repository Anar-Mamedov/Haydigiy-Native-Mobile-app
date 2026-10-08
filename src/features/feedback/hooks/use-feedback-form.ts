import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSendFeedbackMutation } from '../api/feedback.mutations';
import { feedbackSchema, FeedbackFormData } from '../schemas/feedback.schema';
import { getFeedbackErrorMessage } from '../utils/feedback-error';

/**
 * Geri bildirim formunun durumu ve gönderim akışı: doğrulama (RHF + Zod),
 * gönderim hatası ve başarı penceresi. Ekran yalnızca sunumla ilgilenir.
 */
export function useFeedbackForm() {
  const mutation = useSendFeedbackMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<FeedbackFormData>({
    defaultValues: { message: '' },
    resolver: zodResolver(feedbackSchema),
  });
  const message = useWatch({ control: form.control, name: 'message' });
  // Web'deki gibi boş mesajla veya gönderim sürerken düğme pasif kalır.
  const canSubmit = message.trim().length > 0 && !mutation.isPending;

  const handleValidSubmit = form.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await mutation.mutateAsync(data.message);
      form.reset({ message: '' });
      setSuccessOpen(true);
    } catch (error) {
      setSubmitError(getFeedbackErrorMessage(error));
    }
  });

  // Pasif düğmeye platform yine de basım iletirse ikinci bir istek ya da boş gönderim olmasın.
  const submit = async () => {
    if (!canSubmit) return;
    await handleValidSubmit();
  };

  return {
    canSubmit,
    closeSuccess: () => setSuccessOpen(false),
    control: form.control,
    fieldError: form.formState.errors.message?.message,
    isSubmitting: mutation.isPending,
    submit,
    submitError,
    successOpen,
  };
}
