import { Pressable } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ProgressTrack } from '@/components/ui/progress-track';
import { SectionCard } from '@/components/ui/section-card';
import type { ProfileCompletion } from '../utils/profile-completion';

type ProfileCompletionCardProps = {
  /** `null` iken profil yükleniyor ya da okunamadı. */
  completion: ProfileCompletion | null;
  loading: boolean;
  /** "Tamamla": kullanıcı bilgileri ekranını açar. */
  onComplete: () => void;
};

const TITLE = 'Profil doluluk oranı';
const ROW_HEIGHT = 18;
const TRACK_HEIGHT = 8;

/**
 * Hesabım ekranındaki profil doluluk kartı (web'deki ProfileCompletionBar'ın
 * karşılığı). Yüklenirken aynı yükseklikte iskelet çizilir, böylece profil gelince
 * alttaki içerik kaymaz. Profil okunamazsa kart hiç çizilmez.
 */
export function ProfileCompletionCard({ completion, loading, onComplete }: ProfileCompletionCardProps) {
  if (!completion) {
    if (!loading) return null;

    return (
      <SectionCard
        accessibilityElementsHidden
        elevated
        importantForAccessibility="no-hide-descendants"
        testID="profile-completion-skeleton"
      >
        <YStack gap="$2">
          <XStack alignItems="center" height={ROW_HEIGHT}>
            <YStack backgroundColor="$backgroundHover" borderRadius="$2" height={12} width={128} />
          </XStack>
          <YStack backgroundColor="$backgroundHover" borderRadius={100} height={TRACK_HEIGHT} />
          <YStack height={ROW_HEIGHT} />
        </YStack>
      </SectionCard>
    );
  }

  const { isComplete, missingLabels, percent } = completion;
  const accentColor = isComplete ? '$green10' : '$brand';

  return (
    <SectionCard elevated testID="profile-completion-card">
      <YStack gap="$2">
        <XStack alignItems="center" height={ROW_HEIGHT} justifyContent="space-between">
          <Paragraph color="$color10" fontSize={13} lineHeight={ROW_HEIGHT}>
            {TITLE}
          </Paragraph>
          <Paragraph color={accentColor} fontSize={13} fontWeight="700" lineHeight={ROW_HEIGHT}>
            %{percent}
          </Paragraph>
        </XStack>
        <ProgressTrack
          accessibilityLabel={TITLE}
          color={accentColor}
          height={TRACK_HEIGHT}
          testID="profile-completion-track"
          value={percent}
        />
        <XStack alignItems="center" gap="$2" minHeight={ROW_HEIGHT}>
          {isComplete ? (
            <Paragraph color="$color10" fontSize={12} lineHeight={ROW_HEIGHT}>
              Profil bilgileriniz eksiksiz.
            </Paragraph>
          ) : (
            <>
              <Paragraph color="$color10" flex={1} fontSize={12} lineHeight={ROW_HEIGHT} numberOfLines={1}>
                Eksik: {missingLabels.join(', ')}
              </Paragraph>
              <Pressable
                accessibilityHint="Kullanıcı bilgileri ekranını açar"
                accessibilityLabel="Profili tamamla"
                accessibilityRole="button"
                hitSlop={12}
                onPress={onComplete}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Paragraph color="$brand" fontSize={12} fontWeight="700" lineHeight={ROW_HEIGHT}>
                  Tamamla
                </Paragraph>
              </Pressable>
            </>
          )}
        </XStack>
      </YStack>
    </SectionCard>
  );
}
