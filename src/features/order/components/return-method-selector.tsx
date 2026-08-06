import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { ScheduledReturnPicker } from './scheduled-return-picker';
import { UseScheduledReturn } from '../hooks/use-scheduled-return';
import { ReturnMethod } from '@/types/order.types';

type Props = {
  returnMethod: ReturnMethod;
  onChange: (method: ReturnMethod) => void;
  scheduled: UseScheduledReturn;
};

function MethodCard({
  active,
  title,
  description,
  onPress,
}: {
  active: boolean;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <YStack
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      backgroundColor={active ? '$backgroundHover' : '$background'}
      borderColor={active ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$1"
      onPress={onPress}
      padding="$3"
      pressStyle={{ opacity: 0.9 }}
    >
      <Paragraph color="$color" fontSize={14} fontWeight="700">
        {title}
      </Paragraph>
      <Paragraph color="$color10" fontSize={12}>
        {description}
      </Paragraph>
    </YStack>
  );
}

/** PTT vs Hepsijet (home pickup) selector; reveals the pickup picker for Hepsijet. */
export function ReturnMethodSelector({ returnMethod, onChange, scheduled }: Props) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          İade Yöntemi
        </Paragraph>
        <MethodCard
          active={returnMethod === 'ptt'}
          description="İade kodunuzla en yakın PTT şubesinden ücretsiz gönderin."
          onPress={() => onChange('ptt')}
          title="PTT Kargo Şubesinden Gönder"
        />
        <MethodCard
          active={returnMethod === 'hepsijet'}
          description="Kurye, seçtiğiniz tarihte adresinizden iadenizi teslim alsın."
          onPress={() => onChange('hepsijet')}
          title="Adresimden Randevulu Aldır"
        />
        {returnMethod === 'hepsijet' ? (
          <YStack paddingTop="$1">
            <ScheduledReturnPicker sr={scheduled} />
          </YStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
