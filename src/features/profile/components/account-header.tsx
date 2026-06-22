import { Pressable } from 'react-native';
import { ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { User } from '@/types/auth.types';
import { AccountAvatar } from './account-avatar';

type AccountHeaderProps = {
  user: User;
  /** Tapping the identity block or the "DOĞRULA" badge opens the user info flow. */
  onPressName: () => void;
  /** When true the bar gains a solid background and bottom border (set on scroll). */
  scrolled?: boolean;
};

function resolveDisplayName(user: User): string {
  const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
  return fullName || user.phoneNumber || user.email || 'Kullanıcı';
}

/**
 * Account identity header mirroring the web account page: a brand-gradient avatar
 * beside the tappable name and e-mail, plus a "DOĞRULA" badge shown only when the
 * e-mail is not verified.
 */
export function AccountHeader({ user, onPressName, scrolled = false }: AccountHeaderProps) {
  const displayName = resolveDisplayName(user);
  const showVerify = user.emailVerified === false;

  return (
    <XStack
      alignItems="center"
      backgroundColor={scrolled ? '$color1' : 'transparent'}
      borderBottomColor="$borderColor"
      borderBottomWidth={scrolled ? 1 : 0}
      gap="$3"
      paddingHorizontal="$4"
      paddingVertical={20}
      width="100%"
    >
      <Pressable
        accessibilityLabel={displayName}
        accessibilityRole="button"
        onPress={onPressName}
        style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.6 : 1 })}
      >
        <XStack alignItems="center" gap="$3" flex={1}>
          <AccountAvatar
            email={user.email}
            name={user.name}
            size={56}
            surname={user.surname}
          />
          <YStack flex={1}>
            <Paragraph color="$color" fontSize={19} fontWeight="700" numberOfLines={1}>
              {displayName}
            </Paragraph>
            {user.email ? (
              <Paragraph color="$color10" fontSize={14} numberOfLines={1}>
                {user.email}
              </Paragraph>
            ) : null}
          </YStack>
        </XStack>
      </Pressable>

      {showVerify ? (
        <Pressable
          accessibilityLabel="E-postanı doğrula"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onPressName}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            borderRadius="$2"
            gap="$1"
            paddingHorizontal="$2"
            paddingVertical="$1"
          >
            <Paragraph color="white" fontSize={10} fontWeight="800">
              DOĞRULA
            </Paragraph>
            <ChevronRight color="white" size={12} />
          </XStack>
        </Pressable>
      ) : null}
    </XStack>
  );
}
