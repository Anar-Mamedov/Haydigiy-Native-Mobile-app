import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppInput } from '@/components/ui/app-input';
import type { FeedbackCategory, FeedbackFormValues } from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import type { useFeedbackUploads } from '../hooks/use-feedback-uploads';
import { MESSAGE_MAX_LENGTH } from '../utils/feedback-validation';
import { FeedbackFieldControl } from './feedback-field-control';
import { FeedbackFileField } from './feedback-file-field';

type FeedbackCategoryBodyProps = {
  category: FeedbackCategory;
  control: Control<FeedbackFormValues>;
  uploads: ReturnType<typeof useFeedbackUploads>;
  showDescription?: boolean;
  disabled?: boolean;
};

const COUNTER_FROM = 4500;

function messageLabel(category: FeedbackCategory): string {
  const { label, mode } = category.message;
  return mode === 'required' ? `${label} *` : `${label} ${T.optional}`;
}

/** Seçili başlığın ek soruları ve serbest mesaj kutusu (`hidden` ise hiç çizilmez), sunucudaki sırayla. */
export function FeedbackCategoryBody({ category, control, uploads, showDescription, disabled }: FeedbackCategoryBodyProps) {
  return (
    <YStack gap="$4" testID={`feedback-category-body-${category.key}`}>
      {showDescription && category.description ? (
        <Paragraph color="$color10" fontSize={13}>
          {category.description}
        </Paragraph>
      ) : null}
      {category.fields.map((field) =>
        field.type === 'file' ? (
          <FeedbackFileField disabled={disabled} field={field} key={field.key} uploads={uploads} />
        ) : (
          <FeedbackFieldControl control={control} disabled={disabled} field={field} key={field.key} />
        ),
      )}
      {category.message.mode !== 'hidden' ? (
        <Controller
          control={control}
          name="message"
          render={({ field, fieldState }) => (
            <AppInput
              disabled={disabled}
              errorMessage={fieldState.error?.message}
              helperText={field.value.length >= COUNTER_FROM ? `${field.value.length}/${MESSAGE_MAX_LENGTH}` : undefined}
              label={messageLabel(category)}
              maxLength={MESSAGE_MAX_LENGTH}
              minHeight={140}
              multiline
              name="feedback-message"
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              placeholder={category.message.placeholder}
              ref={field.ref}
              textAlignVertical="top"
              value={field.value}
            />
          )}
        />
      ) : null}
    </YStack>
  );
}
