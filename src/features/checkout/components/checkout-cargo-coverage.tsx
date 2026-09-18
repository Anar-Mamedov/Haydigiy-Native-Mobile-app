import { XStack, YStack } from 'tamagui';
import { CircleCheck, CircleX } from '@/components/ui/icons';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CargoCoverageItem } from '../utils/cargo-coverage';

const ICON_SIZE = 14;

interface CheckoutCargoCoverageProps {
  items: CargoCoverageItem[];
}

/**
 * Delivery-coverage badges under a carrier's name ("goes to city centers",
 * "does not go to villages"). Purely presentational: the caller decides which
 * rows exist via `getCargoCoverageItems`, which drops unknown (`null`) answers.
 *
 * The icons repeat what the text already says, so they stay out of the
 * accessibility tree; the row's own label carries the wording
 * (see `buildCargoAccessibilityLabel`).
 */
export function CheckoutCargoCoverage({ items }: CheckoutCargoCoverageProps) {
  if (items.length === 0) return null;

  return (
    <YStack gap="$1" paddingTop="$1">
      {items.map((item) => (
        <XStack
          alignItems="center"
          gap="$1.5"
          key={item.key}
          testID={`cargo-coverage-${item.key}-${item.isPositive ? 'positive' : 'negative'}`}
        >
          {item.isPositive ? (
            <CircleCheck color="$green10" size={ICON_SIZE} />
          ) : (
            <CircleX color="$red10" size={ICON_SIZE} />
          )}
          <Paragraph color="$color11" flex={1} fontSize={12} lineHeight={16}>
            {item.label}
          </Paragraph>
        </XStack>
      ))}
    </YStack>
  );
}
