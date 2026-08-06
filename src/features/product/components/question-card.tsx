import { useState } from 'react';
import { Calendar, Heart, MessageCircle } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui/section-card';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { ProductQAItem } from '../api/product-questions.mapper';
import { formatDateTR } from '../utils/format-date-tr';

type QuestionCardProps = {
  item: ProductQAItem;
};

/** A single Q&A entry mirroring the web mobile question card. */
export function QuestionCard({ item }: QuestionCardProps) {
  const [liked, setLiked] = useState(false);
  const likeCount = item.likeCount + (liked ? 1 : 0);

  return (
    <SectionCard elevated>
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2" justifyContent="space-between">
          <XStack alignItems="center" flex={1} gap="$1.5">
            <MessageCircle color="$brand" size={15} />
            <Paragraph color="$color" fontSize={13} fontWeight="600" numberOfLines={1}>
              {item.userName || 'Anonim'}
            </Paragraph>
            <Paragraph color="$color9" fontSize={11}>
              #{item.id}
            </Paragraph>
          </XStack>
          <XStack alignItems="center" gap="$3">
            <XStack alignItems="center" gap="$1">
              <Calendar color="$color9" size={12} />
              <Paragraph color="$color9" fontSize={11}>
                {formatDateTR(item.createdAt)}
              </Paragraph>
            </XStack>
            <XStack
              accessibilityLabel="Bu soruyu beğen"
              accessibilityRole="button"
              alignItems="center"
              gap="$1"
              onPress={() => setLiked(true)}
              pressStyle={{ opacity: 0.6 }}
            >
              <Heart color={liked ? '$brand' : '$color9'} fill={liked ? BRAND_COLOR : 'transparent'} size={14} />
              <Paragraph color={liked ? '$brand' : '$color9'} fontSize={11}>
                ({likeCount})
              </Paragraph>
            </XStack>
          </XStack>
        </XStack>

        {item.tag ? (
          <XStack alignSelf="flex-start" backgroundColor="$orange3" borderRadius="$2" paddingHorizontal="$2" paddingVertical="$1">
            <Paragraph color="$brand" fontSize={11} fontWeight="600">
              {item.tag}
            </Paragraph>
          </XStack>
        ) : null}

        <Paragraph color="$color" fontSize={14} lineHeight={20}>
          {item.question}
        </Paragraph>

        {item.reply ? (
          <YStack
            backgroundColor="$backgroundHover"
            borderLeftColor="$brand"
            borderLeftWidth={4}
            borderRadius="$3"
            gap="$1"
            padding="$3"
          >
            <XStack alignItems="center" gap="$2">
              <Paragraph color="$brand" fontSize={12} fontWeight="700">
                {item.reply.adminName || 'Satıcı'}
              </Paragraph>
              {item.reply.createdAt ? (
                <Paragraph color="$color9" fontSize={11}>
                  {formatDateTR(item.reply.createdAt)}
                </Paragraph>
              ) : null}
            </XStack>
            <Paragraph color="$color11" fontSize={13} lineHeight={19}>
              {item.reply.text}
            </Paragraph>
          </YStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
