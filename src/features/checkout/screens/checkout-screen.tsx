import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, Spinner, YStack } from 'tamagui';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { ShippingEstimateInfo } from '@/features/shipping/components/shipping-estimate-info';
import { FreeShippingCampaignCard } from '@/features/cart/components/free-shipping-campaign-card';
import { useCheckoutController } from '../hooks/use-checkout-controller';
import { usePlaceOrder } from '../hooks/use-place-order';
import { CheckoutCartItems } from '../components/checkout-cart-items';
import { CheckoutCargoSection } from '../components/checkout-cargo-section';
import { CheckoutDeliveryAddress } from '../components/checkout-delivery-address';
import { CheckoutCouponSection } from '../components/checkout-coupon-section';
import { CheckoutPaymentOptions } from '../components/checkout-payment-options';
import { CheckoutCardForm } from '../components/checkout-card-form';
import { CheckoutInstallments } from '../components/checkout-installments';
import { CheckoutSummaryBackdrop } from '../components/checkout-summary-backdrop';
import {
  AgreementConsentCard,
  CheckoutContractSheet,
  ContractPreviewContent,
} from '../components/checkout-contracts';
import type { CheckoutContractKind } from '../components/checkout-contracts';
import { CheckoutSummaryBar } from '../components/checkout-summary-bar';
import { PaymentWebView } from '../components/payment-webview';

