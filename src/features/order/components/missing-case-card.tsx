import { Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Button, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image as ImagePlaceholderIcon, Truck } from '@/components/ui/icons';
import { MissingCase, MissingCaseDelivery, MissingCaseLine } from '@/types/order.types';
import { getCustomerTrackingCode } from '../utils/cargo-tracking';

const THUMB_SIZE = 56;

type MissingCaseCardProps = {
  missingCase: MissingCase;
  onPressProduct: (slug: string) => void;
  onTrackDelivery?: (delivery: MissingCaseDelivery) => void;
};

function MissingLineRow({
  line,
  onPressProduct,
}: {
  line: MissingCaseLine;
  onPressProduct: (slug: string) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={line.name || 'Ürün'}
      accessibilityRole={line.slug ? 'button' : undefined}
      disabled={!line.slug}
      onPress={() => line.slug && onPressProduct(line.slug)}
    >
      <XStack gap="$3" padding="$3">
        <YStack
          alignItems="center"
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          borderRadius="$3"
          borderWidth={1}
          height={THUMB_SIZE}
          justifyContent="center"
          overflow="hidden"
          width={THUMB_SIZE}
        >
          {line.image ? (
            <Image
              contentFit="cover"
              source={{ uri: line.image }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <ImagePlaceholderIcon color="$color9" size={22} />
          )}
        </YStack>
        <YStack flex={1} gap="$1">
          <Paragraph color="$color" fontSize={13} fontWeight="600" lineHeight={18}>
            {line.name}
          </Paragraph>
          {line.variantName ? (
            <Paragraph color="$color10" fontSize={12}>
              Beden: {line.variantName}
            </Paragraph>
          ) : null}
          <Paragraph color="$yellow11" fontSize={12} fontWeight="700">
            Eksik: {line.missingQuantity} adet
          </Paragraph>
        </YStack>
      </XStack>
    </Pressable>
  );
}

function DeliveryFooter({
  caseNo,
  delivery,
  onTrackDelivery,
}: {
  caseNo: string;
  delivery: MissingCaseDelivery;
  onTrackDelivery?: (delivery: MissingCaseDelivery) => void;
}) {
  // Ana siparişteki gibi: Aras'ın geçici `HG…` değeri gerçek takip numarası sayılmaz.
  const trackingCode = getCustomerTrackingCode({
    cargoCompanyName: delivery.cargoCompanyName,
    orderNo: delivery.orderNo,
    trackingCode: delivery.trackingCode,
  });
  const details = [delivery.status, delivery.cargoCompanyName].filter(Boolean).join(' · ');

  return (
    <XStack
      alignItems="center"
      backgroundColor="$backgroundHover"
      borderTopColor="$borderColor"
      borderTopWidth={1}
      flexWrap="wrap"
      gap="$2"
      justifyContent="space-between"
      paddingHorizontal="$3"
      paddingVertical="$2.5"
    >
      <Paragraph color="$color10" flexShrink={1} fontSize={12}>
        <Paragraph color="$color" fontSize={12} fontWeight="700">
          Telafi gönderisi:{' '}
        </Paragraph>
        {details}
      </Paragraph>
      {trackingCode && onTrackDelivery ? (
        <Button
          accessibilityLabel={`${caseNo} numaralı bildirimin telafi gönderisini takip et`}
          backgroundColor="$background"
          borderColor="$brand"
          borderRadius="$3"
          borderWidth={1}
          height={32}
          onPress={() => onTrackDelivery(delivery)}
          paddingHorizontal="$2.5"
          pressStyle={{ backgroundColor: '$orange2', borderColor: '$brand' }}
        >
          <XStack alignItems="center" gap="$1">
            <Truck color="$brand" size={14} />
            <Paragraph color="$brand" fontSize={12} fontWeight="700">
              Kargo Takip
            </Paragraph>
          </XStack>
        </Button>
      ) : null}
    </XStack>
  );
}

/** A single missing product/part report: its lines, resolution note and compensation shipment. */
export function MissingCaseCard({ missingCase, onPressProduct, onTrackDelivery }: MissingCaseCardProps) {
  const isPart = missingCase.kind === 'part';

  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$4"
      borderWidth={1}
      overflow="hidden"
      testID={`missing-case-${missingCase.kind}-${missingCase.id}`}
    >
      <XStack
        alignItems="center"
        backgroundColor="$backgroundHover"
        gap="$3"
        justifyContent="space-between"
        paddingHorizontal="$3"
        paddingVertical="$2"
      >
        <XStack alignItems="center" flexShrink={1} flexWrap="wrap" gap="$2">
          <Paragraph color="$color" fontSize={12} fontWeight="700" selectable>
            Bildirim: {missingCase.caseNo}
          </Paragraph>
          <YStack
            backgroundColor={isPart ? '$color4' : '$yellow4'}
            borderRadius="$2"
            paddingHorizontal="$1.5"
            paddingVertical={2}
          >
            <Paragraph color={isPart ? '$color11' : '$yellow11'} fontSize={10} fontWeight="800">
              {isPart ? 'EKSİK PARÇA' : 'EKSİK ÜRÜN'}
            </Paragraph>
          </YStack>
        </XStack>
        <YStack
          backgroundColor={missingCase.isResolved ? '$green3' : '$yellow4'}
          borderRadius={100}
          flexShrink={0}
          paddingHorizontal="$2"
          paddingVertical={2}
        >
          <Paragraph
            color={missingCase.isResolved ? '$green11' : '$yellow11'}
            fontSize={11}
            fontWeight="700"
          >
            {missingCase.statusLabel}
          </Paragraph>
        </YStack>
      </XStack>

      {missingCase.lines.map((line, index) => (
        <YStack borderTopColor="$borderColor" borderTopWidth={index > 0 ? 1 : 0} key={line.id}>
          <MissingLineRow line={line} onPressProduct={onPressProduct} />
        </YStack>
      ))}

      {/* Web paritesi: çözüm notu yalnızca eksik ürün bildirimlerinde gösterilir. */}
      {!isPart && missingCase.resolutionNote ? (
        <Paragraph
          backgroundColor="$backgroundHover"
          borderTopColor="$borderColor"
          borderTopWidth={1}
          color="$color11"
          fontSize={12}
          lineHeight={17}
          paddingHorizontal="$3"
          paddingVertical="$2"
        >
          {missingCase.resolutionNote}
        </Paragraph>
      ) : null}

      {missingCase.delivery ? (
        <DeliveryFooter
          caseNo={missingCase.caseNo}
          delivery={missingCase.delivery}
          onTrackDelivery={onTrackDelivery}
        />
      ) : null}
    </YStack>
  );
}
