import { YStack } from 'tamagui';
import { Check } from '@/components/ui/icons';

interface FilterCheckboxProps {
  checked: boolean;
  size?: number;
}

export function FilterCheckbox({ checked, size = 24 }: FilterCheckboxProps) {
  return (
    <YStack
      alignItems="center"
      backgroundColor={checked ? '$brand' : '$background'}
      borderColor={checked ? '$brand' : '$color8'}
      borderRadius={3}
      borderWidth={1.2}
      height={size}
      justifyContent="center"
      width={size}
    >
      {checked ? <Check color="white" size={Math.round(size * 0.66)} strokeWidth={3} /> : null}
    </YStack>
  );
}
