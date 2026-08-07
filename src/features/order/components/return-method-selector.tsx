import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard, SelectableCard } from '@/components/ui';
import { ScheduledReturnPicker } from './scheduled-return-picker';
import { UseScheduledReturn } from '../hooks/use-scheduled-return';
import { ReturnMethod } from '@/types/order.types';

type Props = {
  returnMethod: ReturnMethod;
  onChange: (method: ReturnMethod) => void;
  scheduled: UseScheduledReturn;
};

/** PTT vs Hepsijet (home pickup) selector; reveals the pickup picker for Hepsijet. */
export function ReturnMethodSelector({ returnMethod, onChange, scheduled }: Props) {
  return (
    <SectionCard padding="$3">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          İade Yöntemi
        </Paragraph>
        <SelectableCard
          description="İade kodunuzla en yakın PTT şubesinden ücretsiz gönderin."
          onPress={() => onChange('ptt')}
          selected={returnMethod === 'ptt'}
          title="PTT Kargo Şubesinden Gönder"
        />
        <SelectableCard
          description="Kurye, seçtiğiniz tarihte adresinizden iadenizi teslim alsın."
          onPress={() => onChange('hepsijet')}
          selected={returnMethod === 'hepsijet'}
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
