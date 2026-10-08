import { Control, Controller } from 'react-hook-form';
import { Spinner, XStack, YStack } from 'tamagui';
import { AppButton, AppInput } from '@/components/ui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { toPlainText } from '@/utils/normalize-text';
import { FEEDBACK_TEXTS } from '../constants/feedback-texts';
import { FeedbackFormData } from '../schemas/feedback.schema';

const MESSAGE_MIN_HEIGHT = 200;

type FeedbackFormProps = {
  control: Control<FeedbackFormData>;
  canSubmit: boolean;
  fieldError?: string;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
};

/** Geri bildirim formu (web `geri-bildirim`): açıklama, hata kutusu, metin alanı ve gönder düğmesi. */
export function FeedbackForm({ control, canSubmit, fieldError, isSubmitting, submitError, onSubmit }: FeedbackFormProps) {
  return (
    <YStack gap="$4">
      <Paragraph color="$color10" fontSize={14} lineHeight={20}>
        {FEEDBACK_TEXTS.description}
      </Paragraph>

      {submitError ? (
        <YStack
          accessibilityLiveRegion="polite"
          backgroundColor="$red2"
          borderColor="$red6"
          borderRadius="$4"
          borderWidth={1}
          padding="$3"
          testID="feedback-submit-error"
        >
          <Paragraph color="$red10" fontSize={13} lineHeight={19}>
            {submitError}
          </Paragraph>
        </YStack>
      ) : null}

      <Controller
        control={control}
        name="message"
        render={({ field: { onBlur, onChange, value } }) => (
          <AppInput
            disabled={isSubmitting}
            errorMessage={fieldError}
            hideVisibleLabel
            id="feedback-message"
            label={FEEDBACK_TEXTS.fieldLabel}
            minHeight={MESSAGE_MIN_HEIGHT}
            multiline
            onBlur={onBlur}
            onChangeText={(text) => onChange(toPlainText(text))}
            paddingVertical="$3"
            placeholder={FEEDBACK_TEXTS.placeholder}
            textAlignVertical="top"
            value={value}
          />
        )}
      />

      <AppButton
        backgroundColor={canSubmit || isSubmitting ? '$brand' : '$color5'}
        borderColor="transparent"
        color={canSubmit || isSubmitting ? 'white' : '$color10'}
        disabled={!canSubmit}
        id="feedback-submit"
        onPress={onSubmit}
        pressStyle={{ opacity: 0.85 }}
      >
        {isSubmitting ? (
          <XStack alignItems="center" gap="$2">
            <Spinner color="white" />
            <Paragraph color="white" fontWeight="600">
              {FEEDBACK_TEXTS.submitting}
            </Paragraph>
          </XStack>
        ) : (
          FEEDBACK_TEXTS.submit
        )}
      </AppButton>
    </YStack>
  );
}
