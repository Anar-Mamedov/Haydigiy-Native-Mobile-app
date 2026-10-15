import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { HeaderTextButton } from '@/components/ui/header-text-button';

type CartHeaderProps = {
  itemCount: number;
  canClear: boolean;
  onBack: () => void;
  onClear: () => void;
};

/**
 * Cart screen top bar: back navigation, centered "Sepetim (n)" title and a
 * destructive "Sepeti Temizle" action that is only offered when the cart has items.
 */
export function CartHeader({ itemCount, canClear, onBack, onClear }: CartHeaderProps) {
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

      <Paragraph color="$color" fontSize={16} fontWeight="700">
        Sepetim ({itemCount})
      </Paragraph>

      {canClear ? (
        <XStack position="absolute" right={12} zIndex={10}>
          <HeaderTextButton accessibilityLabel="Sepeti temizle" color="$red11" label="Sepeti Temizle" onPress={onClear} />
        </XStack>
      ) : null}
    </XStack>
  );
}
