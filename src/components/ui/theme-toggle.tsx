import { Moon, Monitor, Sun } from '@/components/ui/icons';
import { Button, useTheme, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

export type ThemePreference = 'dark' | 'light' | 'system';

type ThemeToggleProps = {
  onValueChange: (value: ThemePreference) => void;
  value: ThemePreference;
};

const options: {
  icon: typeof Monitor;
  label: string;
  value: ThemePreference;
}[] = [
  { icon: Monitor, label: 'Sistem', value: 'system' },
  { icon: Sun, label: 'Aydınlık', value: 'light' },
  { icon: Moon, label: 'Koyu', value: 'dark' },
];

/**
 * Segmented theme switcher: a pill-shaped inset track with three segments. The
 * active segment is lifted on a brand-colored chip with white content; inactive
 * segments stay muted. Self-contained contrast keeps every segment readable in
 * both light and dark themes.
 */
export function ThemeToggle({ onValueChange, value }: ThemeToggleProps) {
  const theme = useTheme();

  return (
    <XStack
      backgroundColor="$color3"
      borderRadius={100}
      gap="$1.5"
      padding="$1"
      width="100%"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        const contentColor = isActive ? '#ffffff' : theme.color11.val;

        return (
          <Button
            accessibilityLabel={`${option.label} temasını seç`}
            accessibilityState={{ selected: isActive }}
            backgroundColor={isActive ? '$brand' : 'transparent'}
            borderRadius={100}
            borderWidth={0}
            flex={1}
            height={40}
            key={option.value}
            onPress={() => onValueChange(option.value)}
            pressStyle={{ backgroundColor: isActive ? '$brand' : '$color4', opacity: 0.85 }}
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={isActive ? 0.25 : 0}
            shadowRadius={6}
          >
            <XStack alignItems="center" gap="$1.5" justifyContent="center">
              <Icon color={contentColor as any} size={17} />
              <Paragraph
                fontSize={13}
                fontWeight="700"
                numberOfLines={1}
                style={{ color: contentColor }}
              >
                {option.label}
              </Paragraph>
            </XStack>
          </Button>
        );
      })}
    </XStack>
  );
}
