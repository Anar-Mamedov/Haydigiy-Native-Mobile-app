import { Moon, Monitor, Sun } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, useTheme, XStack } from 'tamagui';

export type ThemePreference = 'dark' | 'light' | 'system';

type ThemeToggleProps = {
  onValueChange: (value: ThemePreference) => void;
  value: ThemePreference;
};

const options: Array<{
  icon: typeof Monitor;
  label: string;
  value: ThemePreference;
}> = [
  { icon: Monitor, label: 'System', value: 'system' },
  { icon: Sun, label: 'Light', value: 'light' },
  { icon: Moon, label: 'Dark', value: 'dark' },
];

export function ThemeToggle({ onValueChange, value }: ThemeToggleProps) {
  const theme = useTheme();

  return (
    <XStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$7"
      borderWidth={1}
      gap="$2"
      padding="$2"
      width="100%"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        const textColor = isActive ? theme.color.val : theme.color11.val;

        return (
          <Button
            accessibilityLabel={`Activate ${option.label} theme`}
            accessibilityState={{ selected: isActive }}
            backgroundColor={isActive ? '$backgroundFocus' : '$background'}
            borderColor={isActive ? '$borderColorFocus' : '$borderColor'}
            borderRadius="$5"
            borderWidth={1}
            flex={1}
            hoverStyle={{
              backgroundColor: '$backgroundHover',
            }}
            key={option.value}
            onPress={() => onValueChange(option.value)}
            pressStyle={{
              backgroundColor: '$backgroundPress',
            }}
            size="$3"
          >
            <XStack alignItems="center" gap="$2" justifyContent="center">
              <Icon color={textColor as any} size={18} />
              <Paragraph fontWeight="600" numberOfLines={1} style={{ color: textColor }}>
                {option.label}
              </Paragraph>
            </XStack>
          </Button>
        );
      })}
    </XStack>
  );
}
