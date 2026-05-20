import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { 
  Anchor, 
  Button, 
  Card, 
  H1, 
  H3, 
  Paragraph, 
  XStack, 
  YStack, 
  Theme,
  SizableText
} from 'tamagui';
import { Sparkles, Moon, Sun, ArrowRight, Check } from '@tamagui/lucide-icons-2';
import '../../tamagui.config';

export default function Index() {
  const [counter, setCounter] = useState(0);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark' | null>(null);
  
  const systemTheme = useColorScheme();
  const activeTheme = (localTheme || (systemTheme === 'dark' ? 'dark' : 'light')) as 'light' | 'dark';

  return (
    <Theme name={activeTheme}>
      <YStack 
        flex={1} 
        alignItems="center" 
        justifyContent="center" 
        backgroundColor="$background" 
        padding="$4" 
        gap="$4"
      >
        <YStack gap="$2" alignItems="center">
          <XStack alignItems="center" gap="$2">
            <Sparkles size={28} color="$color" />
            <H1 textAlign="center" color="$color">HaydiGiy</H1>
          </XStack>
          <Paragraph textAlign="center" theme={"alt1" as any} size="$4">
            Tamagui is now fully configured!
          </Paragraph>
        </YStack>

        <Card 
          elevation={4} 
          size="$4" 
          borderWidth={1}
          borderColor="$borderColor"
          width="100%" 
          maxWidth={350} 
          padding="$4"
          {...{ animation: 'bouncy' }}
          hoverStyle={{ scale: 0.98 }}
          pressStyle={{ scale: 0.95 }}
        >
          <Card.Header>
            <H3>Ready to Build</H3>
            <Paragraph theme={"alt2" as any}>React Native + Web Ready</Paragraph>
          </Card.Header>
          
          <YStack paddingVertical="$4" gap="$2">
            <XStack alignItems="center" gap="$2">
              <Check size={18} color="$green10" />
              <SizableText size="$3">Expo SDK 55 + React 19</SizableText>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <Check size={18} color="$green10" />
              <SizableText size="$3">CSS Extraction for Web</SizableText>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <Check size={18} color="$green10" />
              <SizableText size="$3">Light & Dark Mode Support</SizableText>
            </XStack>
          </YStack>

          <Card.Footer>
            <XStack flex={1} justifyContent="space-between" alignItems="center">
              <Button 
                size="$3" 
                theme={"active" as any} 
                iconAfter={ArrowRight}
                onPress={() => setCounter(c => c + 1)}
              >
                {`Taps: ${counter}`}
              </Button>
            </XStack>
          </Card.Footer>
        </Card>

        <XStack gap="$2" marginTop="$4">
          <Button 
            size="$3" 
            circular 
            icon={Sun} 
            backgroundColor={activeTheme === 'light' ? '$backgroundActive' : '$background'}
            onPress={() => setLocalTheme('light')} 
          />
          <Button 
            size="$3" 
            circular 
            icon={Moon} 
            backgroundColor={activeTheme === 'dark' ? '$backgroundActive' : '$background'}
            onPress={() => setLocalTheme('dark')} 
          />
        </XStack>

        <Anchor 
          href="https://tamagui.dev" 
          target="_blank" 
          color="$color8" 
          hoverStyle={{ color: '$color' }}
          marginTop="$2"
        >
          Learn more at tamagui.dev
        </Anchor>
      </YStack>
    </Theme>
  );
}
