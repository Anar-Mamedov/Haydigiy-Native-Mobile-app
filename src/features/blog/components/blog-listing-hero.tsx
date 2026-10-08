import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { BLOG_TEXTS } from '../constants/blog-ui';

type BlogListingHeroProps = {
  /** "Blog" ya da seçili kategorinin adı (web `BlogListing` başlığı). */
  title: string;
};

/** Liste ekranının üst başlığı: slogan, büyük başlık ve kısa açıklama. */
export function BlogListingHero({ title }: BlogListingHeroProps) {
  return (
    <YStack
      alignItems="center"
      backgroundColor="$color2"
      gap="$4"
      paddingBottom="$7"
      paddingHorizontal="$5"
      paddingTop="$7"
    >
      <Paragraph color="$brand" fontSize={10} fontWeight="700" letterSpacing={3.4} textAlign="center" textTransform="uppercase">
        {BLOG_TEXTS.eyebrow}
      </Paragraph>
      <Paragraph accessibilityRole="header" color="$color" fontSize={48} fontWeight="700" letterSpacing={-1.5} lineHeight={52} textAlign="center">
        {title}
      </Paragraph>
      <Paragraph color="$color10" fontSize={15} lineHeight={23} maxWidth={420} textAlign="center">
        {BLOG_TEXTS.listingDescription}
      </Paragraph>
    </YStack>
  );
}
