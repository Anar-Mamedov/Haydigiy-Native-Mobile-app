import { H2, Paragraph, YStack } from 'tamagui';
import { AppScreen, SectionCard, ThemeToggle } from '@/components/ui';
import { useAppTheme } from '@/lib/theme/use-app-theme';

export function ProfileScreen() {
  const { setThemePreference, themePreference } = useAppTheme();

  return (
    <AppScreen>
      <YStack gap="$2">
        <H2>Profile</H2>
        <Paragraph color="$color10">
          Theme preferences are persisted globally and resolved against system theme.
        </Paragraph>
      </YStack>

      <SectionCard>
        <YStack gap="$3">
          <Paragraph fontSize="$6" fontWeight="700">
            Appearance
          </Paragraph>
          <ThemeToggle onValueChange={setThemePreference} value={themePreference} />
        </YStack>
      </SectionCard>
    </AppScreen>
  );
}
