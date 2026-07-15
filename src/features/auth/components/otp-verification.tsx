import React, { useState, useEffect, useRef } from 'react';
import { TextInput, Pressable } from 'react-native';
import { YStack, XStack, Paragraph, Button, Spinner } from 'tamagui';
import { AppButton, AppCheckbox, DisclosureSheet } from '@/components/ui';
import {
  useFastLoginInitMutation,
  useFastLoginVerifyMutation,
  useSendCodeMutation,
  useVerifyCodeMutation,
} from '../api/auth.mutations';
import { otpSchema } from '../schemas/auth.schema';
import { useAuthStore } from '../store/use-auth-store';
import { KVKK_DISCLOSURE_TEXT, COMMERCIAL_CONSENT_TEXT } from '../constants/auth-texts';
import { getOtpSendErrorFeedback, parseOtpCooldownSeconds } from '../utils/otp-delivery';

interface OtpVerificationProps {
  identifier: string;
  isNewUser?: boolean;
  flowType: 'register' | 'fast-login' | 'profile';
  initialCooldown?: number;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void | Promise<void>;
  cancelLabel?: string;
  isCodeDeliveryPending?: boolean;
}

export function OtpVerification({
  identifier,
  isNewUser = false,
  flowType,
  initialCooldown = 60,
  onSuccess,
  onCancel,
  cancelLabel = 'Vazgeç',
  isCodeDeliveryPending = false,
}: OtpVerificationProps) {
  const storeLogin = useAuthStore((state) => state.login);
  const fastLoginVerify = useFastLoginVerifyMutation();
  const verifyCode = useVerifyCodeMutation();
  const fastLoginInit = useFastLoginInitMutation();
  const sendCode = useSendCodeMutation();
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Consents for fast login new user
  const [kvkkConsent, setKvkkConsent] = useState(false);
  const [commercialConsent, setCommercialConsent] = useState(false);
  const [sheetContent, setSheetContent] = useState<{ title: string; text: string } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    setCooldown(initialCooldown);
  }, [initialCooldown]);

  const handleVerify = async () => {
    const parsedCode = otpSchema.safeParse({ code });
    if (!parsedCode.success) {
      setError(parsedCode.error.issues[0]?.message ?? 'Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    if (flowType === 'fast-login' && isNewUser && !kvkkConsent) {
      setError('KVKK aydınlatma metni onayı zorunludur.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setInfo(null);

    let willCommitLogin = false;
    try {
      let response;
      if (flowType === 'fast-login') {
        const type = identifier.includes('@') ? 'email' : 'phone';
        response = await fastLoginVerify.mutateAsync({
          type,
          identifier,
          code,
          kvkk_consent: isNewUser ? kvkkConsent : undefined,
          communication_consent: isNewUser ? commercialConsent : undefined,
          device_info: isNewUser ? { device_type: 'mobile', platform: 'native' } : undefined,
        });
      } else {
        // Registration flow OTP verify
        response = await verifyCode.mutateAsync({
          type: 'phone',
          value: identifier,
          code,
        });
      }

      if (flowType === 'profile') {
        await onSuccess();
        return;
      }

      if (response.token && response.user) {
        const token = response.token;
        const userWithPhone = {
          ...response.user,
          phoneNumber: response.user.phone || identifier,
        };
        // Committing the user flips ProfileScreen to the authenticated view, which
        // unmounts this OTP screen together with its modal Sheet portal. Doing that
        // synchronously inside the verify handler re-enters the New Architecture
        // renderer mid-work and crashes ("Should not already be working."). Defer
        // the commit one frame so the teardown happens on a clean tick.
        willCommitLogin = true;
        requestAnimationFrame(() => {
          void storeLogin(token, userWithPhone)
            .then(onSuccess)
            .catch((storeError) => {
              console.error('Auth state commit failed:', storeError);
              setError('Giriş tamamlanamadı. Lütfen tekrar deneyin.');
              setIsVerifying(false);
            });
        });
        return;
      } else {
        setError('Doğrulama başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      console.error('OTP verify error:', err);
      const apiMessage = err?.response?.data?.message || err?.message;
      setError(apiMessage || 'Girdiğiniz kod hatalı veya süresi dolmuş.');
    } finally {
      // On success the screen unmounts after the deferred commit, so keep the
      // spinner until then to avoid a re-tap window.
      if (!willCommitLogin) {
        setIsVerifying(false);
      }
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setInfo(null);
    try {
      let response;
      if (flowType === 'fast-login') {
        response = await fastLoginInit.mutateAsync({ identifier });
      } else {
        response = await sendCode.mutateAsync({ type: 'phone', value: identifier });
      }
      
      const nextCooldown = parseOtpCooldownSeconds(response.remaining_seconds, 60);
      setCooldown(nextCooldown);
      setInfo(response.message || 'Yeni doğrulama kodu gönderildi.');
      setCode('');
    } catch (err: unknown) {
      console.error('OTP resend error:', err);
      const feedback = getOtpSendErrorFeedback(err);
      setCooldown(feedback.cooldownSeconds);
      setError(feedback.message);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const openDisclosureSheet = (type: 'kvkk' | 'commercial') => {
    if (type === 'kvkk') {
      setSheetContent({ title: 'AYDINLATMA METNİ', text: KVKK_DISCLOSURE_TEXT });
    } else {
      setSheetContent({ title: 'AÇIK RIZA METNİ', text: COMMERCIAL_CONSENT_TEXT });
    }
    setIsSheetOpen(true);
  };

  return (
    <YStack gap="$5" width="100%" alignItems="center">
      <YStack gap="$1" width="100%">
        <Paragraph fontSize="$6" fontWeight="700" color="$color">
          Telefon Doğrulama
        </Paragraph>
        <Paragraph size="$2" color="$color10">
          Girdiğiniz numara: <Paragraph size="$2" fontWeight="700" color="$color">{identifier}</Paragraph>
        </Paragraph>
      </YStack>

      {/* Code Input Boxes container */}
      <Pressable
        accessibilityLabel="Telefon doğrulama kodunu gir"
        accessibilityRole="button"
        onPress={() => inputRef.current?.focus()}
        style={{ width: '100%' }}
      >
        <XStack gap="$2" justifyContent="space-between" width="100%" paddingVertical="$2">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const digit = code[i] || '';
            const isFocused = i === code.length;
            return (
              <YStack
                key={i}
                alignItems="center"
                justifyContent="center"
                width={48}
                height={52}
                borderWidth={1.5}
                borderColor={isFocused ? '$brand' : '$borderColor'}
                borderRadius={8}
                backgroundColor="$background"
              >
                <Paragraph fontSize={20} fontWeight="700" color="$color">
                  {digit}
                </Paragraph>
              </YStack>
            );
          })}
        </XStack>
      </Pressable>

      {/* Hidden text input to capture keyboard entries */}
      <TextInput
        accessibilityLabel="6 haneli telefon doğrulama kodu"
        ref={inputRef}
        value={code}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, 6);
          setCode(digits);
          setError(null);
        }}
        keyboardType="numeric"
        maxLength={6}
        style={{
          position: 'absolute',
          opacity: 0,
          width: 1,
          height: 1,
        }}
        textContentType="oneTimeCode"
        autoFocus
      />

      {/* KVKK / Consent for new fast login users */}
      {flowType === 'fast-login' && isNewUser && (
        <YStack gap="$3" width="100%" borderWidth={1} borderColor="$borderColor" padding="$3" borderRadius="$4" backgroundColor="$backgroundHover">
          <Paragraph size="$2" fontWeight="700" color="$color">
            Yeni Üyelik Onayları
          </Paragraph>

          <AppCheckbox
            accessibilityLabel="KVKK Onayı"
            checked={kvkkConsent}
            onChange={setKvkkConsent}
            size={20}
          >
            <Paragraph size="$2" color="$color10" lineHeight="$4">
              KVKK{' '}
              <Paragraph
                size="$2"
                color="$brand"
                fontWeight="700"
                textDecorationLine="underline"
                onPress={() => openDisclosureSheet('kvkk')}
              >
                Aydınlatma Metni
              </Paragraph>
              ’ni okudum ve onaylıyorum. (*)
            </Paragraph>
          </AppCheckbox>

          <AppCheckbox
            accessibilityLabel="Ticari İleti İzni"
            checked={commercialConsent}
            onChange={setCommercialConsent}
            size={20}
          >
            <Paragraph size="$2" color="$color10" lineHeight="$4">
              Tarafıma kampanya ve bilgilendirmeler için{' '}
              <Paragraph
                size="$2"
                color="$brand"
                fontWeight="700"
                textDecorationLine="underline"
                onPress={() => openDisclosureSheet('commercial')}
              >
                ticari ileti gönderilmesini
              </Paragraph>{' '}
              onaylıyorum.
            </Paragraph>
          </AppCheckbox>
        </YStack>
      )}

      {error && (
        <Paragraph color="$red10" size="$2" textAlign="center" fontWeight="500">
          {error}
        </Paragraph>
      )}

      {info && (
        <Paragraph color="$green10" size="$2" textAlign="center" fontWeight="500">
          {info}
        </Paragraph>
      )}

      {/* Buttons */}
      <YStack gap="$3" width="100%">
        <AppButton
          id="otp-verify-btn"
          backgroundColor="$brand"
          color="white"
          borderColor="transparent"
          onPress={handleVerify}
          disabled={isVerifying || code.length < 6}
          pressStyle={{ opacity: 0.8 }}
        >
          {isVerifying ? <Spinner color="white" /> : 'Doğrula ve Devam Et'}
        </AppButton>

        <XStack justifyContent="space-between" width="100%" alignItems="center" paddingHorizontal="$1">
          {cooldown > 0 ? (
            <Paragraph size="$2" color="$color10">
              Kalan Süre: <Paragraph size="$2" fontWeight="700" color="$color">{formatTime(cooldown)}</Paragraph>
            </Paragraph>
          ) : (
            <Button
              accessibilityLabel="Doğrulama kodunu tekrar gönder"
              chromeless
              padding={0}
              size="$2"
              onPress={handleResend}
              disabled={isResending || isCodeDeliveryPending}
              pressStyle={{ opacity: 0.6 }}
            >
              <Paragraph size="$2" color="$brand" fontWeight="700">
                {isResending || isCodeDeliveryPending ? 'Gönderiliyor...' : 'Kodu Tekrar Gönder'}
              </Paragraph>
            </Button>
          )}

          <Button
            accessibilityLabel={cancelLabel}
            chromeless
            padding={0}
            size="$2"
            onPress={() => void onCancel()}
            pressStyle={{ opacity: 0.6 }}
          >
            <Paragraph size="$2" color="$color10" textDecorationLine="underline">
              {cancelLabel}
            </Paragraph>
          </Button>
        </XStack>
      </YStack>

      <DisclosureSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={sheetContent?.title}
        text={sheetContent?.text}
      />
    </YStack>
  );
}
