import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { STORE_ADVANTAGES, type StoreAdvantage } from '../data/store-advantages';

function AdvantageItem({ advantage }: { advantage: StoreAdvantage }) {
  const Icon = advantage.icon;

  return (
    <XStack
      accessibilityLabel={`${advantage.caption}: ${advantage.title}`}
      accessible
      alignItems="center"
      gap="$3"
      paddingVertical="$2"
      width="50%"
    >
      <YStack
        alignItems="center"
        backgroundColor="$noticeBackground"
        borderRadius={100}
        height={36}
        justifyContent="center"
        width={36}
      >
        <Icon color="$brand" size={20} />
      </YStack>
      <YStack flex={1} paddingRight="$2">
        <Paragraph color="$color10" fontSize={11} letterSpacing={0.5} textTransform="uppercase">
          {advantage.caption}
        </Paragraph>
        <Paragraph color="$color" fontSize={14} fontWeight="600">
          {advantage.title}
        </Paragraph>
      </YStack>
    </XStack>
  );
}

/**
 * The web footer's advantages band (24 saatte kargo, iade, kapıda ödeme, güvenli ödeme) as a
 * 2x2 grid, like the mobile web.
 */
export function StoreAdvantagesBand() {
  return (
    <XStack
      accessibilityLabel="Avantajlarımız"
      borderBottomWidth={1}
      borderColor="$borderColor"
      borderTopWidth={1}
      flexWrap="wrap"
      paddingVertical="$3"
      testID="store-advantages-band"
    >
      {STORE_ADVANTAGES.map((advantage) => (
        <AdvantageItem advantage={advantage} key={advantage.title} />
      ))}
    </XStack>
  );
}
