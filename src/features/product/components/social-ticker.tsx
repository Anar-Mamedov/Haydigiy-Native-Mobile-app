import { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingCart } from '@tamagui/lucide-icons-2';
import { Paragraph, XStack, YStack } from 'tamagui';
import { DANGER_COLOR } from '@/lib/theme/colors';
import { buildSocialTickerMessages } from '../utils/social-ticker';

type SocialTickerProps = {
  cartCount: number;
  favoritesCount: number;
  totalQuantity: number;
};

const TICKER_INTERVAL_MS = 3500;

/** Rotating social-proof message (cart / favourites / low-stock) for a product. */
export function SocialTicker({ cartCount, favoritesCount, totalQuantity }: SocialTickerProps) {
  const messages = useMemo(
    () => buildSocialTickerMessages({ cartCount, favoritesCount, totalQuantity }),
    [cartCount, favoritesCount, totalQuantity],
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    if (messages.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), TICKER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [messages.length]);

  const ticker = messages[index];
  if (!ticker) return null;

  return (
    <XStack alignItems="center" gap="$1.5" minHeight={20}>
      {ticker.icon === 'cart' ? <ShoppingCart color="$brand" size={15} /> : null}
      {ticker.icon === 'heart' ? <Heart color="$red10" fill={DANGER_COLOR} size={15} /> : null}
      {ticker.icon === 'alert' ? <YStack backgroundColor="$yellow10" borderRadius={4} height={8} width={8} /> : null}
      <Paragraph color="$color" flex={1} fontSize={13} fontWeight="600" numberOfLines={1}>
        <Paragraph color="$color" fontSize={13} fontWeight="800">
          {ticker.highlight}
        </Paragraph>
        {ticker.text.slice(ticker.text.indexOf(ticker.highlight) + ticker.highlight.length)}
      </Paragraph>
    </XStack>
  );
}
