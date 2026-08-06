import { TriangleAlert } from '@/components/ui/icons';
import { Button, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { CancelPreview } from '@/types/order.types';

function currency(value: number): string {
  return `${new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)} TL`;
}

function campaignNamesText(preview: CancelPreview): string {
  const names = preview.brokenCampaigns.map((c) => c.name?.trim()).filter(Boolean);
  if (names.length === 0) return 'kampanyadan';
  if (names.length === 1) return `${names[0]} kampanyasından`;
  return `${names.join(', ')} kampanyalarından`;
}

function SummaryRow({
  label,
  value,
  color = '$color',
  bold,
  border,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  border?: boolean;
}) {
  return (
    <XStack
      borderTopColor="$borderColor"
      borderTopWidth={border ? 1 : 0}
      justifyContent="space-between"
      paddingTop={border ? '$2' : 0}
      paddingVertical="$1.5"
    >
      <Paragraph color="$color10" fontSize={13} fontWeight={bold ? '700' : '400'}>
        {label}
      </Paragraph>
      <Paragraph color={color as never} fontSize={13} fontWeight={bold ? '800' : '600'}>
        {value}
      </Paragraph>
    </XStack>
  );
}

type CampaignBreakWarningSheetProps = {
  open: boolean;
  preview: CancelPreview | null;
  confirming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onCancelAll: () => void;
};

/** Warning shown when cancelling breaks a campaign (acknowledge) or is blocked. */
export function CampaignBreakWarningSheet({
  open,
  preview,
  confirming,
  onConfirm,
  onCancel,
  onCancelAll,
}: CampaignBreakWarningSheetProps) {
  const blocked = preview?.cancellationBlocked ?? false;

  return (
    <Sheet
      dismissOnOverlayPress
      modal
      onOpenChange={(next: boolean) => !next && onCancel()}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <XStack
          alignItems="center"
          backgroundColor={blocked ? '$red2' : '$yellow2'}
          borderTopLeftRadius="$6"
          borderTopRightRadius="$6"
          gap="$3"
          padding="$4"
        >
          <XStack
            alignItems="center"
            backgroundColor={blocked ? '$red4' : '$yellow4'}
            borderRadius={100}
            height={44}
            justifyContent="center"
            width={44}
          >
            <TriangleAlert color={blocked ? '$red10' : '$yellow10'} size={24} />
          </XStack>
          <Paragraph color={blocked ? '$red11' : '$yellow11'} fontSize={17} fontWeight="800">
            {blocked ? 'Bu Ürün İptal Edilemiyor' : 'Kampanyadan Çıkıyorsunuz'}
          </Paragraph>
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} style={{ maxHeight: 380 }}>
          {!preview ? null : blocked ? (
            <Paragraph color="$color10" fontSize={14} lineHeight={20}>
              {preview.blockMessage || 'Bu ürün şu anda iptal edilemiyor.'}
            </Paragraph>
          ) : (
            <YStack gap="$3">
              <Paragraph color="$color10" fontSize={14} lineHeight={20}>
                Bu üründen vazgeçerseniz{' '}
                <Paragraph color="$color" fontSize={14} fontWeight="700">
                  {campaignNamesText(preview)}
                </Paragraph>{' '}
                çıkıyorsunuz.
              </Paragraph>

              {preview.brokenCampaigns.length > 0 ? (
                <YStack
                  backgroundColor="$yellow2"
                  borderColor="$yellow6"
                  borderRadius="$4"
                  borderWidth={1}
                  gap="$1"
                  padding="$3"
                >
                  <Paragraph color="$yellow11" fontSize={11} fontWeight="700">
                    KIRILAN KAMPANYALAR
                  </Paragraph>
                  {preview.brokenCampaigns.map((campaign) => (
                    <Paragraph color="$color" fontSize={13} key={campaign.id}>
                      {campaign.name}
                    </Paragraph>
                  ))}
                </YStack>
              ) : null}

              <YStack backgroundColor="$backgroundHover" borderRadius="$4" padding="$3">
                <SummaryRow label="Mevcut toplam" value={currency(preview.currentTotal)} />
                <SummaryRow color="$red10" label="İptal edilen tutar" value={`-${currency(preview.cancelledAmount)}`} />
                <SummaryRow color="$yellow11" label="Eklenen kargo" value={`+${currency(preview.addedCargoFee)}`} />
                <SummaryRow border label="Yeni toplam" value={currency(preview.newTotal)} />
                <SummaryRow border bold color="$green10" label="İade edilecek tutar" value={currency(preview.netRefundAmount)} />
              </YStack>
            </YStack>
          )}
        </ScrollView>

        <YStack borderTopColor="$borderColor" borderTopWidth={1} gap="$3" padding="$4">
          <Button
            backgroundColor={blocked ? '$red10' : '$brand'}
            borderRadius="$4"
            disabled={confirming}
            height={46}
            onPress={blocked ? onCancelAll : onConfirm}
            opacity={confirming ? 0.7 : 1}
            pressStyle={{ opacity: 0.85 }}
          >
            <Paragraph color="white" fontWeight="700">
              {confirming ? 'İşleniyor...' : blocked ? 'Tüm Siparişi İptal Et' : 'Onaylıyorum, İptal Et'}
            </Paragraph>
          </Button>
          <Button
            backgroundColor="$background"
            borderColor="$borderColor"
            borderRadius="$4"
            borderWidth={1}
            disabled={confirming}
            height={46}
            onPress={onCancel}
            pressStyle={{ backgroundColor: '$backgroundHover' }}
          >
            <Paragraph color="$color" fontWeight="600">
              {blocked ? 'Anladım' : 'Vazgeç'}
            </Paragraph>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
