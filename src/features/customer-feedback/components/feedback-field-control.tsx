import { Control, Controller } from 'react-hook-form';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox } from '@/components/ui/app-checkbox';
import { AppInput } from '@/components/ui/app-input';
import { AppRadioGroup } from '@/components/ui/app-radio-group';
import { AppSelect } from '@/components/ui/app-select';
import { StarRatingInput } from '@/components/ui/star-rating-input';
import type { FeedbackAnswerValue, FeedbackField, FeedbackFormValues } from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { FeedbackFieldShell, requiredLabel } from './feedback-field-shell';

type FeedbackFieldControlProps = {
  field: FeedbackField;
  control: Control<FeedbackFormValues>;
  disabled?: boolean;
};

const KEYBOARDS = {
  email: 'email-address',
  tel: 'phone-pad',
  url: 'url',
  number: 'decimal-pad',
  date: 'numbers-and-punctuation',
} as const;

const asText = (value: FeedbackAnswerValue | undefined) => (typeof value === 'string' ? value : '');
const asList = (value: FeedbackAnswerValue | undefined) => (Array.isArray(value) ? value : []);

/**
 * Sunucudaki alan tipini paylaşılan form bileşeniyle çizer (sözleşme v1.0 §6.2). Seçeneklerde ekranda
 * `label` görünür, değer olarak `value` saklanır. Dosya alanı ayrı bileşendir (`FeedbackFileField`).
 */
export function FeedbackFieldControl({ field, control, disabled }: FeedbackFieldControlProps) {
  const label = requiredLabel(field.label, field.required);
  const options = field.config.options.map((option) => ({ value: option.value, label: option.label }));

  return (
    <Controller
      control={control}
      name={`answers.${field.key}`}
      render={({ field: input, fieldState }) => {
        const error = fieldState.error?.message;
        switch (field.type) {
          case 'select':
            return (
              <FeedbackFieldShell error={error} label={label}>
                <AppSelect
                  disabled={disabled}
                  label={field.label}
                  onValueChange={(next) => {
                    input.onChange(String(next));
                    input.onBlur();
                  }}
                  options={options}
                  placeholder={field.config.placeholder ?? 'Seçiniz'}
                  value={asText(input.value) || null}
                />
              </FeedbackFieldShell>
            );
          case 'radio':
            return (
              <FeedbackFieldShell error={error} label={label}>
                <AppRadioGroup
                  accessibilityLabel={field.label}
                  disabled={disabled}
                  onChange={(next) => {
                    input.onChange(next);
                    input.onBlur();
                  }}
                  options={options}
                  value={asText(input.value)}
                />
              </FeedbackFieldShell>
            );
          case 'checkbox': {
            const selected = asList(input.value);
            return (
              <FeedbackFieldShell error={error} label={label}>
                <YStack gap="$2.5">
                  {options.map((option) => (
                    <AppCheckbox
                      accessibilityLabel={option.label}
                      checked={selected.includes(option.value)}
                      disabled={disabled}
                      key={option.value}
                      onChange={(checked) => {
                        input.onChange(checked ? [...selected, option.value] : selected.filter((item) => item !== option.value));
                        input.onBlur();
                      }}
                    >
                      <Paragraph color="$color" fontSize={14}>
                        {option.label}
                      </Paragraph>
                    </AppCheckbox>
                  ))}
                </YStack>
              </FeedbackFieldShell>
            );
          }
          case 'rating':
            return (
              <FeedbackFieldShell error={error} label={label}>
                <StarRatingInput
                  accessibilityLabel={field.label}
                  disabled={disabled}
                  getStarLabel={(value, max) => T.ratingLabel(value, max)}
                  max={field.config.max ?? 5}
                  onChange={(next) => {
                    input.onChange(String(next));
                    input.onBlur();
                  }}
                  value={Number(asText(input.value)) || 0}
                />
              </FeedbackFieldShell>
            );
          case 'file':
            return <YStack />;
          default: {
            const multiline = field.type === 'textarea';
            return (
              <AppInput
                autoCapitalize={field.type === 'text' || multiline ? 'sentences' : 'none'}
                autoCorrect={field.type === 'text' || multiline}
                disabled={disabled}
                errorMessage={error}
                keyboardType={field.type in KEYBOARDS ? KEYBOARDS[field.type as keyof typeof KEYBOARDS] : 'default'}
                label={label}
                maxLength={field.type === 'date' ? 10 : field.config.maxLength}
                minHeight={multiline ? 120 : undefined}
                multiline={multiline}
                name={`feedback-${field.key}`}
                onBlur={input.onBlur}
                onChangeText={input.onChange}
                placeholder={field.type === 'date' ? T.datePlaceholder : field.config.placeholder}
                ref={input.ref}
                textAlignVertical={multiline ? 'top' : undefined}
                value={asText(input.value)}
              />
            );
          }
        }
      }}
    />
  );
}
