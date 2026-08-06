import { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from '@/components/ui/icons';
import { Separator, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

export interface AccordionSectionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * Theme-aware collapsible section (title row + expandable body), used to build
 * accordions such as the "Sözleşmeler" legal texts. The header keeps its own
 * brand-neutral colouring and an accessible expanded state so screens never have
 * to hand-roll a collapsible or patch contrast across light/dark themes.
 */
export function AccordionSection({ title, expanded, onToggle, children }: AccordionSectionProps) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$6"
      borderWidth={1}
      overflow="hidden"
    >
      <XStack
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        alignItems="center"
        gap="$3"
        justifyContent="space-between"
        onPress={onToggle}
        paddingHorizontal="$4"
        paddingVertical="$3.5"
        pressStyle={{ backgroundColor: '$backgroundHover' }}
      >
        <Paragraph color="$color" flex={1} fontSize={16} fontWeight="700">
          {title}
        </Paragraph>
        {expanded ? (
          <ChevronUp color="$color10" size={20} />
        ) : (
          <ChevronDown color="$color10" size={20} />
        )}
      </XStack>

      {expanded ? (
        <>
          <Separator borderColor="$borderColor" />
          <YStack padding="$4">{children}</YStack>
        </>
      ) : null}
    </YStack>
  );
}
