import React from 'react';
import { Image } from 'expo-image';
import { Star, Camera, ChevronDown } from '@/components/ui/icons';
import { XStack, YStack, Button, useThemeName } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ScrollView, Dimensions, Pressable } from 'react-native';
import { ProductReview } from '@/types/product.types';

interface ProductReviewsSectionProps {
  reviews?: ProductReview[];
  averageRating: number;
  onReviewsPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.82;

export function ProductReviewsSection({
  reviews = [],
  averageRating,
  onReviewsPress,
}: ProductReviewsSectionProps) {
  const themeName = useThemeName();
  const isDark = themeName === 'dark' || themeName.includes('dark');

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

  const hasReviews = reviews && reviews.length > 0;

  return (
    <YStack gap="$3.5" padding="$4" backgroundColor="$background" borderTopWidth={8} borderTopColor="$color3">
      {/* Title */}
      <Paragraph fontSize={15} fontWeight="700" color="$color">
        Ürün Değerlendirmeleri
      </Paragraph>

      {!hasReviews ? (
        /* Yellow empty state warning banner */
        <XStack
          backgroundColor="#FFF9EB"
          borderRadius={8}
          paddingHorizontal="$5"
          paddingVertical="$4"
          alignItems="center"
          justifyContent="center"
          gap="$4"
          height={78}
        >
          <XStack
            backgroundColor="#FACC15"
            borderRadius={20}
            width={28}
            height={28}
            alignItems="center"
            justifyContent="center"
          >
            <Star size={14} color="white" fill="white" />
          </XStack>
          <Paragraph fontWeight="700" fontSize={14} color="#854D0E">
            Henüz Yorum Yazılmamış.
          </Paragraph>
        </XStack>
      ) : (
        <>
          {/* Average Rating Row */}
          <Pressable onPress={onReviewsPress}>
            <XStack alignItems="center" gap="$3" paddingBottom="$3" borderBottomWidth={1} borderBottomColor="$borderColor">
              <Paragraph fontSize={28} fontWeight="900" color="$color">
                {averageRating.toFixed(1)}
              </Paragraph>
              
              <YStack gap="$0.5">
                <XStack gap="$0.5">
                  {Array.from({ length: 5 }).map((_, index) => {
                     const starIndex = index + 1;
                     const isFull = starIndex <= Math.floor(averageRating);
                     const isHalf = !isFull && starIndex === Math.floor(averageRating) + 1 && (averageRating % 1 >= 0.5);
                     return (
                       <Star
                         key={index}
                         size={14}
                         fill={isFull || isHalf ? '#f5a623' : 'transparent'}
                         color={isFull || isHalf ? '#f5a623' : '#D1D5DB'}
                       />
                     );
                  })}
                </XStack>
                <XStack alignItems="center" gap="$1">
                  <Paragraph fontSize={11} color="$color10" style={{ textDecorationLine: 'underline' }}>
                    ({reviews.length} Değerlendirme)
                  </Paragraph>
                  <Camera size={12} color="$color10" />
                </XStack>
              </YStack>
            </XStack>
          </Pressable>

          {/* Horizontal Swiper Reviews List */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
          >
            {reviews.map((review) => (
              <YStack
                key={review.id}
                width={cardWidth}
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={10}
                backgroundColor={isDark ? '#1F2937' : 'white'}
                padding="$4"
                minHeight={140}
                justifyContent="space-between"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.05}
                shadowRadius={3}
                elevation={1}
              >
                <YStack gap="$2" flex={1}>
                  {/* Rating Stars */}
                  <XStack gap="$0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={12}
                        fill={index < review.rating ? '#f5a623' : 'transparent'}
                        color={index < review.rating ? '#f5a623' : '#D1D5DB'}
                      />
                    ))}
                  </XStack>

                  {/* Comment Text clamped to 5 lines */}
                  <Paragraph fontSize={13} color="$color11" lineHeight={18} numberOfLines={5}>
                    {review.comment}
                  </Paragraph>

                  {review.photo ? (
                    <Pressable
                      accessibilityLabel="Degerlendirme fotografini ac"
                      accessibilityRole="button"
                      disabled={!onReviewsPress}
                      onPress={onReviewsPress}
                    >
                      <YStack
                        borderColor="$borderColor"
                        borderRadius={8}
                        borderWidth={1}
                        height={64}
                        overflow="hidden"
                        width={64}
                      >
                        <Image
                          contentFit="cover"
                          source={{ uri: review.photo }}
                          style={{ height: '100%', width: '100%' }}
                          testID={`product-review-photo-${review.id}`}
                        />
                      </YStack>
                    </Pressable>
                  ) : null}
                </YStack>

                {/* Card Footer Metadata */}
                <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                  <Paragraph fontSize={11} color="$color10" fontWeight="500">
                    {review.userName} {review.userSurname ? `${review.userSurname[0]}.` : ''}
                  </Paragraph>
                  <Paragraph fontSize={11} color="$color10">
                    {formatDateTR(review.createdAt)}
                  </Paragraph>
                </XStack>
              </YStack>
            ))}
          </ScrollView>

          {/* Expand/See All Button */}
          {onReviewsPress && (
            <Button
              backgroundColor="#f3f4f6"
              borderColor="transparent"
              borderWidth={0}
              borderRadius={22}
              height={44}
              onPress={onReviewsPress}
              pressStyle={{ backgroundColor: '#e5e7eb' }}
              marginTop="$2"
            >
              <XStack alignItems="center" gap="$1">
                <Paragraph fontSize={14} fontWeight="500" color="#1f2937">
                  TÜM YORUMLARI GÖSTER
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
