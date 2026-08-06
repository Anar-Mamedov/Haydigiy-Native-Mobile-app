import { useRef, useState } from 'react';
import type { ScrollView as RNScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Package, Star, User } from '@/components/ui/icons';
import { ScrollView, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSelect, SectionCard } from '@/components/ui';

type ReviewFiltersCardProps = {
  star: number;
  onStarChange: (star: number) => void;
  hasPhoto: number;
  onPhotoChange: (value: number) => void;
  size: string;
  onSizeChange: (size: string) => void;
  sizes: string[];
  height: string;
  onHeightChange: (height: string) => void;
  heights: string[];
  heightCounts: Record<string, number>;
  weight: string;
  onWeightChange: (weight: string) => void;
  weights: string[];
  weightCounts: Record<string, number>;
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
};

function Chip({ label, active, onPress, icon }: ChipProps) {
  return (
    <XStack
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      alignItems="center"
      backgroundColor={active ? '$brand' : '$background'}
      borderColor={active ? '$brand' : '$borderColor'}
      borderRadius="$3"
      borderWidth={1}
      gap="$1"
      onPress={onPress}
      paddingHorizontal="$3"
      paddingVertical="$1.5"
      pressStyle={{ opacity: 0.85 }}
    >
      <Paragraph color={active ? 'white' : '$color11'} fontSize={13} fontWeight={active ? '700' : '500'}>
        {label}
      </Paragraph>
      {icon}
    </XStack>
  );
}

const SCROLL_STEP = 150;

type MeasuredFilterCarouselProps = {
  icon: React.ReactNode;
  label: string;
  options: string[];
  counts: Record<string, number>;
  selected: string;
  onSelect: (value: string) => void;
};

/** Labelled, horizontally scrollable filter row with chevron scroll controls. */
function MeasuredFilterCarousel({ icon, label, options, counts, selected, onSelect }: MeasuredFilterCarouselProps) {
  const scrollRef = useRef<RNScrollView>(null);
  const [offset, setOffset] = useState(0);

  const scrollBy = (delta: number) => {
    const next = Math.max(0, offset + delta);
    scrollRef.current?.scrollTo({ x: next, animated: true });
  };

  return (
    <YStack gap="$2">
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" gap="$1.5">
          {icon}
          <Paragraph color="$color11" fontSize={13} fontWeight="600">
            {label}
          </Paragraph>
        </XStack>
        <XStack gap="$1">
          <XStack accessibilityLabel={`${label} geri kaydır`} accessibilityRole="button" hitSlop={6} onPress={() => scrollBy(-SCROLL_STEP)} pressStyle={{ opacity: 0.5 }}>
            <ChevronLeft color="$color10" size={18} />
          </XStack>
          <XStack accessibilityLabel={`${label} ileri kaydır`} accessibilityRole="button" hitSlop={6} onPress={() => scrollBy(SCROLL_STEP)} pressStyle={{ opacity: 0.5 }}>
            <ChevronRight color="$color10" size={18} />
          </XStack>
        </XStack>
      </XStack>
      <ScrollView
        contentContainerStyle={{ gap: 8 }}
        horizontal
        onScroll={(e) => setOffset(e.nativeEvent.contentOffset.x)}
        ref={scrollRef}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {options.map((value) => (
          <Chip
            active={selected === value}
            key={value}
            label={`${value} (${counts[value] ?? 0})`}
            onPress={() => onSelect(selected === value ? '' : value)}
          />
        ))}
      </ScrollView>
    </YStack>
  );
}

const PHOTO_OPTIONS = [
  { label: 'Tümü', value: -1 },
  { label: 'Fotoğraflı', value: 1 },
  { label: 'Fotoğrafsız', value: 0 },
];

/** "Filtreler" card: star, photo, size, height and weight filters. */
export function ReviewFiltersCard(props: ReviewFiltersCardProps) {
  const {
    star,
    onStarChange,
    hasPhoto,
    onPhotoChange,
    size,
    onSizeChange,
    sizes,
    height,
    onHeightChange,
    heights,
    heightCounts,
    weight,
    onWeightChange,
    weights,
    weightCounts,
  } = props;

  return (
    <SectionCard elevated>
      <YStack gap="$3.5">
        <Paragraph color="$color" fontSize={16} fontWeight="700">
          Filtreler
        </Paragraph>

        <YStack gap="$2">
          <Paragraph color="$color11" fontSize={13} fontWeight="600">
            Puan
          </Paragraph>
          <XStack flexWrap="wrap" gap="$2">
            <Chip active={star === 0} label="Tümü" onPress={() => onStarChange(0)} />
            {[5, 4, 3, 2, 1].map((value) => (
              <Chip
                active={star === value}
                icon={<Star color={star === value ? 'white' : '$color10'} fill={star === value ? 'white' : 'transparent'} size={12} />}
                key={value}
                label={String(value)}
                onPress={() => onStarChange(value)}
              />
            ))}
          </XStack>
        </YStack>

        <YStack gap="$2">
          <Paragraph color="$color11" fontSize={13} fontWeight="600">
            Fotoğraf
          </Paragraph>
          <XStack flexWrap="wrap" gap="$2">
            {PHOTO_OPTIONS.map((option) => (
              <Chip
                active={hasPhoto === option.value}
                key={option.value}
                label={option.label}
                onPress={() => onPhotoChange(option.value)}
              />
            ))}
          </XStack>
        </YStack>

        {sizes.length > 0 ? (
          <YStack gap="$2">
            <Paragraph color="$color11" fontSize={13} fontWeight="600">
              Beden
            </Paragraph>
            <AppSelect
              label="Beden"
              onValueChange={(value) => onSizeChange(String(value))}
              options={[{ label: 'Tüm Bedenler', value: '' }, ...sizes.map((s) => ({ label: s, value: s }))]}
              placeholder="Tüm Bedenler"
              value={size}
            />
          </YStack>
        ) : null}

        {heights.length > 0 ? (
          <MeasuredFilterCarousel
            counts={heightCounts}
            icon={<User color="$brand" size={15} />}
            label="Boy"
            onSelect={onHeightChange}
            options={heights}
            selected={height}
          />
        ) : null}

        {weights.length > 0 ? (
          <MeasuredFilterCarousel
            counts={weightCounts}
            icon={<Package color="$brand" size={15} />}
            label="Kilo"
            onSelect={onWeightChange}
            options={weights}
            selected={weight}
          />
        ) : null}
      </YStack>
    </SectionCard>
  );
}
