import { ReactNode } from 'react';
import { Paragraph, Separator, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';

interface CheckoutSectionProps {
  title: string;
  /** Optional element rendered on the right of the header (e.g. a badge). */
  headerRight?: ReactNode;
  /** Remove body padding when the child manages its own spacing (e.g. radio rows). */
  noBodyPadding?: boolean;
  children: ReactNode;
}

/**
 * Titled card used by every checkout section, mirroring the web's
 * "header bar + bordered body" payment cards. Centralizes the surface so the
 * sections stay theme-aware (light + dark) without repeating the chrome.
 */
export function CheckoutSection({
  title,
  headerRight,
  noBodyPadding,
  children,
}: CheckoutSectionProps) {
  return (
    <SectionCard padding={0} overflow="hidden">
      <XStack
        alignItems="center"
        backgroundColor="$backgroundHover"
        justifyContent="space-between"
        paddingHorizontal="$3.5"
        paddingVertical="$3"
      >
        <Paragraph color="$color" fontSize={16} fontWeight="700">
          {title}
        </Paragraph>
        {headerRight}
      </XStack>
      <Separator borderColor="$borderColor" />
      <YStack padding={noBodyPadding ? 0 : '$3.5'}>{children}</YStack>
    </SectionCard>
  );
}
