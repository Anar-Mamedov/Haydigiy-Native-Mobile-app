import { useCallback, useRef } from 'react';
import { ScrollView, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import type { AssistantTexts } from '@/types/assistant.types';
import { useAssistantStore } from '../store/use-assistant-store';
import { AssistantMessageItem } from './assistant-message-item';

const NEAR_BOTTOM_PX = 96;

function TypingIndicator({ label }: { label: string }) {
  return (
    <XStack
      accessibilityLiveRegion="polite"
      alignItems="center"
      alignSelf="flex-start"
      backgroundColor="$color2"
      borderColor="$borderColor"
      borderRadius="$6"
      borderTopLeftRadius="$2"
      borderWidth={1}
      gap="$2"
      paddingHorizontal="$3.5"
      paddingVertical="$2.5"
      testID="assistant-typing"
    >
      <Spinner color="$brand" size="small" />
      <Paragraph color="$color11" fontSize={13}>
        {label}
      </Paragraph>
    </XStack>
  );
}

/**
 * Sohbet listesi. Balonlar gezinmeyle SİLİNMEZ, birikir (kural 17). Yeni mesaj geldiğinde liste
 * her zaman en alta kayar (web `0aae36636`); içerik sonradan büyüdüğünde (görsel yüklendi)
 * yalnız müşteri zaten alttaysa altta kalır, yukarıda okuyorsa yeri bozulmaz.
 */
export function AssistantMessageList({ texts }: { texts: AssistantTexts }) {
  const messages = useAssistantStore((state) => state.messages);
  const busy = useAssistantStore((state) => state.busy);
  const scrollRef = useRef<ScrollView>(null);
  const nearBottom = useRef(true);
  const seenCount = useRef(0);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    nearBottom.current = contentSize.height - contentOffset.y - layoutMeasurement.height < NEAR_BOTTOM_PX;
  }, []);

  const handleContentSizeChange = useCallback(() => {
    const hasNewMessage = messages.length > seenCount.current;
    seenCount.current = messages.length;
    if (hasNewMessage || nearBottom.current) {
      scrollRef.current?.scrollToEnd({ animated: true });
      nearBottom.current = true;
    }
  }, [messages.length]);

  return (
    <YStack flex={1}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        ref={scrollRef}
        scrollEventThrottle={32}
        testID="assistant-message-list"
      >
        <YStack gap="$3" padding="$3" paddingBottom="$4">
          {messages.map((message) => (
            <AssistantMessageItem key={message.key} message={message} texts={texts} />
          ))}
          {busy ? <TypingIndicator label={texts.typing} /> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
