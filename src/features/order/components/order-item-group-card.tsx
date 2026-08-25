import { ReactNode } from 'react';
import { Image } from 'expo-image';
import { Image as ImagePlaceholderIcon } from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppCheckbox } from '@/components/ui/app-checkbox';
import { OrderItemGroup } from '../utils/order-item-groups';
import { formatOrderPrice } from '../utils/order-status';

const THUMB_SIZE = 64;

type Props = {
  group: OrderItemGroup;
  /** Ekranda o an seçili satır anahtarları — başlık sayacı buradan hesaplanır. */
  selectedIds: string[];
  disabled?: boolean;
  /** Paketin tamamını seçer ya da seçimi kaldırır. */
  onToggleAll: () => void;
  /** Gruba ait seçilebilir satırlar. */
  children: ReactNode;
};

/**
 * İptal ve iade ekranlarında bir paketin (bundle) çevresini çizen kart: paketin adı,
 * görseli, tutarı ve "tamamını seç" kutusu.
 *
 * Paket yalnızca GÖRSEL bir gruptur: içindeki ürünler tek tek seçilebilir, kullanıcı
 * dilerse paketten tek ürünü, dilerse tamamını iptal/iade eder. Normal ürün grupları
 * hiçbir ek çerçeve almadan olduğu gibi geçer.
 */
export function OrderItemGroupCard({
  group,
  selectedIds,
  disabled = false,
  onToggleAll,
  children,
}: Props) {
  if (!group.isBundle || !group.header) return <>{children}</>;

  const { header } = group;
  const total = group.rows.length;
  const selectedCount = group.rows.filter((row) => selectedIds.includes(row.expandedId)).length;
  const allSelected = total > 0 && selectedCount === total;

  return (
    <YStack
      borderColor={selectedCount > 0 ? '$brand' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      overflow="hidden"
    >
      <XStack alignItems="center" backgroundColor="$backgroundHover" gap="$3" padding="$3">
        <YStack
          alignItems="center"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={THUMB_SIZE}
          justifyContent="center"
          overflow="hidden"
          position="relative"
          width={THUMB_SIZE}
        >
          {header.imageUrl ? (
            <Image
              contentFit="contain"
              source={{ uri: header.imageUrl }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={24} />
          )}
          <XStack
            alignItems="center"
            backgroundColor="$brand"
            bottom={0}
            justifyContent="center"
            left={0}
            paddingVertical={2}
            position="absolute"
            right={0}
          >
            <Paragraph color="white" fontSize={9} fontWeight="800">
              PAKET
            </Paragraph>
          </XStack>
        </YStack>

        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={14} fontWeight="700" numberOfLines={2}>
            {header.title}
          </Paragraph>
          <Paragraph color="$color10" fontSize={12}>
            {header.subtitle || `${total} ürün`}
            {header.quantity > 1 ? ` · ${header.quantity} adet` : ''}
          </Paragraph>
          <Paragraph color="$brand" fontSize={14} fontWeight="800">
            {formatOrderPrice(header.price)}
          </Paragraph>
        </YStack>
      </XStack>

      <XStack
        alignItems="center"
        borderTopColor="$borderColor"
        borderTopWidth={1}
        gap="$2"
        justifyContent="space-between"
        paddingHorizontal="$3"
        paddingVertical="$2.5"
      >
        <AppCheckbox
          accessibilityLabel={`${header.title} paketindeki tüm ürünleri seç`}
          checked={allSelected}
          disabled={disabled}
          onChange={onToggleAll}
          size={20}
        >
          <Paragraph color="$color" fontSize={13} fontWeight="600">
            Paketin tamamını seç
          </Paragraph>
        </AppCheckbox>
        <Paragraph color="$color10" fontSize={12} fontWeight="600">
          {selectedCount}/{total} seçildi
        </Paragraph>
      </XStack>

      <YStack gap="$2.5" padding="$3">
        <Paragraph color="$color10" fontSize={11} fontWeight="700">
          Paket içeriği ({total} ürün) — dilediğiniz ürünü tek tek seçebilirsiniz
        </Paragraph>
        <YStack borderLeftColor="$brand" borderLeftWidth={2} gap="$2.5" paddingLeft="$2.5">
          {children}
        </YStack>
      </YStack>
    </YStack>
  );
}
