import { Card, styled } from 'tamagui';

export const SectionCard = styled(Card, {
  name: 'SectionCard',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderRadius: '$7',
  borderWidth: 1,
  padding: '$4',

  variants: {
    /**
     * Trendyol-style elevated surface: a white card that sits above a tinted page
     * background. The hairline border defines the card on Android (where iOS shadow
     * props don't render), while the shadow adds depth on iOS.
     */
    elevated: {
      true: {
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
    },
  } as const,
});
