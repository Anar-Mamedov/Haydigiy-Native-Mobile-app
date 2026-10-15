import type { ComponentType, ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import {
  AppIconProps,
  FileText,
  Image as ImageIcon,
  PackageCheck,
  TriangleAlert,
  Truck,
  X,
} from '@/components/ui/icons';
import { OrderDetailItem, ReturnRejection } from '@/types/order.types';
import { ReturnRejectionImages } from './return-rejection-images';

type DetailEntry = { label: string; value: string | null | undefined };

type ReturnRejectionSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The rejected returned line; its `returnRejection` fills the sheet. */
  item: OrderDetailItem | null;
};

/** Label/value rows; empty values are skipped like the web `DetailRow`. */
function DetailList({ entries }: { entries: DetailEntry[] }) {
  const visible = entries.filter((entry) => Boolean(entry.value?.trim()));

  return (
    <YStack>
      {visible.map((entry, index) => (
        <XStack
          alignItems="flex-start"
          borderBottomColor="$borderColor"
          borderBottomWidth={index === visible.length - 1 ? 0 : 1}
          gap="$4"
          justifyContent="space-between"
          key={entry.label}
          paddingVertical="$2.5"
        >
          <Paragraph color="$color10" fontSize={12}>
            {entry.label}
          </Paragraph>
          <Paragraph color="$color" flexShrink={1} fontSize={13} fontWeight="600" selectable textAlign="right">
            {entry.value}
          </Paragraph>
        </XStack>
      ))}
    </YStack>
  );
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon: ComponentType<AppIconProps>;
  title: string;
  children: ReactNode;
}) {
  return (
    <YStack backgroundColor="$background" borderColor="$borderColor" borderRadius="$5" borderWidth={1} gap="$2" padding="$4">
      <XStack alignItems="center" gap="$2">
        <Icon color="$color9" size={16} />
        <Paragraph color="$color" fontSize={14} fontWeight="700">
          {title}
        </Paragraph>
      </XStack>
      {children}
    </YStack>
  );
}

function hasShipmentDetails(rejection: ReturnRejection): boolean {
  return Boolean(
    rejection.cargoCompany || rejection.trackingCode || rejection.shipmentOrderNo || rejection.shipmentStatusText,
  );
}

function RejectionContent({ item, rejection }: { item: OrderDetailItem; rejection: ReturnRejection }) {
  return (
    <>
      <XStack alignItems="flex-start" backgroundColor="$red2" borderColor="$red6" borderRadius="$5" borderWidth={1} gap="$3" padding="$4">
        <TriangleAlert color="$red10" size={20} />
        <YStack flex={1} gap="$1">
          <Paragraph color="$red11" fontSize={14} fontWeight="700">
            İade talebi reddedildi
          </Paragraph>
          <Paragraph color="$red11" fontSize={14} lineHeight={20}>
            {rejection.description || 'Ret nedeni belirtilmedi.'}
          </Paragraph>
        </YStack>
      </XStack>

      <DetailSection icon={FileText} title="Talep bilgileri">
        <DetailList
          entries={[
            { label: 'Vaka numarası', value: rejection.caseNo },
            { label: 'İade kodu', value: item.returnCode },
            { label: 'Durum', value: rejection.statusText || item.returnStatusName },
            { label: 'Talep tarihi', value: item.returnRequestedAt },
            { label: 'Ürün ulaşma tarihi', value: item.returnReceivedAt },
            { label: 'İşlem tarihi', value: item.returnApprovedAt },
          ]}
        />
      </DetailSection>

      <DetailSection icon={ImageIcon} title="Ret nedeni görselleri">
        <YStack paddingTop="$1">
          <ReturnRejectionImages images={rejection.images} />
        </YStack>
      </DetailSection>

      <DetailSection icon={Truck} title="Kargo bilgileri">
        {hasShipmentDetails(rejection) ? (
          <DetailList
            entries={[
              { label: 'Kargo firması', value: rejection.cargoCompany },
              { label: 'Takip kodu', value: rejection.trackingCode },
              { label: 'Gönderi numarası', value: rejection.shipmentOrderNo },
              { label: 'Kargo durumu', value: rejection.shipmentStatusText },
            ]}
          />
        ) : (
          <XStack alignItems="flex-start" backgroundColor="$backgroundHover" borderRadius="$4" gap="$2" padding="$3">
            <PackageCheck color="$color10" size={16} />
            <Paragraph color="$color10" flex={1} fontSize={13} lineHeight={18}>
              Kargo bilgileri henüz oluşmadı. Güncellendiğinde burada gösterilecek.
            </Paragraph>
          </XStack>
        )}
      </DetailSection>
    </>
  );
}

/**
 * "İade Ret Detayları" — web `ReturnRejectionDetailsDrawer` portu: ret nedeni,
 * talep bilgileri, depo görselleri ve ürünün geri gönderim kargosu.
 */
export function ReturnRejectionSheet({ open, onOpenChange, item }: ReturnRejectionSheetProps) {
  const insets = useSafeAreaInsets();
  const rejection = item?.returnRejection ?? null;

  return (
    <Sheet dismissOnOverlayPress modal onOpenChange={onOpenChange} open={open} snapPoints={[85]} snapPointsMode="percent">
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$backgroundHover" borderTopLeftRadius="$6" borderTopRightRadius="$6" testID="return-rejection-sheet-frame">
        <XStack
          alignItems="center"
          backgroundColor="$background"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Paragraph color="$color" fontSize={18} fontWeight="800">
            İade Ret Detayları
          </Paragraph>
          <Button
            accessibilityLabel="İade ret detaylarını kapat"
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
          contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 32), gap: 16 }}
          showsVerticalScrollIndicator
        >
          {item && rejection ? <RejectionContent item={item} rejection={rejection} /> : null}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
