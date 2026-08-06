import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Paragraph } from '@/components/ui/app-paragraph';
import { useSendCodeMutation } from '@/features/auth/api/auth.mutations';
import { OtpVerification } from '@/features/auth/components/otp-verification';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import {
  getOtpSendErrorFeedback,
  parseOtpCooldownSeconds,
} from '@/features/auth/utils/otp-delivery';
import { profileKeys } from '../api/profile.keys';
import type { UserProfile } from '../api/profile.mapper';
import { useUserProfileQuery } from '../api/profile.queries';
import { PhoneVerificationSheet } from './phone-verification-sheet';

type DeliveryState = {
  cooldownSeconds: number;
  message: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
};

const IDLE_DELIVERY_STATE: DeliveryState = {
  cooldownSeconds: 0,
  message: null,
  status: 'idle',
};

/**
 * Mirrors the web session gate: an unverified phone automatically receives a
 * code and the user must either verify it or sign out before using the app.
 */
export function PhoneVerificationGate() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const router = useRouter();
  const profileQuery = useUserProfileQuery(Boolean(user));
  const { mutateAsync: sendCode } = useSendCodeMutation();
  const sendCodeRef = useRef(sendCode);
  const requestedSessionPhoneRef = useRef<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryState>(IDLE_DELIVERY_STATE);

  useEffect(() => {
    sendCodeRef.current = sendCode;
  }, [sendCode]);

  const phone = profileQuery.data?.phone?.trim() ?? '';
  const verificationRequired =
    profileQuery.data?.phoneVerified === false ||
    profileQuery.data?.needsPhoneVerification === true;
  const isGateOpen = Boolean(user && phone && verificationRequired);
  const requestKey = user && phone ? `${user.id}:${phone}` : null;

  useEffect(() => {
    if (!isGateOpen || !requestKey) {
      requestedSessionPhoneRef.current = null;
      setDelivery(IDLE_DELIVERY_STATE);
      return;
    }

    if (requestedSessionPhoneRef.current === requestKey) return;
    requestedSessionPhoneRef.current = requestKey;
    let isCurrentRequest = true;

    setDelivery({ cooldownSeconds: 0, message: null, status: 'pending' });
    void sendCodeRef.current({ type: 'phone', value: phone })
      .then((response) => {
        if (!isCurrentRequest || requestedSessionPhoneRef.current !== requestKey) return;
        setDelivery({
          cooldownSeconds: parseOtpCooldownSeconds(response.remaining_seconds),
          message: response.message || 'Doğrulama kodu gönderildi.',
          status: 'success',
        });
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest || requestedSessionPhoneRef.current !== requestKey) return;
        const feedback = getOtpSendErrorFeedback(error);
        setDelivery({
          cooldownSeconds: feedback.cooldownSeconds,
          message: feedback.message,
          status: 'error',
        });
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isGateOpen, phone, requestKey]);

  const handleVerified = useCallback(async () => {
    if (!user) return;

    queryClient.setQueryData<UserProfile | null>(
      profileKeys.session(String(user.id)),
      (currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              needsPhoneVerification: false,
              phoneVerificationStatus: null,
              phoneVerified: true,
            }
          : currentProfile,
    );
    await profileQuery.refetch();
  }, [profileQuery, queryClient, user]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      queryClient.removeQueries({ queryKey: profileKeys.all });
      router.replace('/');
    } catch {
      setDelivery((current) => ({
        ...current,
        message: 'Çıkış yapılamadı. Lütfen tekrar deneyin.',
        status: 'error',
      }));
    }
  }, [logout, queryClient, router]);

  if (!isGateOpen) return null;

  return (
    <PhoneVerificationSheet onExit={handleLogout} open>
      {delivery.message ? (
        <Paragraph
          color={delivery.status === 'error' ? '$red10' : '$color10'}
          fontSize={12}
          textAlign="center"
        >
          {delivery.message}
        </Paragraph>
      ) : null}
      <OtpVerification
        cancelLabel="Çıkış Yap"
        flowType="profile"
        identifier={phone}
        initialCooldown={delivery.cooldownSeconds}
        isCodeDeliveryPending={delivery.status === 'pending'}
        onCancel={handleLogout}
        onSuccess={handleVerified}
      />
    </PhoneVerificationSheet>
  );
}
