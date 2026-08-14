import { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronDown } from '@/components/ui/icons';
import { COMPACT_MAX_FONT_SCALE } from '@/lib/theme/font-scale';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onPress: () => void;
  /** Varsayılan "<label> filtresi" etiketini ezmek için (ör. Sırala, Filtrele). */
  accessibilityLabel?: string;
  /** Sağ üst köşede gösterilen sayaç; 0/undefined ise rozet çizilmez. */
  badgeCount?: number;
  /** Etiketin solunda duran ikon. */
  icon?: ReactNode;
  /** Bir liste açmayan çipler (Sırala, Filtrele) için kapatılır. */
  showChevron?: boolean;
}

export const FILTER_PILL_HEIGHT = 34;

/**
 * Ürün listesi filtre çubuğundaki tek çip. Hem bir dropdown açan filtreler hem
 * de bir sheet açan Sırala/Filtrele için kullanılır; fark ikon, rozet ve chevron
 * prop'larıyla kurulur, bileşenin içine dallanma eklenmez.
 */
export function FilterPill({
  accessibilityLabel,
  badgeCount,
  icon,
  isActive,
  isOpen,
  label,
  onPress,
  showChevron = true,
}: FilterPillProps) {
  const highlighted = isActive || isOpen;
  const hasBadge = Boolean(badgeCount && badgeCount > 0);

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? `${label} filtresi`}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen, selected: isActive }}
      onPress={onPress}
    >
      {({ pressed }) => (
        <XStack opacity={pressed ? 0.8 : 1} position="relative">
          <XStack
            alignItems="center"
            backgroundColor="$background"
            borderColor={highlighted ? '$brand' : '$borderColor'}
            borderRadius={FILTER_PILL_HEIGHT / 2}
            borderWidth={1}
            gap={6}
            height={FILTER_PILL_HEIGHT}
            justifyContent="center"
            paddingHorizontal={12}
          >
            {icon}
            <Paragraph
              color={highlighted ? '$brand' : '$color'}
              fontSize={13}
              fontWeight={highlighted ? '700' : '500'}
              maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
              numberOfLines={1}
            >
              {label}
            </Paragraph>
            {showChevron ? (
              <ChevronDown
                size={12}
                color={highlighted ? '$brand' : '$color10'}
                style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
              />
            ) : null}
          </XStack>

          {hasBadge ? (
            <XStack
              alignItems="center"
              backgroundColor="$brand"
              borderRadius={100}
              height={18}
              justifyContent="center"
              minWidth={18}
              paddingHorizontal={4}
              position="absolute"
              right={-4}
              top={-6}
            >
              <Paragraph
                color="white"
                fontSize={10}
                fontWeight="900"
                includeFontPadding={false}
                lineHeight={18}
                maxFontSizeMultiplier={COMPACT_MAX_FONT_SCALE}
                textAlign="center"
              >
                {badgeCount! > 9 ? '9+' : badgeCount}
              </Paragraph>
            </XStack>
          ) : null}
        </XStack>
      )}
    </Pressable>
  );
}
