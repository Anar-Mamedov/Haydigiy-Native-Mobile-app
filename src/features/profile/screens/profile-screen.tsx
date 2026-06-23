import React, { useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from '@tamagui/lucide-icons-2';
import { Paragraph, YStack, XStack, Button, Separator, ScrollView } from 'tamagui';
import { AppScreen } from '@/components/ui';
import { useAuthStore } from '../../auth/store/use-auth-store';
import { useAuthStatus } from '../../auth/hooks/use-auth-status';
import { LoginForm } from '../../auth/components/login-form';
import { RegisterForm } from '../../auth/components/register-form';
import { FastLoginForm } from '../../auth/components/fast-login-form';
import { OtpVerification } from '../../auth/components/otp-verification';
import { AccountHub } from '../components/account-hub';
import { AccountHeader } from '../components/account-header';
import { useUserProfileQuery } from '../api/profile.queries';

type ActiveView = 'login' | 'register' | 'fast-login' | 'otp';

export function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isAuthenticated, isLoading: authChecking } = useAuthStatus();
  // Profile holds the authoritative e-mail verification flag (from /user/profile).
  const { data: profile } = useUserProfileQuery(isAuthenticated);

  // Drives the collapsing account header (transparent at top, solid once scrolled).
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y > 8;
    setHeaderScrolled((prev) => (prev === next ? prev : next));
  };

  // Navigation states for unauthenticated views
  const [activeView, setActiveView] = useState<ActiveView>('login');
  const [otpParams, setOtpParams] = useState<{
    identifier: string;
    isNewUser: boolean;
    flowType: 'register' | 'fast-login';
    cooldown: number;
  } | null>(null);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authChecking) {
    return (
      <AppScreen>
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Paragraph color="$color10">Kullanıcı bilgisi kontrol ediliyor...</Paragraph>
        </YStack>
      </AppScreen>
    );
  }

  // 1. Authenticated User Profile View
  if (isAuthenticated && user) {
    const handleUserInfoPress = () => {
      router.push('/(tabs)/user-info');
    };

    // The profile endpoint is authoritative for the verification flag.
    const headerUser =
      profile != null ? { ...user, emailVerified: profile.emailVerified } : user;

    return (
      <AppScreen
        backgroundColor="$color3"
        topBackgroundColor={headerScrolled ? '$color1' : '$color3'}
        header={
          <AccountHeader
            onPressName={handleUserInfoPress}
            scrolled={headerScrolled}
            user={headerUser}
          />
        }
        onScroll={handleScroll}
      >
        <AccountHub onLogout={handleLogout} />
      </AppScreen>
    );
  }

  // 2. Guest View / Authentication Flow
  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <YStack gap="$4" paddingBottom="$6">
          {/* Header Bar with Back Arrow */}
          <XStack alignItems="center" gap="$3" paddingVertical="$2">
            <Button
              id="auth-back-btn"
              icon={<ArrowLeft size={24} color="$color" />}
              chromeless
              circular
              onPress={handleBackPress}
              pressStyle={{ opacity: 0.6 }}
              accessibilityLabel="Geri Dön"
            />
            <Paragraph fontSize={20} fontWeight="700" color="$color">
              {activeView === 'login'
                ? 'Giriş Yap'
                : activeView === 'register'
                ? 'Üye Ol'
                : activeView === 'fast-login'
                ? 'Hızlı Giriş'
                : 'Doğrulama'}
            </Paragraph>
          </XStack>

          <Separator borderColor="$borderColor" />

          {/* Form Content */}
          {activeView === 'otp' && otpParams ? (
            <OtpVerification
              identifier={otpParams.identifier}
              isNewUser={otpParams.isNewUser}
              flowType={otpParams.flowType}
              initialCooldown={otpParams.cooldown}
              onSuccess={() => {
                setActiveView('login');
                setOtpParams(null);
              }}
              onCancel={() => {
                setActiveView(otpParams.flowType === 'register' ? 'register' : 'fast-login');
                setOtpParams(null);
              }}
            />
          ) : (
            <YStack gap="$4">
              {/* Tab Navigation (Login vs Register) when not in OTP or Fast Login */}
              {activeView !== 'fast-login' && (
                <XStack width="100%" borderBottomWidth={1} borderBottomColor="$borderColor" paddingBottom="$1">
                  <PressableTab
                    active={activeView === 'login'}
                    label="Giriş Yap"
                    onPress={() => setActiveView('login')}
                  />
                  <PressableTab
                    active={activeView === 'register'}
                    label="Üye Ol"
                    onPress={() => setActiveView('register')}
                  />
                </XStack>
              )}

              {activeView === 'login' && (
                <LoginForm
                  onSuccess={() => {
                    // Handled automatically by Zustand update & useAuthStatus hook
                  }}
                  onFastLoginPress={() => setActiveView('fast-login')}
                />
              )}

              {activeView === 'register' && (
                <RegisterForm
                  onSuccess={(phone) => {
                    setOtpParams({
                      identifier: phone,
                      isNewUser: false,
                      flowType: 'register',
                      cooldown: 60,
                    });
                    setActiveView('otp');
                  }}
                />
              )}

              {activeView === 'fast-login' && (
                <FastLoginForm
                  onSuccess={(identifier, isNewUser, type, remainingSeconds) => {
                    setOtpParams({
                      identifier,
                      isNewUser,
                      flowType: 'fast-login',
                      cooldown: remainingSeconds,
                    });
                    setActiveView('otp');
                  }}
                  onBackToLogin={() => setActiveView('login')}
                />
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </AppScreen>
  );
}

interface PressableTabProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

function PressableTab({ active, label, onPress }: PressableTabProps) {
  return (
    <Button
      flex={1}
      backgroundColor="transparent"
      chromeless
      borderRadius={0}
      borderBottomWidth={active ? 2 : 0}
      borderBottomColor="$brand"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
    >
      <Paragraph
        fontSize="$4"
        fontWeight={active ? '700' : '500'}
        color={active ? '$brand' : '$color10'}
        textAlign="center"
      >
        {label}
      </Paragraph>
    </Button>
  );
}
