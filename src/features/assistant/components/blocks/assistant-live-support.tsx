import { useState } from 'react';
import { Linking } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import { WhatsappIcon } from '@/components/ui/whatsapp-icon';
import type { AssistantTexts } from '@/types/assistant.types';
import { useAssistantCopy } from '../../hooks/use-assistant-copy';
import { trackAssistantEvent } from '../../services/assistant-events';
import { splitLeadingEmoji } from '../../utils/assistant-label-emoji';
import { AssistantMutedText } from '../assistant-surfaces';

type AssistantLiveSupportProps = {
  texts: AssistantTexts;
  label: string;
  /** Doğrulanmış wa.me adresi (desen dışıysa `config.fallback.live_support.href`). Değiştirilmez. */
  href: string;
  numberLabel: string;
  hint?: string;
  copyText?: string;
  blockId?: string;
};

const LIVE_SUPPORT_MIN_HEIGHT = 52;

/**
 * Canlı Destek (WhatsApp) — her zaman çalışmalı (README §7.2). Dokunuştan sonra kalıcı yedek satır:
 * "WhatsApp açılmadıysa: [Mesajı kopyala] · Numara: …" (numara seçilebilir metin, `tel:` değil).
 */
export function AssistantLiveSupport({
  texts,
  label,
  href,
  numberLabel,
  hint,
  copyText,
  blockId,
}: AssistantLiveSupportProps) {
  const [showBackup, setShowBackup] = useState(false);
  const { state, copy } = useAssistantCopy();

  const handleOpen = () => {
    trackAssistantEvent('live_support_click', { blockId }, { flushNow: true });
    Linking.openURL(href).catch(() => undefined);
    setShowBackup(true);
  };

  const handleCopy = async () => {
    if (!copyText) return;
    if ((await copy(copyText)) === 'copied') trackAssistantEvent('live_support_copy', { blockId });
  };

  return (
    <YStack gap="$2">
      {hint ? <AssistantMutedText>{hint}</AssistantMutedText> : null}
      <XStack
        accessibilityLabel={label}
        accessibilityRole="link"
        alignItems="center"
        backgroundColor="$assistantLiveSupport"
        borderRadius="$6"
        gap="$2.5"
        justifyContent="center"
        minHeight={Math.max(MIN_TOUCH_TARGET, LIVE_SUPPORT_MIN_HEIGHT)}
        onPress={handleOpen}
        paddingHorizontal="$4"
        pressStyle={{ opacity: 0.85 }}
        testID={blockId ? `assistant-live-${blockId}` : 'assistant-live-fallback'}
      >
        {/* Web `0aae36636`: baştaki emoji yerine WhatsApp simgesi; ekran okuyucu tam etiketi duyar. */}
        <WhatsappIcon color="white" size={18} />
        <Paragraph color="white" fontSize={14} fontWeight="800">
          {splitLeadingEmoji(label).text}
        </Paragraph>
      </XStack>
      {showBackup ? (
        <YStack gap="$1" testID="assistant-live-backup">
          <XStack alignItems="center" flexWrap="wrap" gap="$2">
            <AssistantMutedText>{texts.live_copy_hint}</AssistantMutedText>
            {copyText ? (
              <YStack
                accessibilityRole="button"
                minHeight={MIN_TOUCH_TARGET}
                justifyContent="center"
                onPress={() => void handleCopy()}
              >
                <Paragraph color="$color" fontSize={13} fontWeight="700" textDecorationLine="underline">
                  {texts.live_copy_button}
                </Paragraph>
              </YStack>
            ) : null}
            <AssistantMutedText>
              {texts.live_number_label}{' '}
              <Paragraph color="$color" fontSize={13} fontWeight="700" selectable>
                {numberLabel}
              </Paragraph>
            </AssistantMutedText>
          </XStack>
          {state === 'copied' ? (
            <Paragraph accessibilityLiveRegion="polite" color="$green11" fontSize={13} fontWeight="700">
              {texts.copied}
            </Paragraph>
          ) : null}
          {state === 'manual' && copyText ? (
            <Paragraph color="$color" fontSize={13} selectable>
              {copyText}
            </Paragraph>
          ) : null}
        </YStack>
      ) : null}
    </YStack>
  );
}
