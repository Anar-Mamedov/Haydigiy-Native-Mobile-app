import { Image } from 'expo-image';
import { Separator, Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { CheckoutSection } from './checkout-section';
import { CheckoutOptionRow } from './checkout-option-row';
import { resolveCdnUrl } from '@/utils/cdn';
import { formatCurrency } from '@/utils/format-currency';
import { CargoCompany } from '@/types/checkout.types';

interface CheckoutCargoSectionProps {
  companies: CargoCompany[];
  selectedId: number | null;
  onSelect: (company: CargoCompany) => void;
  hasFreeShipping: boolean;
  isLoading: boolean;
  /** Locks selection while `/order/token` is in flight (see `isCheckoutLocked`). */
  disabled?: boolean;
}

export function CheckoutCargoSection({
  companies,
  selectedId,
  onSelect,
  hasFreeShipping,
  isLoading,
  disabled = false,
}: CheckoutCargoSectionProps) {
  return (
    <CheckoutSection noBodyPadding title="Kargo">
      {isLoading ? (
        <YStack alignItems="center" gap="$2" paddingVertical="$5">
          <Spinner color="$brand" />
          <Paragraph color="$color10" fontSize={13}>
            Kargo seçenekleri yükleniyor...
          </Paragraph>
        </YStack>
      ) : companies.length === 0 ? (
        <Paragraph color="$color10" fontSize={13} paddingVertical="$5" textAlign="center">
          Kargo seçeneği bulunamadı.
        </Paragraph>
      ) : (
        companies.map((company, index) => {
          const logo = resolveCdnUrl(company.logo);
          return (
            <YStack key={company.id}>
              {index > 0 ? <Separator borderColor="$borderColor" /> : null}
              <CheckoutOptionRow
                accessibilityLabel={company.name}
                disabled={disabled}
                onPress={() => onSelect(company)}
                right={
                  hasFreeShipping ? (
                    <YStack alignItems="flex-end">
                      <Paragraph
                        color="$color9"
                        fontSize={11}
                        textDecorationLine="line-through"
                      >
                        {formatCurrency(company.price)}
                      </Paragraph>
                      <Paragraph color="$green10" fontSize={13} fontWeight="700">
                        Ücretsiz
                      </Paragraph>
                    </YStack>
                  ) : (
                    <Paragraph color="$color" fontSize={14} fontWeight="700">
                      {formatCurrency(company.price)}
                    </Paragraph>
                  )
                }
                selected={selectedId === company.id}
              >
                {logo ? (
                  <Image
                    accessibilityIgnoresInvertColors
                    contentFit="contain"
                    source={{ uri: logo }}
                    style={{ width: 36, height: 36, borderRadius: 6 }}
                  />
                ) : null}
                <Paragraph color="$color" flex={1} fontSize={14} fontWeight="600">
                  {company.name}
                </Paragraph>
              </CheckoutOptionRow>
            </YStack>
          );
        })
      )}
    </CheckoutSection>
  );
}
