import { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type ReviewSheetInfoViewProps = {
  children: ReactNode;
  onBack: () => void;
  testID?: string;
};

/**
 * Yorum penceresinde formun yerine açılan bilgi görünümü (yayınlama kriterleri,
 * Aydınlatma Metni): kaydırılan içerik ve forma dönen "Geri" butonu. Pencere
 * kapanmadığı için girilen puan, yorum ve görsel korunur.
 */
export function ReviewSheetInfoView({ children, onBack, testID }: ReviewSheetInfoViewProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack flex={1} justifyContent="space-between" testID={testID}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>{children}</ScrollView>
      <YStack
        borderTopColor="$borderColor"
        borderTopWidth={1}
        paddingBottom={Math.max(insets.bottom, 16)}
        paddingHorizontal="$4"
        paddingTop="$4"
      >
        <Button
          backgroundColor="$brand"
          borderRadius="$4"
          height={46}
          onPress={onBack}
          pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
        >
          <Paragraph color="white" fontWeight="700">
            Geri
          </Paragraph>
        </Button>
      </YStack>
    </YStack>
  );
}
