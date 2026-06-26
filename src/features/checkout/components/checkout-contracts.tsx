import { useWindowDimensions } from 'react-native';
import { Paragraph, ScrollView, Sheet, YStack } from 'tamagui';
import { AppCheckbox } from '@/components/ui/app-checkbox';
import { SectionCard } from '@/components/ui/section-card';
import {
  buildDistanceSalesText,
  buildPreInfoText,
  type ContractData,
} from '../utils/build-contract-text';

export type CheckoutContractKind = 'pre-info' | 'distance-sales' | null;

const DISTANCE_SALES_PREVIEW =
  'Bu sözleşme, müşteri (Alıcı) ile Haydigiy E-Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi (Satıcı) arasında elektronik ortamda kurulmuştur.';

const PRE_INFO_PREVIEW = [
  'Bu form, Haydigiy.com üzerinden gerçekleştirilen alışveriş işlemlerine ilişkin önemli bilgileri içerir.',
  '',
  '1. TARAFLAR',
  'ALICI: Bir ürün veya hizmeti ticari veya mesleki olmayan amaçlarla satın alan gerçek kişiyi,',
  'SATICI: Haydigiy E-Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi’ni,',
  'HAYDİGİY: www.haydigiy.com internet sitesini ve mobil uygulamasını ifade eder.',
].join('\n');

const WITHDRAWAL_PREVIEW = [
  '8.1. Cayma Hakkı Süresi',
  '',
  'Müşteri, ürünü teslim aldığı tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir. Cayma süresi, ürünün teslim alındığı tarihten itibaren başlar.',
  '',
  '8.2. Cayma Hakkının Kullanılması',
  'İade talebi, müşteri hizmetleri (0850 259 04 49) veya info@haydigiy.com adresine yazılı olarak bildirilir.',
].join('\n');

interface ContractPreviewBoxProps {
  title: string;
  description?: string;
  bodyTitle?: string;
  body: string;
  height: number;
  onPress?: () => void;
}

function ContractPreviewBox({
  title,
  description,
  bodyTitle,
  body,
  height,
  onPress,
}: ContractPreviewBoxProps) {
  return (
    <YStack
      accessibilityLabel={title || bodyTitle}
      accessibilityRole={onPress ? 'button' : undefined}
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$2"
      borderWidth={1}
      gap="$3"
      onPress={onPress}
      padding="$3"
      pressStyle={onPress ? { backgroundColor: '$backgroundHover' } : undefined}
    >
      {title ? (
        <YStack gap="$2">
          <Paragraph color="$color" fontSize={20} fontWeight="800">
            {title}
          </Paragraph>
          {description ? (
            <Paragraph color="$color10" fontSize={12} lineHeight={17} selectable>
              {description}
            </Paragraph>
          ) : null}
        </YStack>
      ) : null}

      <ScrollView
        height={height}
        nestedScrollEnabled
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingRight: 6 }}
      >
        <YStack gap="$3">
          {bodyTitle ? (
            <Paragraph color="$color" fontSize={16} fontWeight="700" selectable>
              {bodyTitle}
            </Paragraph>
          ) : null}
          <Paragraph color="$color11" fontSize={13} lineHeight={20} selectable>
            {body}
          </Paragraph>
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export function ContractPreviewContent({
  onOpenPreInfo,
  onOpenDistanceSales,
}: {
  onOpenPreInfo: () => void;
  onOpenDistanceSales: () => void;
}) {
  return (
    <SectionCard padding="$4">
      <YStack gap="$3">
        <Paragraph color="$color" fontSize={18} fontWeight="800">
          1. Mesafeli Satış Sözleşmesi
        </Paragraph>

        <ContractPreviewBox
          body={DISTANCE_SALES_PREVIEW}
          bodyTitle="1. TARAFLAR"
          height={86}
          onPress={onOpenDistanceSales}
          title=""
        />

        <ContractPreviewBox
          body={PRE_INFO_PREVIEW}
          description="Bu form, Haydigiy.com üzerinden gerçekleştirilen alışverişlere ilişkin önemli bilgileri içerir."
          height={112}
          onPress={onOpenPreInfo}
          title="Ön Bilgilendirme Formu"
        />

        <ContractPreviewBox
          body={WITHDRAWAL_PREVIEW}
          description="Cayma hakkına ilişkin detaylar aşağıdadır."
          height={132}
          onPress={onOpenDistanceSales}
          title="Cayma Hakkı"
        />
      </YStack>
    </SectionCard>
  );
}

export function AgreementConsentCard({
  checked,
  onChange,
  onOpenPreInfo,
  onOpenDistanceSales,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  onOpenPreInfo: () => void;
  onOpenDistanceSales: () => void;
}) {
  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderRadius="$3"
      borderWidth={1}
      padding="$3"
    >
      <AppCheckbox
        accessibilityLabel="Ön bilgilendirme koşullarını ve mesafeli satış sözleşmesini onaylıyorum"
        checked={checked}
        onChange={onChange}
        size={20}
      >
        <Paragraph color="$color11" fontSize={14} lineHeight={22}>
          <Paragraph
            color="$color"
            fontSize={14}
            fontWeight="800"
            lineHeight={22}
            onPress={onOpenPreInfo}
          >
            Ön Bilgilendirme Koşulları
          </Paragraph>
          &apos;nı,{' '}
          <Paragraph
            color="$color"
            fontSize={14}
            fontWeight="800"
            lineHeight={22}
            onPress={onOpenDistanceSales}
          >
            Mesafeli Satış Sözleşmesi
          </Paragraph>{' '}
          &apos;ni okudum, onaylıyorum.
        </Paragraph>
      </AppCheckbox>
    </YStack>
  );
}

export function CheckoutContractSheet({
  kind,
  onClose,
  contractData,
}: {
  kind: CheckoutContractKind;
  onClose: () => void;
  contractData: ContractData;
}) {
  const { height } = useWindowDimensions();
  const open = kind !== null;
  const title = kind === 'pre-info' ? 'Ön Bilgilendirme Koşulları' : 'Mesafeli Satış Sözleşmesi';
  const text =
    kind === 'pre-info'
      ? buildPreInfoText(contractData)
      : kind === 'distance-sales'
        ? buildDistanceSalesText(contractData)
        : '';

  return (
    <Sheet
      dismissOnOverlayPress
      dismissOnSnapToBottom
      modal
      onOpenChange={(next: boolean) => {
        if (!next) onClose();
      }}
      open={open}
      snapPoints={[Math.round(height * 0.85)]}
      snapPointsMode="constant"
    >
      <Sheet.Overlay
        backgroundColor="$shadowColor"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        opacity={0.5}
      />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <YStack borderBottomColor="$borderColor" borderBottomWidth={1} padding="$4">
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            {title}
          </Paragraph>
        </YStack>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <Paragraph color="$color11" fontSize={13} lineHeight={20}>
            {text}
          </Paragraph>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
