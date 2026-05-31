import React, { useState, useEffect } from 'react';
import { X } from '@tamagui/lucide-icons-2';
import { Button, XStack, YStack, Paragraph } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

export function TopPromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  
  // Starting state: 7 days, 1 hour, 49 minutes, 0 seconds
  const [timeLeft, setTimeLeft] = useState(
    7 * 24 * 3600 + 1 * 3600 + 49 * 60
  );

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!isVisible || timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (24 * 3600));
  const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  const TimerBox = ({ value, label }: { value: string; label: string }) => (
    <YStack alignItems="center" gap={1}>
      <XStack
        backgroundColor="rgba(0, 0, 0, 0.4)"
        borderRadius={4}
        paddingHorizontal={6}
        paddingVertical={3}
        minWidth={28}
        alignItems="center"
        justifyContent="center"
      >
        <Paragraph color="white" fontSize={11} fontWeight="800" fontFamily="$body">
          {value}
        </Paragraph>
      </XStack>
      <Paragraph color="white" fontSize={7} fontWeight="700">
        {label}
      </Paragraph>
    </YStack>
  );

  return (
    <LinearGradient
      colors={['#e65c00', '#f9d423']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        width: '100%',
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        zIndex: 110,
      }}
    >
      {/* Title */}
      <Paragraph color="white" fontSize={10} fontWeight="900" letterSpacing={0.2} flexShrink={0}>
        BAYRAM ŞENLİĞİ 🎉
      </Paragraph>

      {/* Timer */}
      <XStack gap={4} alignItems="center">
        <TimerBox value={pad(days)} label="GÜN" />
        <Paragraph color="white" fontSize={10} fontWeight="800" marginTop={-8}>:</Paragraph>
        <TimerBox value={pad(hours)} label="SAAT" />
        <Paragraph color="white" fontSize={10} fontWeight="800" marginTop={-8}>:</Paragraph>
        <TimerBox value={pad(minutes)} label="DAK" />
        <Paragraph color="white" fontSize={10} fontWeight="800" marginTop={-8}>:</Paragraph>
        <TimerBox value={pad(seconds)} label="SAN" />
      </XStack>

      {/* Campaign Badge & Close button */}
      <XStack alignItems="center" gap={6} flexShrink={0}>
        <XStack
          borderColor="rgba(255, 255, 255, 0.6)"
          borderWidth={1}
          borderRadius={20}
          paddingHorizontal={8}
          paddingVertical={4}
          backgroundColor="rgba(139, 69, 19, 0.3)"
          alignItems="center"
          justifyContent="center"
        >
          <Paragraph color="white" fontSize={8} fontWeight="800">
            1500 TL ÜZERİ KARGO BEDAVA
          </Paragraph>
        </XStack>

        <Button
          backgroundColor="transparent"
          chromeless
          circular
          icon={<X size={14} color="white" />}
          onPress={() => setIsVisible(false)}
          padding={0}
          size="$1.5"
          pressStyle={{ opacity: 0.6 }}
        />
      </XStack>
    </LinearGradient>
  );
}
