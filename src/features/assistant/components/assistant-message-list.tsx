import { useCallback, useRef, useState } from 'react';
import { ScrollView, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
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
      borderWidth={1}
      gap="$2"
      paddingHorizontal="$3.5"
      paddingVertical="$2.5"
      testID="assistant-typing"
    >
      <Spinner color="$color10" size="small" />
      <Paragraph color="$color11" fontSize={13}>
        {label}
      </Paragraph>
    </XStack>
  );
}

/**
 * Sohbet listesi. Balonlar gezinmeyle SİLİNMEZ, birikir (kural 17). Liste kendiliğinden en alta kayar;
 * müşteri yukarı kaydırdıysa zorla aşağı çekilmez, "Yeni mesaj" göstergesi çıkar.
 */
export function AssistantMessageList({ texts }: { texts: AssistantTexts }) {
  const messages = useAssistantStore((state) => state.messages);
  const busy = useAssistantStore((state) => state.busy);
  const scrollRef = useRef<ScrollView>(null);
  const nearBottom = useRef(true);
  const seenCount = useRef(0);
  const [hasNew, setHasNew] = useState(false);

  const scrollToEnd = useCallback(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
    nearBottom.current = true;
    setHasNew(false);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    nearBottom.current = contentSize.height - contentOffset.y - layoutMeasurement.height < NEAR_BOTTOM_PX;
    if (nearBottom.current) setHasNew(false);
  }, []);

  /** İçerik büyüdüğünde (yeni balon, görsel yüklendi) alttaysa altta kal; değilse göstergeyi aç. */
  const handleContentSizeChange = useCallback(() => {
    if (nearBottom.current) scrollRef.current?.scrollToEnd({ animated: true });
    else if (messages.length > seenCount.current) setHasNew(true);
    seenCount.current = messages.length;
  }, [messages.length]);

  return (
    <YStack flex={1} position="relative">
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
      {hasNew ? (
        <XStack
          bottom="$3"
          justifyContent="center"
          left={0}
          pointerEvents="box-none"
          position="absolute"
          right={0}
        >
          <XStack
            accessibilityRole="button"
            alignItems="center"
            backgroundColor="$color12"
            borderRadius="$10"
            minHeight={MIN_TOUCH_TARGET}
            onPress={scrollToEnd}
            paddingHorizontal="$3.5"
          >
            <Paragraph color="$color1" fontSize={13} fontWeight="700">
              {texts.new_messages}
            </Paragraph>
          </XStack>
        </XStack>
      ) : null}
    </YStack>
  );
}
