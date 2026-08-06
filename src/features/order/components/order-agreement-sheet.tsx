import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { OrderDetail } from '@/types/order.types';
import {
  AGREEMENT_LAST_UPDATE,
  MESAFELI_CLOSING,
  MESAFELI_INTRO,
  ONBILGI_SECTIONS,
} from '../data/agreement-content';
import { AgreementSections } from './agreement-sections';
import { AgreementOrderDetails } from './agreement-order-details';

export type AgreementTab = 'mesafeli' | 'onbilgi';

const TABS: { id: AgreementTab; label: string }[] = [
  { id: 'mesafeli', label: 'Mesafeli Satış Sözleşmesi' },
  { id: 'onbilgi', label: 'Ön Bilgilendirme Formu' },
];

type OrderAgreementSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderDetail;
  initialTab: AgreementTab;
};

/** Tabbed bottom sheet for the distance sales contract + pre-information form. */
export function OrderAgreementSheet({
  open,
  onOpenChange,
  order,
  initialTab,
}: OrderAgreementSheetProps) {
  const [activeTab, setActiveTab] = useState<AgreementTab>(initialTab);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [open, initialTab]);

  return (
    <Sheet
      disableDrag
      modal
      onOpenChange={onOpenChange}
      open={open}
      snapPoints={[100]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background">
        <XStack
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          paddingTop={insets.top}
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <Pressable
                accessibilityLabel={tab.label}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{ flex: 1 }}
              >
                <YStack
                  alignItems="center"
                  borderBottomColor={active ? '$brand' : 'transparent'}
                  borderBottomWidth={2}
                  paddingHorizontal="$2"
                  paddingVertical="$3"
                >
                  <Paragraph
                    color={active ? '$color' : '$color10'}
                    fontSize={13}
                    fontWeight={active ? '800' : '500'}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Paragraph>
                </YStack>
              </Pressable>
            );
          })}
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator>
          {activeTab === 'mesafeli' ? (
            <>
              <Paragraph color="$color" fontSize={17} fontWeight="800" textAlign="center">
                MESAFELİ SATIŞ SÖZLEŞMESİ
              </Paragraph>
              <AgreementSections sections={MESAFELI_INTRO} />
              <AgreementOrderDetails order={order} />
              <AgreementSections sections={MESAFELI_CLOSING} />
            </>
          ) : (
            <>
              <Paragraph color="$color" fontSize={17} fontWeight="800" textAlign="center">
                ÖN BİLGİLENDİRME FORMU
              </Paragraph>
              <AgreementSections sections={ONBILGI_SECTIONS} />
            </>
          )}
          <Paragraph color="$color10" fontSize={12} paddingTop="$2">
            {AGREEMENT_LAST_UPDATE}
          </Paragraph>
        </ScrollView>

        <YStack
          borderTopColor="$borderColor"
          borderTopWidth={1}
          paddingBottom={Math.max(insets.bottom, 16)}
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Button
            backgroundColor="$brand"
            borderRadius="$4"
            height={46}
            onPress={() => onOpenChange(false)}
            pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
          >
            <Paragraph color="white" fontWeight="700">
              Tamam
            </Paragraph>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
