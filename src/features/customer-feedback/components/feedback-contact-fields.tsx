import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppInput } from '@/components/ui/app-input';
import { TextActionButton } from '@/components/ui/text-action-button';
import type { FeedbackFormValues, FeedbackViewer } from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';

type ContactKey = 'full_name' | 'email' | 'phone';

type FeedbackContactFieldsProps = {
  control: Control<FeedbackFormValues>;
  setValue: UseFormSetValue<FeedbackFormValues>;
  viewer: FeedbackViewer | null;
  showInputs: boolean;
  onShowInputs: () => void;
  disabled?: boolean;
};

const INPUTS: { key: ContactKey; label: string; keyboardType: 'default' | 'email-address' | 'phone-pad'; maxLength: number }[] = [
  { key: 'full_name', label: T.fullName, keyboardType: 'default', maxLength: 120 },
  { key: 'email', label: T.email, keyboardType: 'email-address', maxLength: 190 },
  { key: 'phone', label: T.phone, keyboardType: 'phone-pad', maxLength: 32 },
];

/**
 * Formun ortak alt bölümü (sözleşme v1.0 §6.6). Üyede bilgiler üyelikten tamamlanır; "Değiştir"
 * üyelik bilgileriyle doldurulmuş alanları açar. Misafirde alanlar isteğe bağlıdır.
 */
export function FeedbackContactFields({ control, setValue, viewer, showInputs, onShowInputs, disabled }: FeedbackContactFieldsProps) {
  const isMember = viewer !== null;

  const openInputs = () => {
    if (viewer) {
      setValue('full_name', viewer.fullName);
      setValue('email', viewer.email);
      setValue('phone', viewer.phone);
    }
    onShowInputs();
  };

  return (
    <YStack gap="$3" testID="feedback-contact">
      <Paragraph color="$color" fontSize={14} fontWeight="700">
        {T.contactTitle}
      </Paragraph>
      {isMember && !showInputs ? (
        <YStack gap="$1">
          <Paragraph color="$color10" fontSize={13}>
            {T.contactMember}
          </Paragraph>
          <TextActionButton alignSelf="flex-start" color="$brand" label={T.contactChange} onPress={openInputs} />
        </YStack>
      ) : (
        INPUTS.map((input) => (
          <Controller
            control={control}
            key={input.key}
            name={input.key}
            render={({ field, fieldState }) => (
              <AppInput
                autoCapitalize={input.key === 'full_name' ? 'words' : 'none'}
                autoComplete={input.key === 'full_name' ? 'name' : input.key === 'email' ? 'email' : 'tel'}
                disabled={disabled}
                errorMessage={fieldState.error?.message}
                keyboardType={input.keyboardType}
                label={`${input.label} ${T.optional}`}
                maxLength={input.maxLength}
                name={`feedback-contact-${input.key}`}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                ref={field.ref}
                value={field.value}
              />
            )}
          />
        ))
      )}
    </YStack>
  );
}