export function CheckoutScreen() {
  const router = useRouter();
  const controller = useCheckoutController();
  const placeOrder = usePlaceOrder(controller);
  const { refetchAddresses, refetchCart } = controller;
  const [openContract, setOpenContract] = useState<CheckoutContractKind>(null);

  const openPreInfoContract = useCallback(() => {
    setOpenContract('pre-info');
  }, []);

  const openDistanceSalesContract = useCallback(() => {
    setOpenContract('distance-sales');
  }, []);

  const closeContract = useCallback(() => {
    setOpenContract(null);
  }, []);

  // A newly added address (or web-side cart change) should reflect on return.
  useFocusEffect(
    useCallback(() => {
      refetchAddresses();
      refetchCart();
    }, [refetchAddresses, refetchCart]),
  );

  const header = <ScreenHeader onBack={controller.goBack} title="Güvenli Ödeme" />;

  if (controller.isLoading) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (controller.isError) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Ödeme bilgileri yüklenirken bir hata oluştu."
            onActionPress={() => controller.refetchCart()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (controller.items.length === 0) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Sepete Git"
            description="Ödeme yapmak için sepetinizde ürün bulunmalıdır."
            onActionPress={() => router.replace('/cart')}
            primary
            title="Sepetiniz Boş"
          />
        </YStack>
      </AppScreen>
    );
  }

  const showCardSections = controller.isCardPayment && !controller.card.isRestrictedBin;

  const contractData = {
    buyer: controller.shippingAddress,
    billing: controller.sendInvoiceToSameAddress
      ? controller.shippingAddress
      : controller.billingAddress,
    items: controller.items.map((item) => ({
      name: item.title,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    subtotal: controller.subtotal,
    cargoPrice: controller.hasFreeShipping ? 0 : controller.cargoPrice,
    serviceFee: controller.totals.serviceFee,
    total: controller.totals.finalTotal,
    paymentMethodName: controller.selectedMethod?.name ?? '',
  };

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <ScrollView
          contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <CheckoutCartItems
            expanded={controller.isCartExpanded}
            items={controller.items}
            onPressItem={controller.openProduct}
            onToggle={controller.toggleCart}
          />

          <ShippingEstimateInfo estimate={controller.shippingEstimate} />
          <FreeShippingCampaignCard
            campaigns={controller.campaigns}
            subtotal={controller.campaignBasis}
          />

          <CheckoutCargoSection
            companies={controller.cargoCompanies}
            hasFreeShipping={controller.hasFreeShipping}
            isLoading={controller.isCargoLoading}
            onSelect={controller.selectCargo}
            selectedId={controller.selectedCargo?.id ?? null}
          />

          <CheckoutDeliveryAddress
            addresses={controller.addresses}
            billingAddress={controller.billingAddress}
            isError={controller.isAddressesError}
            isLoading={controller.isAddressesLoading}
            onAddAddress={controller.goToAddAddress}
            onEditAddress={controller.goToEditAddress}
            onRetry={controller.refetchAddresses}
            onSelectBilling={controller.selectBillingAddress}
            onSelectShipping={controller.selectShippingAddress}
            onToggleInvoiceSame={controller.setSendInvoiceToSameAddress}
            sendInvoiceToSameAddress={controller.sendInvoiceToSameAddress}
            shippingAddress={controller.shippingAddress}
          />

          <CheckoutCouponSection
            appliedCoupon={controller.appliedCoupon}
            coupons={controller.coupons}
            couponError={controller.couponError}
            couponInput={controller.couponInput}
            isApplyingCoupon={controller.isApplyingCoupon}
            isCouponsLoading={controller.isCouponsLoading}
            isRemovingCoupon={controller.isRemovingCoupon}
            onApplyCoupon={controller.applyCoupon}
            onCouponInputChange={controller.setCouponInput}
            onRemoveCoupon={controller.clearCoupon}
          />

          <CheckoutPaymentOptions
            isLoading={controller.isPaymentMethodsLoading}
            methods={controller.paymentMethods}
            onSelect={controller.selectMethod}
            orderTotal={controller.singlePaymentTotal}
            selectedSlug={controller.selectedMethod?.slug ?? ''}
          />

          {showCardSections ? <CheckoutCardForm card={controller.card} /> : null}
          {showCardSections ? (
            <CheckoutInstallments
              installmentPlans={controller.card.installmentPlans}
              isLoading={controller.card.isLoadingInstallments}
              onSelect={controller.card.selectInstallment}
              selectedInstallment={controller.card.selectedInstallment}
              singlePaymentTotal={controller.singlePaymentTotal}
            />
          ) : null}

          <ContractPreviewContent
            onOpenDistanceSales={openDistanceSalesContract}
            onOpenPreInfo={openPreInfoContract}
          />
        </ScrollView>

        <CheckoutSummaryBackdrop
          onPress={controller.toggleSummary}
          visible={controller.isSummaryExpanded}
        />

        <CheckoutSummaryBar
          agreementSlot={
            <AgreementConsentCard
              checked={controller.isAgreementChecked}
              onChange={controller.setIsAgreementChecked}
              onOpenDistanceSales={openDistanceSalesContract}
              onOpenPreInfo={openPreInfoContract}
            />
          }
          campaignDiscount={controller.campaignDiscount}
          canSubmit={controller.canSubmit}
          cargoPrice={controller.cargoPrice}
          commission={controller.totals.commission}
          commissionRate={controller.selectedMethod?.commissionRate ?? 0}
          couponDiscount={controller.effectiveCouponDiscount}
          expanded={controller.isSummaryExpanded}
          finalTotal={controller.totals.finalTotal}
          hasFreeShipping={controller.hasFreeShipping}
          hint={placeOrder.isSubmitting ? null : controller.hint}
          installmentCount={controller.card.selectedInstallment}
          installmentFee={controller.totals.installmentFee}
          isFreeShippingCoupon={controller.isFreeShippingCoupon}
          isSubmitting={placeOrder.isSubmitting}
          onSubmit={placeOrder.submit}
          onToggle={controller.toggleSummary}
          reserveBottomSafeArea={false}
          serviceFee={controller.totals.serviceFee}
          subtotal={controller.subtotal}
          submitError={controller.submitError}
          userDiscount={controller.userDiscount}
        />
      </YStack>

      <CheckoutContractSheet
        contractData={contractData}
        kind={openContract}
        onClose={closeContract}
      />
      <PaymentWebView payload={placeOrder.threeDS} onClose={placeOrder.closeThreeDS} />
    </AppScreen>
  );
}
