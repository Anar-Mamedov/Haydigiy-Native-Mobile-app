import { Minus, Plus } from '@/components/ui/icons';
import { Button, Spinner, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  loading?: boolean;
  /** Accessible name prefix, e.g. the product title, for the +/- controls. */
  accessibilityLabel?: string;
};

/**
 * Theme-aware quantity control reused across cart and catalog flows. Decrement /
 * increment buttons enforce the [min, max] range and expose explicit accessible
 * labels so the control stays usable with screen readers. Defined once here so
 * screens never hand-roll their own stepper.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  loading,
  accessibilityLabel,
}: QuantityStepperProps) {
  const canDecrease = !disabled && !loading && value > min;
  const canIncrease = !disabled && !loading && (max === undefined || value < max);

  const labelFor = (action: string) =>
    accessibilityLabel ? `${accessibilityLabel} ${action}` : action;

  return (
    <XStack
      alignItems="center"
      borderColor="$borderColor"
      borderRadius={100}
      borderWidth={1}
      height={36}
      overflow="hidden"
    >
      {loading ? (
        <XStack alignItems="center" justifyContent="center" width={108} height={34}>
          <Spinner color="$brand" size="small" />
        </XStack>
      ) : (
        <>
          <Button
            accessibilityLabel={labelFor('azalt')}
            accessibilityRole="button"
            alignItems="center"
            backgroundColor="$backgroundHover"
            borderWidth={0}
            borderRadius={0}
            chromeless
            disabled={!canDecrease}
            height={34}
            icon={<Minus color="$color10" size={14} />}
            justifyContent="center"
            onPress={() => {
              if (canDecrease) onChange(value - 1);
            }}
            opacity={canDecrease ? 1 : 0.4}
            padding={0}
            width={36}
          />
          <Paragraph
            color="$color"
            fontSize={14}
            fontWeight="600"
            minWidth={36}
            textAlign="center"
          >
            {value}
          </Paragraph>
          <Button
            accessibilityLabel={labelFor('artır')}
            accessibilityRole="button"
            alignItems="center"
            backgroundColor="$backgroundHover"
            borderWidth={0}
            borderRadius={0}
            chromeless
            disabled={!canIncrease}
            height={34}
            icon={<Plus color="$color10" size={14} />}
            justifyContent="center"
            onPress={() => {
              if (canIncrease) onChange(value + 1);
            }}
            opacity={canIncrease ? 1 : 0.4}
            padding={0}
            width={36}
          />
        </>
      )}
    </XStack>
  );
}
