import { ReactNode } from 'react';
import { XStack } from 'tamagui';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { Paragraph } from '@/components/ui/app-paragraph';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  /** Optional trailing element (e.g. an action button) pinned to the right edge. */
  right?: ReactNode;
};

/**
 * Reusable back + centered title bar for stacked sub-screens. Theme-aware and
 * accessible so feature screens don't each re-implement their own header.
 */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomColor="$borderColor"
      borderBottomWidth={1}
      height={56}
      justifyContent="center"
      paddingHorizontal="$4"
      position="relative"
      width="100%"
    >
      <XStack left={0} position="absolute" zIndex={10}>
        <HeaderBackButton onPress={onBack} />
      </XStack>

      <Paragraph color="$color" fontSize={16} fontWeight="700" numberOfLines={1}>
        {title}
      </Paragraph>

      {right ? (
        <XStack position="absolute" right={8} zIndex={10}>
          {right}
        </XStack>
      ) : null}
    </XStack>
  );
}
