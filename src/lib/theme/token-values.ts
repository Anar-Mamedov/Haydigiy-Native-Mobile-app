import { defaultConfig } from '@tamagui/config/v5';

function readToken(tokenSet: Record<string, number>, tokenName: string) {
  const plainTokenName = tokenName.replace('$', '');
  return Number(tokenSet[tokenName] ?? tokenSet[plainTokenName]);
}

export const tokenValues = {
  cartItemImageRadius: readToken(defaultConfig.tokens.radius as Record<string, number>, '$6'),
  cartItemImageSize: readToken(defaultConfig.tokens.size as Record<string, number>, '$10'),
  productCardImageHeight: readToken(defaultConfig.tokens.size as Record<string, number>, '$12'),
  productImageRadius: readToken(defaultConfig.tokens.radius as Record<string, number>, '$7'),
  sectionListPaddingBottom: readToken(defaultConfig.tokens.space as Record<string, number>, '$4'),
};
