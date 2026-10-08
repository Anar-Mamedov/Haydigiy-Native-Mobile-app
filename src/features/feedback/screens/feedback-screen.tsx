import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, KeyboardAwareFormScrollView, ScreenHeader, SectionCard } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { FEEDBACK_TEXTS } from '../constants/feedback-texts';
import { useFeedbackForm } from '../hooks/use-feedback-form';
import { FeedbackForm } from '../components/feedback-form';
import { FeedbackSuccessDialog } from '../components/feedback-success-dialog';

// Çok satırlı alan odaktayken altındaki "Gönder" düğmesi de klavyenin üstünde kalsın.
const FEEDBACK_KEYBOARD_BOTTOM_OFFSET = 96;

/** Hesabım > Geri Bildirim Yapın (web `/hesabim/geri-bildirim`). */
export function FeedbackScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const form = useFeedbackForm();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  };

  const header = <ScreenHeader onBack={handleBack} title={FEEDBACK_TEXTS.title} />;

  if (authLoading) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Giriş Yap"
            description="Geri bildirim göndermek için hesabınıza giriş yapın."
            onActionPress={() => router.replace('/profile')}
            primary
            title="Giriş Yapın"
          />
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
      <KeyboardAwareFormScrollView
        bottomOffset={FEEDBACK_KEYBOARD_BOTTOM_OFFSET}
        contentContainerStyle={{ padding: 12 }}
        testID="feedback-keyboard-aware-scroll"
      >
        <SectionCard elevated>
          <FeedbackForm
            canSubmit={form.canSubmit}
            control={form.control}
            fieldError={form.fieldError}
            isSubmitting={form.isSubmitting}
            onSubmit={form.submit}
            submitError={form.submitError}
          />
        </SectionCard>
      </KeyboardAwareFormScrollView>

      <FeedbackSuccessDialog onClose={form.closeSuccess} open={form.successOpen} />
    </AppScreen>
  );
}
