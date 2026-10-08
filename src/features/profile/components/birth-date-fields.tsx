import { useMemo, useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { ColorTokens, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSelect } from '@/components/ui';
import { UserInfoFormData } from '../schemas/user-info.schema';
import {
  BirthDateParts,
  clampBirthDateParts,
  getDayOptions,
  getMaxBirthDate,
  getMonthOptions,
  getYearOptions,
} from '../utils/birth-date';

type BirthDateFieldsProps = {
  control: Control<UserInfoFormData>;
  errorMessage?: string;
  /** Formun diğer alanlarıyla aynı zemin. */
  fieldBackgroundColor?: ColorTokens;
};

/**
 * "Doğum Tarihi" gün/ay/yıl seçimleri. Web formundaki gibi seçenekler 16 yaş
 * sınırına göre daralır; yıl ya da ay değişince sınırı aşan ay/gün boşaltılır.
 * Seçilen ya da kayıtlı tarih değiştirilebilir ama silinemez: alanlarda × yoktur.
 */
export function BirthDateFields({ control, errorMessage, fieldBackgroundColor }: BirthDateFieldsProps) {
  const { field: day } = useController({ control, name: 'day' });
  const { field: month } = useController({ control, name: 'month' });
  const { field: year } = useController({ control, name: 'year' });
  // Ekran açıkken gün dönse bile sınır sabit kalır.
  const [limit] = useState(getMaxBirthDate);
  // Eski kuralla kaydedilmiş yıl, kullanıcı başka yıl seçene kadar listede kalır (web paritesi).
  const [savedYear] = useState(() => year.value);
  const keepYear = year.value === savedYear ? savedYear : '';

  const dayOptions = useMemo(
    () => getDayOptions({ month: month.value, year: year.value }, limit),
    [limit, month.value, year.value],
  );
  const monthOptions = useMemo(() => getMonthOptions({ year: year.value }, limit), [limit, year.value]);
  const yearOptions = useMemo(() => getYearOptions(limit, undefined, keepYear), [keepYear, limit]);

  /** Yeni seçimi uygular, listeden düşen ay/günü boşaltır. */
  const applyParts = (next: BirthDateParts) => {
    const clamped = clampBirthDateParts(next, limit);
    if (clamped.year !== year.value) year.onChange(clamped.year);
    if (clamped.month !== month.value) month.onChange(clamped.month);
    if (clamped.day !== day.value) day.onChange(clamped.day);
  };
  const current: BirthDateParts = { day: day.value, month: month.value, year: year.value };

  return (
    <YStack gap="$2">
      <Paragraph color="$color" fontSize={14} fontWeight="600">
        Doğum Tarihi
      </Paragraph>
      <XStack gap="$2">
        <YStack flex={1}>
          <AppSelect
            backgroundColor={fieldBackgroundColor}
            label="Gün"
            onValueChange={(next) => applyParts({ ...current, day: String(next) })}
            options={dayOptions}
            placeholder="Gün"
            value={day.value || null}
          />
        </YStack>
        <YStack flex={1.4}>
          <AppSelect
            backgroundColor={fieldBackgroundColor}
            label="Ay"
            onValueChange={(next) => applyParts({ ...current, month: String(next) })}
            options={monthOptions}
            placeholder="Ay"
            value={month.value || null}
          />
        </YStack>
        <YStack flex={1.1}>
          <AppSelect
            backgroundColor={fieldBackgroundColor}
            label="Yıl"
            onValueChange={(next) => applyParts({ ...current, year: String(next) })}
            options={yearOptions}
            placeholder="Yıl"
            searchable
            value={year.value || null}
          />
        </YStack>
      </XStack>
      {errorMessage ? (
        <Paragraph color="$red10" size="$2">
          {errorMessage}
        </Paragraph>
      ) : null}
    </YStack>
  );
}
