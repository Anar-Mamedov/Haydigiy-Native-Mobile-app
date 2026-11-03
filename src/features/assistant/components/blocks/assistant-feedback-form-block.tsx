import { useState } from 'react';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CustomerFeedbackForm } from '@/features/customer-feedback/components/customer-feedback-form';
import type { AssistantFeedbackFormBlock as FeedbackFormBlock } from '@/types/assistant.types';
import { trackAssistantEvent } from '../../services/assistant-events';
import { AssistantCard } from '../assistant-surfaces';

/**
 * Sohbet içi geri bildirim formu (Plan 2026-11-03 §3). Yeni form YAZILMAZ: uygulamanın geri bildirim
 * formu sabit başlıkla barındırılır, gönderim aynı uçlara gider. Başarıdan sonra kart salt okunurdur ve
 * yalnız içeriksiz `feedback_submitted` olayı gönderilir. "Vazgeç" kartı kapatır; sohbet akışı sürer.
 */
export function AssistantFeedbackFormBlock({ block }: { block: FeedbackFormBlock }) {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <AssistantCard accessibilityLabel={block.title || undefined} gap="$3" testID="assistant-feedback-form">
      {block.title ? (
        <Paragraph accessibilityRole="header" color="$color" fontSize={15} fontWeight="700">
          {block.title}
        </Paragraph>
      ) : null}
      <CustomerFeedbackForm
        allowAnother={false}
        fixedCategoryKey={block.category}
        onCancel={() => setClosed(true)}
        onSubmitted={() => trackAssistantEvent('feedback_submitted', { blockId: block.id })}
        texts={block.texts}
      />
    </AssistantCard>
  );
}
