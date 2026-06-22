import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';

export type AccountOrderAction = {
  icon: ReactNode;
  label: string;
  badge?: number;
  onPress: () => void;
};

type AccountOrdersCardProps = {
  actions: AccountOrderAction[];
};

/**
 * Order shortcuts as a two-column grid of bordered, equal-height cards (orders,
 * cancellations/returns) mirroring the web account hub. Each card shares one
 * accessible, theme-aware implementation.
 */
export function AccountOrdersCard({ actions }: AccountOrdersCardProps) {
  return (
    <XStack alignItems="stretch" flexWrap="wrap" gap="$3">
      {actions.map((action) => (
        <Pressable
          accessibilityLabel={action.label.replace('\n', ' ')}
          accessibilityRole="button"
          key={action.label}
          onPress={action.onPress}
          style={({ pressed }) => ({
            flexBasis: '47%',
            flexGrow: 1,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <XStack
            alignItems="center"
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$6"
            borderWidth={1}
            flex={1}
            gap="$2.5"
            paddingHorizontal="$3"
            paddingVertical="$3.5"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.18}
            shadowRadius={8}
          >
            <XStack alignItems="center" justifyContent="center">
              {action.icon}
              {action.badge ? (
                <XStack
                  alignItems="center"
                  backgroundColor="$red10"
                  borderRadius={100}
                  justifyContent="center"
                  minWidth={16}
                  paddingHorizontal={3}
                  position="absolute"
                  right={-8}
                  top={-6}
                >
                  <Paragraph color="white" fontSize={10} fontWeight="800">
                    {action.badge}
                  </Paragraph>
                </XStack>
              ) : null}
            </XStack>
            <Paragraph
              color="$color"
              flex={1}
              fontSize={13}
              fontWeight="600"
              lineHeight={16}
            >
              {action.label}
            </Paragraph>
            <ChevronRight color="$color9" size={18} />
          </XStack>
        </Pressable>
      ))}
    </XStack>
  );
}
