import { useEffect, useState } from 'react';
import { XStack, YStack } from 'tamagui';
import { AppInput } from '@/components/ui/app-input';
import { Paragraph } from '@/components/ui/app-paragraph';
import { IconButton } from '@/components/ui/icon-button';
import { SendHorizontal } from '@/components/ui/icons';
import type { AssistantTexts } from '@/types/assistant.types';
import { sendAssistantText } from '../services/assistant-turn-flow';
import { useAssistantStore } from '../store/use-assistant-store';

/** 429 kilidinde kalan saniye; kilit yoksa 0. */
function useLockCountdown(): number {
  const lockedUntil = useAssistantStore((state) => state.lockedUntil);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) clearInterval(timer);
    };
    const timer = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [lockedUntil]);

  return remaining;
}

/**
 * Yazı kutusu YALNIZ `input.mode = "text"` iken çizilir (README §6.10); kutu gizlenince taslak silinir.
 * İstek uçuştayken ve 429 kilidinde gönderim kapalıdır. Klavye ekranın `KeyboardAvoidingView`'iyle
 * yönetilir (sohbet ekranı bir form sayfası değil, altta sabit giriş satırıdır).
 */
export function AssistantComposer({ texts }: { texts: AssistantTexts }) {
  const input = useAssistantStore((state) => state.input);
  const busy = useAssistantStore((state) => state.busy);
  const draft = useAssistantStore((state) => state.draft);
  const setDraft = useAssistantStore((state) => state.setDraft);
  const lockSeconds = useLockCountdown();
  const inFlightOrLocked = busy || lockSeconds > 0;
  const blocked = inFlightOrLocked || !draft.trim();
  const placeholder = input.placeholder || texts.input_placeholder;

  const handleSend = () => {
    if (blocked) return;
    const text = draft;
    setDraft('');
    void sendAssistantText(text);
  };

  return (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      gap="$2"
      paddingHorizontal="$3"
      paddingVertical="$2"
      testID="assistant-composer"
    >
      <YStack flex={1}>
        <AppInput
          enterKeyHint="send"
          hideVisibleLabel
          label={placeholder}
          maxLength={input.maxlength}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          placeholder={placeholder}
          // İstek uçuştayken ve 429 kilidinde salt okunur (kural 5); klavye kapanmasın diye `editable` değil.
          readOnly={inFlightOrLocked}
          returnKeyType="send"
          submitBehavior="submit"
          testID="assistant-composer-input"
          value={draft}
        />
      </YStack>
      <IconButton
        accessibilityLabel={texts.send_label}
        accessibilityState={{ disabled: blocked }}
        onPress={handleSend}
      >
        {lockSeconds > 0 ? (
          <Paragraph color="$color10" fontWeight="700">
            {lockSeconds}
          </Paragraph>
        ) : (
          <SendHorizontal color={blocked ? '$color8' : '$brand'} size={24} />
        )}
      </IconButton>
    </XStack>
  );
}
