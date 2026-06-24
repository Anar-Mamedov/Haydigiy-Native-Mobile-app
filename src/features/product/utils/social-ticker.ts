export type SocialTickerIcon = 'cart' | 'heart' | 'alert';

export type SocialTickerMessage = {
  text: string;
  highlight: string;
  icon: SocialTickerIcon;
};

/** Formats a social count: 1000+ becomes e.g. "2,6B" (mirrors the web). */
export function formatSocialCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',')}B` : String(n);
}

/**
 * Builds the rotating social-proof messages shown on the product card, mirroring
 * the web reviews page: cart count, favourites count and low-stock warning.
 */
export function buildSocialTickerMessages(input: {
  cartCount: number;
  favoritesCount: number;
  totalQuantity: number;
}): SocialTickerMessage[] {
  const messages: SocialTickerMessage[] = [];

  if (input.cartCount > 0) {
    const highlight = formatSocialCount(input.cartCount);
    messages.push({ text: `${highlight} kişinin sepetinde, tükenmeden al!`, highlight, icon: 'cart' });
  }
  if (input.favoritesCount > 0) {
    const highlight = formatSocialCount(input.favoritesCount);
    messages.push({ text: `Sevilen ürün! ${highlight} kişi favoriledi!`, highlight, icon: 'heart' });
  }
  if (input.totalQuantity > 0 && input.totalQuantity <= 5) {
    messages.push({
      text: `Son ${input.totalQuantity} adet kaldı, tükenmeden al!`,
      highlight: String(input.totalQuantity),
      icon: 'alert',
    });
  }

  return messages;
}
