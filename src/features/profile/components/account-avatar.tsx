import { LinearGradient } from 'expo-linear-gradient';
import { Paragraph, XStack } from 'tamagui';
import { BRAND_COLOR } from '@/lib/theme/colors';

type AccountAvatarProps = {
  name?: string;
  surname?: string;
  email?: string;
  size?: number;
};

/** Derives up to two uppercase initials from the user's name, falling back to e-mail. */
function resolveInitials(name?: string, surname?: string, email?: string): string {
  const first = name?.trim()?.[0];
  const second = surname?.trim()?.[0];
  const initials = `${first ?? ''}${second ?? ''}`.trim();
  if (initials) return initials.toUpperCase();
  const emailInitial = email?.trim()?.[0];
  return (emailInitial ?? 'U').toUpperCase();
}

/**
 * Circular brand-gradient avatar showing the user's initials, mirroring the web
 * account header. Reused wherever the account identity is surfaced.
 */
export function AccountAvatar({ name, surname, email, size = 52 }: AccountAvatarProps) {
  const initials = resolveInitials(name, surname, email);

  return (
    <XStack
      accessibilityLabel="Profil resmi"
      accessibilityRole="image"
      borderRadius={size}
      height={size}
      overflow="hidden"
      width={size}
    >
      <LinearGradient
        // Theme tokens don't resolve inside expo-linear-gradient; the brand stop is
        // sourced from the shared BRAND_COLOR constant, flanked by decorative ends.
        colors={['#f9a826', BRAND_COLOR, '#e0457b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <Paragraph color="white" fontSize={size * 0.4} fontWeight="800">
          {initials}
        </Paragraph>
      </LinearGradient>
    </XStack>
  );
}
