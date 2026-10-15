import { XStack } from 'tamagui';
import { HeaderBackButton } from '@/components/ui/header-back-button';
import { Paragraph } from '@/components/ui/app-paragraph';

type OrdersHeaderProps = {
  title: string;
  onBack: () => void;
};

/** Back + centered title bar for the orders screens. */
export function OrdersHeader({ title, onBack }: OrdersHeaderProps) {
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
        {title}
      </Paragraph>
    </XStack>
  );
}
