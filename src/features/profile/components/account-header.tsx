import { Pressable } from 'react-native';
import { ArrowLeft, ChevronRight } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack } from 'tamagui';
import { User } from '@/types/auth.types';

type AccountHeaderProps = {
  user: User;
  onBack: () => void;
  /** Tapping the name or the "DOĞRULA" badge opens the user info flow. */
  onPressName: () => void;
};

function resolveDisplayName(user: User): string {
  const fullName = `${user.name || ''} ${user.surname || ''}`.trim();
  return fullName || user.phoneNumber || user.email || 'Kullanıcı';
}

/**
 * Account top bar mirroring the web `TopTap`: back navigation, the centered,
 * tappable display name, and a "DOĞRULA" badge shown only when the e-mail is
 * not verified.
 */
export function AccountHeader({ user, onBack, onPressName }: AccountHeaderProps) {
  const displayName = resolveDisplayName(user);
  const showVerify = user.emailVerified === false;

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
      <XStack left={8} position="absolute" zIndex={10}>
        <Pressable
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
        >
          <ArrowLeft color="$color" size={24} />
        </Pressable>
      </XStack>

      <Pressable
        accessibilityLabel={displayName}
        accessibilityRole="button"
        onPress={onPressName}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, maxWidth: '60%' })}
      >
        <Paragraph color="$color" fontSize={15} fontWeight="700" numberOfLines={1}>
          {displayName}
        </Paragraph>
      </Pressable>

      {showVerify ? (
        <XStack position="absolute" right={12} zIndex={10}>
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
        </XStack>
      ) : null}
    </XStack>
  );
}
