import { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  MapPin,
  Package,
  RefreshCw,
  Truck,
  X,
} from '@tamagui/lucide-icons-2';
import { Button, Paragraph, ScrollView, Sheet, Spinner, XStack, YStack } from 'tamagui';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { useOrderCargoTrackingQuery } from '../api/order.queries';
import { formatTrackingCode } from '../api/order-tracking.mapper';
import {
  OrderAddress,
  OrderCargoMovement,
  OrderCargoTrackingStage,
  OrderDetail,
} from '@/types/order.types';

type CargoTrackingSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Kargo durumu sorgulanırken hata oluştu.';
}

function maskPhone(phone: string | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 5) return phone;
  return `${digits.slice(0, 3)}${'*'.repeat(Math.min(digits.length - 5, 7))}${digits.slice(-2)}`;
}

function getAddressLine(address: OrderAddress | null): string {
  if (!address) return '';
  return [address.addressLine, address.neighbourhood, address.district, address.city]
    .filter(Boolean)
    .join(', ');
}

function TrackingStageTimeline({
  delivered,
  stages,
}: {
  delivered: boolean;
  stages: OrderCargoTrackingStage[];
}) {
  return (
    <YStack gap={0}>
      {stages.map((stage, index) => {
        const isLast = index === stages.length - 1;
        return (
          <XStack alignItems="stretch" gap="$3" key={stage.key} minHeight={48}>
            <YStack alignItems="center" width={28}>
              <YStack
                backgroundColor={index > 0 && stage.completed ? '$blue10' : index > 0 ? '$borderColor' : 'transparent'}
                flex={1}
                width={2}
              />
              <XStack
                alignItems="center"
                backgroundColor={stage.completed ? '$blue10' : '$background'}
                borderColor={stage.completed ? '$blue10' : '$borderColor'}
                borderRadius={100}
                borderWidth={2}
                height={26}
                justifyContent="center"
                width={26}
              >
                {stage.completed ? (
                  isLast && delivered ? (
                    <Truck color="white" size={13} />
                  ) : (
                    <Check color="white" size={13} strokeWidth={3} />
                  )
                ) : (
                  <YStack backgroundColor="$color8" borderRadius={100} height={7} width={7} />
                )}
              </XStack>
              <YStack
                backgroundColor={!isLast && stages[index + 1]?.completed ? '$blue10' : !isLast ? '$borderColor' : 'transparent'}
                flex={1}
                width={2}
              />
            </YStack>

            <YStack flex={1} justifyContent="center" paddingVertical="$2">
              <Paragraph color={stage.completed ? '$color' : '$color9'} fontSize={14} fontWeight={stage.completed ? '700' : '500'}>
                {stage.label}
              </Paragraph>
            </YStack>
          </XStack>
        );
      })}
    </YStack>
  );
}

function AddressBlock({ address }: { address: OrderAddress | null }) {
  const addressLine = getAddressLine(address);
  if (!address || !addressLine) return null;

  const fullName = [address.name, address.surname].filter(Boolean).join(' ').trim();
  const phone = maskPhone(address.phone);

  return (
    <YStack gap="$1.5">
      <XStack alignItems="center" gap="$1.5">
        <MapPin color="$color9" size={14} />
        <Paragraph color="$color9" fontSize={11} fontWeight="700" textTransform="uppercase">
          Teslimat adresi
        </Paragraph>
      </XStack>
      <YStack borderColor="$borderColor" borderRadius="$4" borderWidth={1} gap="$1" padding="$3">
        {fullName || phone ? (
          <Paragraph color="$color" fontSize={13} fontWeight="700">
            {fullName}
            {phone ? (
              <Paragraph color="$color9" fontSize={13}>
                {fullName ? ` - ${phone}` : phone}
              </Paragraph>
            ) : null}
          </Paragraph>
        ) : null}
        <Paragraph color="$color10" fontSize={13} lineHeight={18}>
          {addressLine}
        </Paragraph>
      </YStack>
    </YStack>
  );
}

