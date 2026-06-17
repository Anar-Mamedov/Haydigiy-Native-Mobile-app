import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Paragraph, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';

export type AccountOrderAction = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

type AccountOrdersCardProps = {
  actions: AccountOrderAction[];
};

/**
 * "Siparişlerim" card: a row of circular brand-colored shortcuts (orders,
 * cancellations/returns, reviews), mirroring the web account hub.
 */
export function AccountOrdersCard({ actions }: AccountOrdersCardProps) {
  return (
    <SectionCard>
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={17} fontWeight="700">
          Siparişlerim
        </Paragraph>
        <XStack justifyContent="space-between">
          {actions.map((action) => (
            <Pressable
              accessibilityLabel={action.label.replace('\n', ' ')}
              accessibilityRole="button"
              key={action.label}
              onPress={action.onPress}
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}
            >
              <YStack alignItems="center" gap="$2">
                <XStack
                  alignItems="center"
                  backgroundColor="$brand"
                  borderRadius={100}
                  height={48}
                  justifyContent="center"
                  width={48}
                >
                  {action.icon}
                </XStack>
                <Paragraph
                  color="$color"
                  fontSize={12}
                  lineHeight={15}
                  textAlign="center"
                >
                  {action.label}
                </Paragraph>
              </YStack>
            </Pressable>
          ))}
        </XStack>
      </YStack>
    </SectionCard>
  );
}
