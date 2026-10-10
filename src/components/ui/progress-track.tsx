import type { ColorTokens } from 'tamagui';
import { YStack } from 'tamagui';

type ProgressTrackProps = {
  /** 0–100; aralık dışı ya da sayı olmayan değer kırpılır. */
  value: number;
  /** Ekran okuyucunun okuyacağı ad, ör. "Profil doluluk oranı". */
  accessibilityLabel: string;
  color?: ColorTokens;
  height?: number;
  testID?: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;

  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Yatay ilerleme çubuğu: tema rengindeki iz üzerinde dolu kısım. Ekran
 * okuyucuya `progressbar` rolü ve 0–100 değeriyle duyurulur.
 */
export function ProgressTrack({ value, accessibilityLabel, color = '$brand', height = 8, testID }: ProgressTrackProps) {
  const percent = clampPercent(value);

  return (
    <YStack
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="progressbar"
      accessibilityValue={{ max: 100, min: 0, now: percent }}
      backgroundColor="$backgroundHover"
      borderRadius={100}
      height={height}
      overflow="hidden"
      testID={testID}
      width="100%"
    >
      <YStack
        backgroundColor={color}
        borderRadius={100}
        height="100%"
        testID={testID ? `${testID}-fill` : undefined}
        width={`${percent}%`}
      />
    </YStack>
  );
}
