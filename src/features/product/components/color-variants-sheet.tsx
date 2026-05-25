import { Sheet, YStack, XStack, Paragraph, ScrollView } from 'tamagui';
import { X } from '@tamagui/lucide-icons-2';
import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Product } from '@/types/product.types';

type ColorVariantOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
};

interface ColorVariantsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  selectedVariantId: string | null;
  onSelectVariant: (variant: ColorVariantOption) => void;
}

function normalizeColorVariant(product: Product, color: NonNullable<Product['otherColors']>[number]): ColorVariantOption {
  const isCurrentProduct = String(color.id) === String(product.id);

  return {
    id: String(color.id),
    name: color.name || (isCurrentProduct ? product.title : ''),
    slug: color.slug || (isCurrentProduct ? product.slug : ''),
    imageUrl: color.imageUrl || (isCurrentProduct ? product.imageUrl : ''),
    price: color.price || (isCurrentProduct ? product.price : 0),
  };
}

function getColorVariantOptions(product: Product): ColorVariantOption[] {
  return (product.otherColors ?? []).map((color) => normalizeColorVariant(product, color));
}

export function ColorVariantsSheet({
  open,
  onOpenChange,
  product,
  selectedVariantId,
  onSelectVariant,
}: ColorVariantsSheetProps) {
  if (!product) return null;

  const colorOptions = getColorVariantOptions(product);
  const activeId = selectedVariantId || product.id;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="fit"
      dismissOnSnapToBottom
      dismissOnOverlayPress
      modal
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius={12}
        borderTopRightRadius={12}
        overflow="hidden"
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingVertical={18}
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Paragraph fontSize={18} fontWeight="700" color="$color">
            Farklı Renk Seçenekleri ({colorOptions.length})
          </Paragraph>
          <Pressable
            accessibilityLabel="Renk seçeneklerini kapat"
            accessibilityRole="button"
            onPress={() => onOpenChange(false)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X size={28} color="$color" />
          </Pressable>
        </XStack>

        {/* Horizontal Scrollable Color Option Thumbnails */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 12,
            paddingBottom: 24,
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
          style={{
            maxHeight: 138,
          }}
        >
          {colorOptions.map((color) => {
            const isSelected = String(color.id) === String(activeId);
            return (
              <Pressable
                accessibilityLabel={`${color.name || 'Renk'} seçeneğini seç`}
                accessibilityRole="button"
                key={color.id}
                onPress={() => {
                  onSelectVariant(color);
                  onOpenChange(false);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <YStack
                  borderWidth={2}
                  borderColor={isSelected ? '$brand' : '$borderColor'}
                  borderRadius={6}
                  overflow="hidden"
                  backgroundColor="$background"
                  width={64}
                  height={90}
                  position="relative"
                >
                  {color.imageUrl ? (
                    <Image
                      contentFit="contain"
                      source={{ uri: color.imageUrl }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  ) : null}
                </YStack>
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
