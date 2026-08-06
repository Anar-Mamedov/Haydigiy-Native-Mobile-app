import { Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from '@/components/ui/icons';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

type PaginationProps = {
  currentPage: number;
  pageCount: number;
  onChange: (page: number) => void;
};

const ELLIPSIS = '…';

/** Builds a windowed page list: 1 … (n-1) n (n+1) … last. */
function buildPages(current: number, count: number): (number | typeof ELLIPSIS)[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  const pages: (number | typeof ELLIPSIS)[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(count - 1, current + 1);

  if (left > 2) pages.push(ELLIPSIS);
  for (let page = left; page <= right; page += 1) pages.push(page);
  if (right < count - 1) pages.push(ELLIPSIS);
  pages.push(count);

  return pages;
}

function PageCell({
  label,
  active,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  label: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed ? 0.6 : 1 })}
    >
      <XStack
        alignItems="center"
        backgroundColor={active ? '$brand' : '$background'}
        borderColor={active ? '$brand' : '$borderColor'}
        borderRadius="$3"
        borderWidth={1}
        height={34}
        justifyContent="center"
        minWidth={34}
        paddingHorizontal="$2"
      >
        {typeof label === 'string' || typeof label === 'number' ? (
          <Paragraph color={active ? 'white' : '$color'} fontSize={13} fontWeight="600">
            {label}
          </Paragraph>
        ) : (
          label
        )}
      </XStack>
    </Pressable>
  );
}

/**
 * Theme-aware numbered pagination with prev/next and windowed page numbers.
 * Shared primitive so paginated lists don't hand-roll their own controls.
 */
export function Pagination({ currentPage, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = buildPages(currentPage, pageCount);
  const go = (page: number) => {
    if (page >= 1 && page <= pageCount && page !== currentPage) onChange(page);
  };

  return (
    <XStack alignItems="center" gap="$1.5" justifyContent="center">
      <PageCell
        accessibilityLabel="Önceki sayfa"
        disabled={currentPage <= 1}
        label={<ChevronLeft color="$color" size={18} />}
        onPress={() => go(currentPage - 1)}
      />
      {pages.map((page, index) =>
        page === ELLIPSIS ? (
          <PageCell key={`ellipsis-${index}`} label={ELLIPSIS} />
        ) : (
          <PageCell
            accessibilityLabel={`Sayfa ${page}`}
            active={page === currentPage}
            key={page}
            label={page}
            onPress={() => go(page)}
          />
        ),
      )}
      <PageCell
        accessibilityLabel="Sonraki sayfa"
        disabled={currentPage >= pageCount}
        label={<ChevronRight color="$color" size={18} />}
        onPress={() => go(currentPage + 1)}
      />
    </XStack>
  );
}
