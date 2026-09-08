import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Star } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { WARNING_COLOR } from '@/lib/theme/colors';
import { MyReviewEntry } from '@/types/account-activity.types';

type MyReviewCardProps = {
  review: MyReviewEntry;
  onProductPress: (slug: string) => void;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <XStack accessibilityLabel={`${rating} yıldız`} alignItems="center" gap="$1">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star color={WARNING_COLOR} fill={value <= Math.round(rating) ? WARNING_COLOR : 'transparent'} key={value} size={14} />
      ))}
    </XStack>
  );
}

function StatusBadge({ status }: { status: MyReviewEntry['status'] }) {
  const isApproved = status === 'approved';

  return (
    <XStack
      backgroundColor={isApproved ? '$green3' : '$yellow3'}
      borderRadius="$2"
      paddingHorizontal="$2"
      paddingVertical="$1"
    >
      <Paragraph color={isApproved ? '$green11' : '$yellow11'} fontSize={11} fontWeight="600">
        {isApproved ? 'Yayında' : 'Onay bekliyor'}
      </Paragraph>
    </XStack>
  );
}

/** Beden/boy/kilo yalnızca kullanıcı girdiyse gelir; hiçbiri yoksa satır çizilmez. */
function buildBodyInfo(review: MyReviewEntry): string {
  const parts: string[] = [];
  if (review.size) parts.push(`Beden: ${review.size}`);
  if (review.height !== null) parts.push(`Boy: ${review.height} cm`);
  if (review.weight !== null) parts.push(`Kilo: ${review.weight} kg`);
  return parts.join(' · ');
}

/** Kullanıcının kendi yorumu: puan, metin, varsa fotoğraf ve onay durumu. */
export function MyReviewCard({ review, onProductPress }: MyReviewCardProps) {
  const product = review.product;
  const bodyInfo = buildBodyInfo(review);
  const canOpenProduct = Boolean(product?.slug);

  return (
    <YStack backgroundColor="$background" borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$3" padding="$3">
      <XStack gap="$3">
        <Pressable
          accessibilityLabel={product?.name || 'Ürün'}
          accessibilityRole="imagebutton"
          accessibilityState={{ disabled: !canOpenProduct }}
          disabled={!canOpenProduct}
          onPress={() => product?.slug && onProductPress(product.slug)}
          style={({ pressed }) => ({ opacity: pressed && canOpenProduct ? 0.8 : 1 })}
        >
          <YStack backgroundColor="$color3" borderRadius={6} height={90} overflow="hidden" width={72}>
            {product?.image ? <Image contentFit="cover" source={{ uri: product.image }} style={{ width: 72, height: 90 }} /> : null}
          </YStack>
        </Pressable>

        <YStack flex={1} gap="$1.5" minWidth={0}>
          <XStack alignItems="flex-start" gap="$2" justifyContent="space-between">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canOpenProduct }}
              disabled={!canOpenProduct}
              onPress={() => product?.slug && onProductPress(product.slug)}
              style={({ pressed }) => ({ flex: 1, opacity: pressed && canOpenProduct ? 0.7 : 1 })}
            >
              <Paragraph color={canOpenProduct ? '$color' : '$color10'} fontSize={13} fontWeight="600" lineHeight={17} numberOfLines={2}>
                {product?.name || 'Ürün artık yayında değil'}
              </Paragraph>
            </Pressable>
            <StatusBadge status={review.status} />
          </XStack>

          <XStack alignItems="center" flexWrap="wrap" gap="$2">
            <StarRating rating={review.rating} />
            {review.createdAt ? (
              <Paragraph color="$color10" fontSize={12}>
                {review.createdAt}
              </Paragraph>
            ) : null}
            {review.likeCount > 0 ? (
              <Paragraph color="$color10" fontSize={12}>
                {review.likeCount} beğeni
              </Paragraph>
            ) : null}
            {review.orderId !== null ? (
              <Paragraph color="$color10" fontSize={12}>
                Sipariş No: {review.orderId}
              </Paragraph>
            ) : null}
          </XStack>

          {bodyInfo ? (
            <Paragraph color="$color10" fontSize={12}>
              {bodyInfo}
            </Paragraph>
          ) : null}
        </YStack>
      </XStack>

      {review.comment ? (
        <Paragraph color="$color" fontSize={13} lineHeight={18}>
          {review.comment}
        </Paragraph>
      ) : null}

      {review.thumbnail ? (
        <YStack backgroundColor="$color3" borderRadius={6} height={64} overflow="hidden" width={64}>
          <Image contentFit="cover" source={{ uri: review.thumbnail }} style={{ width: 64, height: 64 }} />
        </YStack>
      ) : null}
    </YStack>
  );
}
