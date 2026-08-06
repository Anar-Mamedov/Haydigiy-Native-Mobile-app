import React from 'react';
import { Heart, ChevronDown } from '@/components/ui/icons';
import { XStack, YStack, Button } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Pressable } from 'react-native';
import { ProductQuestion } from '@/types/product.types';

interface ProductQuestionsSectionProps {
  questions?: ProductQuestion[];
  onQuestionsPress?: () => void;
}

export function ProductQuestionsSection({
  questions = [],
  onQuestionsPress,
}: ProductQuestionsSectionProps) {
  // Format date to TR locale
  const formatDateTR = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const formattedDateStr = dateStr.includes(' ') && !dateStr.includes('T')
        ? dateStr.replace(' ', 'T')
        : dateStr;
      const date = new Date(formattedDateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const hasQuestions = questions && questions.length > 0;
  const displayQuestions = questions.slice(0, 3);

  return (
    <YStack gap="$4" padding="$4" backgroundColor="$background" borderTopWidth={8} borderTopColor="$color3">
      {/* Title */}
      <Paragraph fontSize={15} fontWeight="700" color="$color">
        Soru & Cevap
      </Paragraph>

      {!hasQuestions ? (
        <YStack gap="$3" alignItems="center" paddingVertical="$4">
          <Paragraph color="$color10" fontSize={13} textAlign="center">
            Bu ürün ile ilgili henüz soru sorulmadı.
          </Paragraph>
          {onQuestionsPress && (
            <Button
              backgroundColor="#f3f4f6"
              borderColor="transparent"
              borderWidth={0}
              borderRadius={8}
              height={40}
              onPress={onQuestionsPress}
              pressStyle={{ backgroundColor: '#e5e7eb' }}
              paddingHorizontal="$6"
            >
              <Paragraph fontSize={13} fontWeight="500" color="#1f2937">
                İLK SORUYU SEN SOR
              </Paragraph>
            </Button>
          )}
        </YStack>
      ) : (
        <>
          {/* Questions list */}
          <YStack gap="$4">
            {displayQuestions.map((q, idx) => {
              const isLast = idx === displayQuestions.length - 1;
              return (
                <YStack
                  key={q.id}
                  gap="$2.5"
                  paddingBottom={isLast ? 0 : "$3.5"}
                  borderBottomWidth={isLast ? 0 : 1}
                  borderBottomColor="$borderColor"
                >
                  {/* Question */}
                  <YStack gap="$1">
                    <Paragraph fontSize={13} color="$color" fontWeight="700">
                      Soru: {q.question}
                    </Paragraph>
                    
                    {/* Reply */}
                    {q.reply && (
                      <Paragraph fontSize={13} color="$color11" lineHeight={18} marginTop="$2">
                        Cevap: {q.reply}
                      </Paragraph>
                    )}
                  </YStack>

                  {/* Question Metadata & Like Action Row */}
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$1.5">
                      <Paragraph fontSize={11} color="$color10">
                        {q.userName}
                      </Paragraph>
                      <Paragraph fontSize={11} color="$color10">
                        |
                      </Paragraph>
                      <Paragraph fontSize={11} color="$color10">
                        {formatDateTR(q.createdAt)}
                      </Paragraph>
                    </XStack>

                    <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Heart size={12} color="$color10" style={{ marginRight: 4 }} />
                      <Paragraph fontSize={11} color="$color10" fontWeight="500">
                        Soruyu Beğen (0)
                      </Paragraph>
                    </Pressable>
                  </XStack>
                </YStack>
              );
            })}
          </YStack>

          {/* See All Questions Button */}
          {onQuestionsPress && questions.length > 0 && (
            <Button
              backgroundColor="#f3f4f6"
              borderColor="transparent"
              borderWidth={0}
              borderRadius={22}
              height={44}
              onPress={onQuestionsPress}
              pressStyle={{ backgroundColor: '#e5e7eb' }}
              marginTop="$2"
            >
              <XStack alignItems="center" gap="$1">
                <Paragraph fontSize={14} fontWeight="500" color="#1f2937">
                  TÜM SORULARI GÖSTER
                </Paragraph>
                <ChevronDown size={16} color="#1f2937" />
              </XStack>
            </Button>
          )}
        </>
      )}
    </YStack>
  );
}
