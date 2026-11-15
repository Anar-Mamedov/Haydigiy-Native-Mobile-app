import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { IconButton } from '@/components/ui/icon-button';
import { X } from '@/components/ui/icons';
import { SheetBottomCover } from '@/components/ui/sheet-bottom-cover';
import { useFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { GIFT_OPTIONAL_NOTE } from '@/features/cart/constants/gift-texts';

const MIN_BOTTOM_PADDING = 16;

type CartCampaignGiftTermsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Kampanya adı; şartların başlığı. */
  heading: string;
  /** Backend'in yazdığı şart cümleleri, olduğu gibi. */
  conditions: string[];
};

/**
 * Kampanya bandındaki hediye sayfasının "Kampanya şartları" yüzeyi (web'deki ⓘ popover'ının
 * karşılığı): başlık, şart maddeleri ve hediyenin isteğe bağlı olduğu notu. Dışarı dokununca ya da
 * kapat düğmesiyle kapanır.
 */
export function CartCampaignGiftTermsSheet({
  open,
  onOpenChange,
  heading,
  conditions,
}: CartCampaignGiftTermsSheetProps) {
  const insets = useSafeAreaInsets();
  const maxHeight = useFitSheetMaxHeight();

  return (
    <Sheet dismissOnOverlayPress modal onOpenChange={onOpenChange} open={open} snapPointsMode="fit">
      <AppSheetOverlay />
      <Sheet.Frame
        adjustPaddingForOffscreenContent
        backgroundColor="$background"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
        maxHeight={maxHeight}
        overflow="visible"
        testID="cart-campaign-gift-terms-sheet"
      >
        <SheetBottomCover testID="cart-campaign-gift-terms-bottom-cover" />

        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingLeft="$4"
          paddingRight="$2"
          paddingVertical="$1"
        >
          <Paragraph accessibilityRole="header" color="$color" fontSize={17} fontWeight="800">
            Kampanya şartları
          </Paragraph>
          <IconButton accessibilityLabel="Kapat" onPress={() => onOpenChange(false)}>
            <X color="$color" size={22} />
          </IconButton>
        </XStack>

        <ScrollView
          alwaysBounceVertical={false}
          bounces={false}
          contentContainerStyle={{
            gap: 8,
            padding: 16,
            paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_PADDING),
          }}
          overScrollMode="never"
        >
          <Paragraph color="$color" fontSize={14} fontWeight="700" lineHeight={20}>
            {heading}
          </Paragraph>
          {conditions.length > 0 ? (
            <YStack gap="$1">
              {conditions.map((condition, index) => (
                <Paragraph color="$color10" fontSize={14} key={`${index}-${condition}`} lineHeight={20}>
                  {`• ${condition}`}
                </Paragraph>
              ))}
            </YStack>
          ) : null}
          <Paragraph color="$red10" fontSize={14} lineHeight={20}>
            {GIFT_OPTIONAL_NOTE}
          </Paragraph>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
