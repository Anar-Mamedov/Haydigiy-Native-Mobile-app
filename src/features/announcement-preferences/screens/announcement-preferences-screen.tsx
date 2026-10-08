import { Fragment } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Separator, Spinner, YStack } from 'tamagui';
import { AppButton, AppScreen, EmptyState, ScreenHeader, SectionCard } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { ANNOUNCEMENT_OPTIONS, ANNOUNCEMENT_PREFERENCES_TEXTS } from '../constants/announcement-options';
import { useAnnouncementPreferencesForm } from '../hooks/use-announcement-preferences-form';
import { AnnouncementPreferenceRow } from '../components/announcement-preference-row';

/** Hesabım > Duyuru Tercihlerim (web `/hesabim/duyurular`). */
export function AnnouncementPreferencesScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStatus();
  const form = useAnnouncementPreferencesForm(isAuthenticated);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/profile');
  };

  const handleSave = async () => {
    const result = await form.save();
    Alert.alert(result.ok ? 'Başarılı' : 'Hata', result.message);
  };

  const header = <ScreenHeader onBack={handleBack} title={ANNOUNCEMENT_PREFERENCES_TEXTS.title} />;

  if (authLoading || (isAuthenticated && form.isLoading)) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center" testID="announcement-preferences-loading">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (!isAuthenticated || form.isError) {
    return (
      <AppScreen backgroundColor="$color3" gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          {isAuthenticated ? (
            <EmptyState
              actionLabel="Tekrar Dene"
              description="Duyuru tercihleriniz yüklenirken bir hata oluştu."
              onActionPress={() => form.refetch()}
              primary
              title="Bir Hata Oluştu"
            />
          ) : (
            <EmptyState
              actionLabel="Giriş Yap"
              description="Duyuru tercihlerinizi görmek için hesabınıza giriş yapın."
              onActionPress={() => router.replace('/profile')}
              primary
              title="Giriş Yapın"
            />
          )}
        </YStack>
      </AppScreen>
    );
  }

  return (
    <AppScreen backgroundColor="$color3" header={header}>
      <SectionCard elevated paddingVertical="$1">
        {ANNOUNCEMENT_OPTIONS.map((option, index) => (
          <Fragment key={option.channel}>
            {index > 0 ? <Separator borderColor="$borderColor" /> : null}
            <AnnouncementPreferenceRow
              disabled={form.isSaving}
              onToggle={() => form.toggle(option.channel)}
              option={option}
              value={form.values[option.channel]}
            />
          </Fragment>
        ))}
      </SectionCard>

      <AppButton
        backgroundColor="$brand"
        borderColor="transparent"
        color="white"
        disabled={form.isSaving}
        id="announcement-preferences-submit"
        onPress={handleSave}
        pressStyle={{ opacity: 0.85 }}
      >
        {form.isSaving ? <Spinner color="white" /> : ANNOUNCEMENT_PREFERENCES_TEXTS.updateButton}
      </AppButton>
    </AppScreen>
  );
}
