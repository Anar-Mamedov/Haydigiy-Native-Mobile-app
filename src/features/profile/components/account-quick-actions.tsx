import { Fragment, ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';

export type AccountQuickAction = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

type AccountQuickActionsProps = {
  actions: AccountQuickAction[];
};

/**
 * Quick-access strip mirroring the web account hub: equal-width columns, each a
 * brand icon over a short two-line label, separated by thin vertical dividers.
 */
export function AccountQuickActions({ actions }: AccountQuickActionsProps) {
  return (
    <SectionCard elevated paddingHorizontal="$2" paddingVertical="$3">
      <XStack alignItems="stretch">
        {actions.map((action, index) => (
          <Fragment key={action.label}>
            {index > 0 ? (
              <Separator alignSelf="stretch" borderColor="$borderColor" vertical />
            ) : null}
            <Pressable
              accessibilityLabel={action.label}
              accessibilityRole="button"
              onPress={action.onPress}
              style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}
            >
              <YStack alignItems="center" gap="$2" paddingHorizontal="$2">
                {action.icon}
                <Paragraph
                  color="$color"
                  fontSize={12}
                  lineHeight={15}
                  numberOfLines={2}
                  textAlign="center"
                >
                  {action.label}
                </Paragraph>
              </YStack>
            </Pressable>
          </Fragment>
        ))}
      </XStack>
    </SectionCard>
  );
}