function MovementRow({ movement }: { movement: OrderCargoMovement }) {
  const description = movement.description ?? movement.code ?? '-';

  return (
    <XStack
      alignItems="flex-start"
      backgroundColor={movement.delivered ? '$green2' : '$backgroundHover'}
      borderRadius="$4"
      gap="$3"
      justifyContent="space-between"
      padding="$3"
    >
      <YStack flex={1} gap="$1">
        <Paragraph color={movement.delivered ? '$green11' : '$color'} fontSize={13} fontWeight="700" lineHeight={17}>
          {description}
        </Paragraph>
        <Paragraph color="$color9" fontSize={11}>
          {movement.dateLabel}
        </Paragraph>
      </YStack>
      {movement.location ? (
        <Paragraph color="$blue10" flexShrink={1} fontSize={11} fontWeight="700" maxWidth="38%" textAlign="right">
          {movement.location}
        </Paragraph>
      ) : null}
    </XStack>
  );
}

export function CargoTrackingSheet({ open, onOpenChange, order }: CargoTrackingSheetProps) {
  const insets = useSafeAreaInsets();
  const [movementsExpanded, setMovementsExpanded] = useState(true);
  const query = useOrderCargoTrackingQuery(String(order.id), open);
  const tracking = query.data;
  const trackingCode = tracking?.trackingCode ?? order.trackingCode ?? '';
  const companyName = tracking?.cargoCompanyName ?? order.cargoCompanyName ?? '';

  useEffect(() => {
    if (open) setMovementsExpanded(true);
  }, [open]);

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      onOpenChange={onOpenChange}
      open={open}
      snapPoints={[92]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6" maxHeight="92%">
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Paragraph color="$color" fontSize={18} fontWeight="800">
            Kargo Takibi
          </Paragraph>
          <Button
            accessibilityLabel="Kargo takip ekranını kapat"
            backgroundColor="$backgroundHover"
            borderRadius={100}
            height={36}
            onPress={() => onOpenChange(false)}
            padding={0}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
            width={36}
          >
            <X color="$color10" size={20} />
          </Button>
        </XStack>

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 16, 32),
            gap: 18,
          }}
          showsVerticalScrollIndicator
        >
          {query.isPending ? (
            <YStack alignItems="center" gap="$3" justifyContent="center" paddingVertical="$8">
              <Spinner color="$brand" size="large" />
              <Paragraph color="$color10" fontSize={13}>
                Kargo durumu sorgulanıyor...
              </Paragraph>
            </YStack>
          ) : query.isError ? (
            <YStack alignItems="center" gap="$4" paddingVertical="$7">
              <CircleAlert color="$red10" size={28} />
              <Paragraph color="$red10" fontSize={13} textAlign="center">
                {getErrorMessage(query.error)}
              </Paragraph>
              <Button
                accessibilityLabel="Kargo durumunu tekrar sorgula"
                backgroundColor="$brand"
                borderRadius="$4"
                height={42}
                onPress={() => query.refetch()}
                paddingHorizontal="$5"
                pressStyle={{ opacity: 0.85 }}
              >
                <XStack alignItems="center" gap="$2">
                  <RefreshCw color="white" size={16} />
                  <Paragraph color="white" fontSize={13} fontWeight="700">
                    Tekrar dene
                  </Paragraph>
                </XStack>
              </Button>
            </YStack>
          ) : tracking ? (
            <>
              {order.cargoCompanyLogo ? (
                <XStack justifyContent="center" paddingTop="$1">
                  <Image
                    accessibilityLabel={companyName || 'Kargo firması'}
                    contentFit="contain"
                    source={{ uri: order.cargoCompanyLogo }}
                    style={{ width: 116, height: 36 }}
                  />
                </XStack>
              ) : null}

              <YStack alignItems="center" gap="$2">
                <Paragraph color="$color9" fontSize={11} fontWeight="700" textTransform="uppercase">
                  Kargo takip numarası
                </Paragraph>
                <YStack backgroundColor="$backgroundHover" borderRadius="$5" paddingHorizontal="$5" paddingVertical="$3">
                  <Paragraph color="$color" fontSize={18} fontWeight="800" selectable>
                    {trackingCode ? formatTrackingCode(trackingCode) : '-'}
                  </Paragraph>
                </YStack>
              </YStack>

              <YStack gap="$5">
                <TrackingStageTimeline delivered={tracking.delivered} stages={tracking.stages} />

                <YStack gap="$4">
                  {order.items.length > 0 ? (
                    <XStack alignItems="center" gap="$2">
                      <Package color="$color9" size={17} />
                      <Paragraph color="$color10" flex={1} fontSize={13}>
                        Paketinizde{' '}
                        <Paragraph color="$color" fontSize={13} fontWeight="800">
                          {order.items.length}
                        </Paragraph>{' '}
                        ürün bulunmaktadır.
                      </Paragraph>
                    </XStack>
                  ) : null}

                  <AddressBlock address={order.shippingAddress} />

                  {tracking.lastMovement?.location ? (
                    <YStack gap="$1.5">
                      <XStack alignItems="center" gap="$1.5">
                        <Building2 color="$color9" size={14} />
                        <Paragraph color="$color9" fontSize={11} fontWeight="700" textTransform="uppercase">
                          Varış şubesi bilgileri
                        </Paragraph>
                      </XStack>
                      {companyName ? (
                        <Paragraph color="$color" fontSize={13} fontWeight="700">
                          {companyName}
                        </Paragraph>
                      ) : null}
                      <Paragraph color="$blue10" fontSize={13} fontWeight="700">
                        {tracking.lastMovement.location}
                      </Paragraph>
                    </YStack>
                  ) : null}
                </YStack>
              </YStack>

              {tracking.movements.length > 0 ? (
                <YStack borderTopColor="$borderColor" borderTopWidth={1} gap="$3" paddingTop="$4">
                  <XStack alignItems="center" justifyContent="space-between">
                    <Paragraph color="$color" fontSize={14} fontWeight="800">
                      Detaylı kargo hareketleri
                    </Paragraph>
                    <Button
                      accessibilityLabel={movementsExpanded ? 'Kargo hareketlerini gizle' : 'Kargo hareketlerini göster'}
                      backgroundColor="transparent"
                      borderRadius="$3"
                      height={34}
                      onPress={() => setMovementsExpanded((value) => !value)}
                      paddingHorizontal="$2"
                      pressStyle={{ backgroundColor: '$backgroundHover' }}
                      testID="cargo-tracking-movements-toggle"
                    >
                      <XStack alignItems="center" gap="$1">
                        <Paragraph color="$brand" fontSize={12} fontWeight="700">
                          {movementsExpanded ? 'Gizle' : 'Göster'}
                        </Paragraph>
                        {movementsExpanded ? (
                          <ChevronUp color="$brand" size={15} />
                        ) : (
                          <ChevronDown color="$brand" size={15} />
                        )}
                      </XStack>
                    </Button>
                  </XStack>

                  {movementsExpanded ? (
                    <YStack gap="$2">
                      {tracking.movements.map((movement) => (
                        <MovementRow key={movement.id} movement={movement} />
                      ))}
                    </YStack>
                  ) : null}
                </YStack>
              ) : !tracking.cargoStatus ? (
                <Paragraph color="$color9" fontSize={13} paddingVertical="$5" textAlign="center">
                  Henüz hareket kaydı bulunmuyor.
                </Paragraph>
              ) : null}
            </>
          ) : (
            <Paragraph color="$color9" fontSize={13} paddingVertical="$5" textAlign="center">
              Henüz hareket kaydı bulunmuyor.
            </Paragraph>
          )}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
