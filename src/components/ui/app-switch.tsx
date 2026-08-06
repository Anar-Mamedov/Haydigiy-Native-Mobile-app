import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';

type AppSwitchProps = {
  accessibilityLabel: string;
  onValueChange: (value: boolean) => void;
  testID?: string;
  value: boolean;
};

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const THUMB_INSET = 3;

/**
 * Açma/kapama anahtarı. Platformun kendi Switch'i yerine Tamagui token'larıyla
 * çizildiği için iki temada da aynı görünüyor ve marka rengini kullanıyor.
 */
export function AppSwitch({ accessibilityLabel, onValueChange, testID, value }: AppSwitchProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}
      onPress={() => onValueChange(!value)}
      testID={testID}
    >
      <XStack
        alignItems="center"
        backgroundColor={value ? '$brand' : '$color5'}
        borderRadius={TRACK_HEIGHT / 2}
        height={TRACK_HEIGHT}
        paddingHorizontal={THUMB_INSET}
        width={TRACK_WIDTH}
      >
        <YStack
          backgroundColor="white"
          borderRadius={THUMB_SIZE / 2}
          height={THUMB_SIZE}
          marginLeft={value ? TRACK_WIDTH - THUMB_SIZE - THUMB_INSET * 2 : 0}
          width={THUMB_SIZE}
        />
      </XStack>
    </Pressable>
  );
}
