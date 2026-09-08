import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { MyQuestion } from '@/types/account-activity.types';

type MyQuestionCardProps = {
  question: MyQuestion;
  onProductPress: (slug: string) => void;
};

function StatusBadge({ status }: { status: MyQuestion['status'] }) {
  const isAnswered = status === 'answered';

  return (
    <XStack
      backgroundColor={isAnswered ? '$green3' : '$yellow3'}
      borderRadius="$2"
      paddingHorizontal="$2"
      paddingVertical="$1"
    >
      <Paragraph color={isAnswered ? '$green11' : '$yellow11'} fontSize={11} fontWeight="600">
        {isAnswered ? 'Cevaplandı' : 'Cevap bekliyor'}
      </Paragraph>
    </XStack>
  );
}

/** Kullanıcının bir ürüne sorduğu soru ve varsa mağaza cevabı. */
export function MyQuestionCard({ question, onProductPress }: MyQuestionCardProps) {
  const product = question.product;
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
            <StatusBadge status={question.status} />
          </XStack>

          <XStack alignItems="center" flexWrap="wrap" gap="$2">
            {question.createdAt ? (
              <Paragraph color="$color10" fontSize={12}>
                {question.createdAt}
              </Paragraph>
            ) : null}
            {question.likeCount > 0 ? (
              <Paragraph color="$color10" fontSize={12}>
                {question.likeCount} beğeni
              </Paragraph>
            ) : null}
          </XStack>
        </YStack>
      </XStack>

      <Paragraph color="$color" fontSize={13} lineHeight={18}>
        {question.question}
      </Paragraph>

      {question.reply ? (
        <YStack backgroundColor="$color2" borderLeftColor="$brand" borderLeftWidth={2} borderRadius="$2" gap="$1" padding="$2.5">
          <XStack alignItems="center" flexWrap="wrap" gap="$2">
            <Paragraph color="$brand" fontSize={12} fontWeight="700">
              {question.reply.adminName}
            </Paragraph>
            {question.reply.createdAt ? (
              <Paragraph color="$color10" fontSize={12}>
                {question.reply.createdAt}
              </Paragraph>
            ) : null}
          </XStack>
          <Paragraph color="$color" fontSize={13} lineHeight={18}>
            {question.reply.text}
          </Paragraph>
        </YStack>
      ) : (
        <Paragraph color="$color10" fontSize={12}>
          Sorunuz mağazaya iletildi, cevaplandığında burada görünecek.
        </Paragraph>
      )}
    </YStack>
  );
}
