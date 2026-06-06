import { Pressable } from 'react-native';
import { Sheet, YStack, XStack, Paragraph, ScrollView } from 'tamagui';
import { X, Check } from '@tamagui/lucide-icons-2';
import { ProductVariant } from '@/types/product.types';

interface SizeSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onSelect: (variant: ProductVariant) => void;
}

export function SizeSelectorSheet({
  open,
  onOpenChange,
  productName,
  variants,
  selectedVariantId,
  onSelect,
}: SizeSelectorSheetProps) {
  const inStockVariants = variants.filter((v) => v.hasStock);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="percent"
      snapPoints={[55]}
      dismissOnSnapToBottom
      modal
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        overflow="hidden"
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <YStack flex={1} marginRight="$4">
            <Paragraph fontSize={15} fontWeight="700" color="$color" numberOfLines={1}>
              Beden Seçin
            </Paragraph>
            <Paragraph fontSize={12} color="$color10" numberOfLines={1}>
              {productName}
            </Paragraph>
          </YStack>
          <Pressable onPress={() => onOpenChange(false)}>
            <X size={20} color="$color10" />
          </Pressable>
        </XStack>

        {/* Content */}
        <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
          <YStack gap="$2" pb="$6">
            {inStockVariants.length > 0 ? (
              inStockVariants.map((v) => {
                const isSelected = selectedVariantId === v.id;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => {
                      onSelect(v);
                      onOpenChange(false);
                    }}
                  >
                    <XStack
                      alignItems="center"
                      justifyContent="space-between"
                      paddingVertical="$3"
                      paddingHorizontal="$4"
                      borderRadius="$3"
                      backgroundColor={isSelected ? '$backgroundHover' : 'transparent'}
                      borderWidth={1}
                      borderColor={isSelected ? '$brand' : 'transparent'}
                    >
                      <Paragraph
                        fontSize={14}
                        fontWeight={isSelected ? '700' : '400'}
                        color={isSelected ? '$brand' : '$color'}
                      >
                        {v.name}
                      </Paragraph>
                      {isSelected ? <Check size={18} color="$brand" /> : null}
                    </XStack>
                  </Pressable>
                );
              })
            ) : (
              <Paragraph fontSize={14} color="$color10" textAlign="center" py="$4">
                Bu ürünün stokta bedeni bulunmamaktadır.
              </Paragraph>
            )}
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
