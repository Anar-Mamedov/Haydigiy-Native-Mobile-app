import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCardForm } from './use-card-form';
import { useCheckoutBootstrap } from './use-checkout-bootstrap';
import { useOrderTokenSync } from './use-order-token-sync';
import { getApiErrorMessage } from '../utils/error-message';
import {
  useCargoCompaniesQuery,
  useCheckoutAddressesQuery,
  usePaymentTypesQuery,
} from '../api/checkout.queries';
import { useValidateCouponMutation, useRemoveCouponMutation } from '../api/checkout.mutations';
import { isMethodOverLimit } from '../components/checkout-payment-options';
import { mapAppliedCoupon } from '../api/checkout.mapper';
import { calculateOrderTotals, getEffectiveCouponDiscount } from '../utils/order-totals';
import { calculateCartSubtotal, useCartStore } from '@/features/cart/store/use-cart-store';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { useCouponsQuery } from '@/features/coupon/api/coupon.queries';
import { getFreeShippingCampaign, getCartDiscountCampaignTotal } from '@/utils/cart-campaigns';
import {
  AppliedCoupon,
  CargoCompany,
  CheckoutAddress,
  PaymentMethod,
} from '@/types/checkout.types';
import { CartLineItem } from '@/types/cart.types';

/** Cargo id 5 is the in-store/special option that only allows card payment (web parity). */
const CARD_ONLY_CARGO_ID = 5;

/**
 * Orchestrates the checkout/payment screen: cart + addresses + cargo + payment
 * methods + coupon + card form + totals. Place-order routing (Garanti / İyzico /
 * Kapıda Ödeme) is layered on in a later step. Mirrors the web `MobilePayment`
 * state machine, adapted to TanStack Query + Zustand.
 */
export function useCheckoutController() {
  const router = useRouter();

  const params = useLocalSearchParams<{ orderToken?: string }>();
  const passedToken = typeof params.orderToken === 'string' ? params.orderToken : '';
  const checkoutBootstrap = useCheckoutBootstrap(passedToken);
  const shippingQuery = useShippingEstimateQuery();
  const addressesQuery = useCheckoutAddressesQuery();
  const paymentTypesQuery = usePaymentTypesQuery();
  const couponsQuery = useCouponsQuery();

  const orderToken = checkoutBootstrap.orderToken;
  const initialCargoId = checkoutBootstrap.initialCargoId;

  const items = useCartStore((state) => state.items);

  // ---- Selection state ----
  const [shippingAddress, setShippingAddress] = useState<CheckoutAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<CheckoutAddress | null>(null);
  const [sendInvoiceToSameAddress, setSendInvoiceToSameAddress] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedCargo, setSelectedCargo] = useState<CargoCompany | null>(null);
  const hasManuallySelectedCargoRef = useRef(false);
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sipariş gönderildikten sonra token senkronunu durduran bayrak (web
  // `orderSubmittedRef` paritesi). 3DS iptalinde senkron kaldığı yerden sürer.
  const isOrderSubmittedRef = useRef(false);
  const markOrderSubmitted = useCallback(() => {
    isOrderSubmittedRef.current = true;
  }, []);
  const resumeOrderTokenSync = useCallback(() => {
    isOrderSubmittedRef.current = false;
  }, []);

  // ---- Coupon state ----
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const validateCoupon = useValidateCouponMutation();
  const removeCoupon = useRemoveCouponMutation();

  const cargoQuery = useCargoCompaniesQuery(shippingAddress);

  // ---- Default selections ----
  const addresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);
  // Pre-select the user's default delivery address (web `is_default`), and the
  // default invoice address (web `is_invoice`) for the separate-billing case,
  // each falling back like the web `DeliveryAddress` component.
  useEffect(() => {
    if (addresses.length === 0) return;
    const defaultAddress = addresses.find((address) => address.isDefault);
    if (!shippingAddress) {
      setShippingAddress(defaultAddress ?? addresses[0]);
    }
    if (!billingAddress) {
      const invoiceAddress = addresses.find((address) => address.isInvoice);
      setBillingAddress(invoiceAddress ?? defaultAddress ?? addresses[0]);
    }
  }, [addresses, shippingAddress, billingAddress]);

  const cargoCompanies = useMemo(() => cargoQuery.data ?? [], [cargoQuery.data]);
  // Default cargo = the backend's prepared `cargo_id` (web `initialCargoId`),
  // falling back to the first in the list. A late-arriving default still wins over
  // the initial first-item pick, but never overrides a manual user choice.
  useEffect(() => {
    if (cargoCompanies.length === 0) return;

    const currentValid = selectedCargo && cargoCompanies.some((c) => c.id === selectedCargo.id);
    if (hasManuallySelectedCargoRef.current && currentValid) return;

    const preferred =
      initialCargoId != null ? cargoCompanies.find((c) => c.id === initialCargoId) : undefined;
    const next = preferred ?? (currentValid ? selectedCargo : cargoCompanies[0]);

    if (next && next.id !== selectedCargo?.id) {
      setSelectedCargo(next);
    }
  }, [cargoCompanies, selectedCargo, initialCargoId]);

  const selectCargo = useCallback((company: CargoCompany) => {
    hasManuallySelectedCargoRef.current = true;
    setSelectedCargo(company);
  }, []);

  const paymentMethods = useMemo(() => paymentTypesQuery.data ?? [], [paymentTypesQuery.data]);
  const filteredMethods = useMemo(() => {
    if (selectedCargo?.id === CARD_ONLY_CARGO_ID) {
      return paymentMethods.filter((m) => m.slug === 'credit_card');
    }
    return paymentMethods;
  }, [paymentMethods, selectedCargo]);

  // ---- Pricing inputs ----
  const subtotal = calculateCartSubtotal(items);
  const userDiscount = checkoutBootstrap.cartData?.userDiscount ?? 0;
  const campaigns = useMemo(
    () => checkoutBootstrap.cartData?.campaigns ?? [],
    [checkoutBootstrap.cartData?.campaigns],
  );
  const campaignBasis = Math.max(0, subtotal - userDiscount);
  const freeShippingCampaign = getFreeShippingCampaign(campaigns, campaignBasis);
  const isFreeShippingCoupon = Boolean(appliedCoupon?.isFreeShipping);
  const hasFreeShipping = isFreeShippingCoupon || Boolean(freeShippingCampaign?.isApplicable);
  const campaignDiscount = getCartDiscountCampaignTotal(campaigns, campaignBasis);
  const couponDiscount = Math.max(0, appliedCoupon?.discount ?? 0);
  const cargoPrice = selectedCargo?.price ?? 0;
  const isCardPayment = selectedMethod?.slug === 'credit_card';

  const pricingInput = {
    subtotal,
    userDiscount,
    campaignDiscount,
    couponDiscount,
    isFreeShippingCoupon,
    hasFreeShipping,
    cargoPrice,
    serviceFee: selectedMethod?.serviceFee ?? 0,
    commissionRate: selectedMethod?.commissionRate ?? 0,
  };

  // Single-payment total (no installment) feeds the installment rate lookup.
  const baseTotals = useMemo(
    () => calculateOrderTotals({ ...pricingInput, installment: null }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      subtotal,
      userDiscount,
      campaignDiscount,
      couponDiscount,
      isFreeShippingCoupon,
      hasFreeShipping,
      cargoPrice,
      selectedMethod?.serviceFee,
      selectedMethod?.commissionRate,
    ],
  );

  const card = useCardForm(baseTotals.singlePaymentTotal, isCardPayment);

  const totals = useMemo(
    () =>
      calculateOrderTotals({
        ...pricingInput,
        installment: card.selectedPlan
          ? {
              installment: card.selectedPlan.installment,
              perMonth: card.selectedPlan.perMonth,
            }
          : null,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      subtotal,
      userDiscount,
      campaignDiscount,
      couponDiscount,
      isFreeShippingCoupon,
      hasFreeShipping,
      cargoPrice,
      selectedMethod?.serviceFee,
      selectedMethod?.commissionRate,
      card.selectedPlan,
    ],
  );

  const effectiveCouponDiscount = getEffectiveCouponDiscount(
    couponDiscount,
    isFreeShippingCoupon,
    cargoPrice,
  );

  // Taslak siparişi bu ekranın durumuyla senkron tut (web ödeme sayfası paritesi):
  // ekrana girişte ve kargo/yöntem/taksit/tutar/kupon değiştikçe /order/token yazılır,
  // böylece başka bir platformun (ör. web) bıraktığı sipariş durumu onarılır ve
  // submit'teki tutar koruması bu ekranın ürettiği satırla karşılaştırır.
  const orderTokenSync = useOrderTokenSync({
    orderToken,
    selectedCargo,
    selectedMethod,
    shippingAddress,
    billingAddressId: sendInvoiceToSameAddress
      ? (shippingAddress?.id ?? null)
      : (billingAddress?.id ?? shippingAddress?.id ?? null),
    requestTotal: totals.finalTotal,
    installmentCount:
      isCardPayment && card.selectedPlan && card.selectedPlan.installment > 1
        ? card.selectedPlan.installment
        : 1,
    appliedCoupon,
    isPaused: useCallback(() => isOrderSubmittedRef.current, []),
    onCouponError: useCallback((message: string) => {
      setAppliedCoupon(null);
      setCouponError(message);
    }, []),
    onCouponRefresh: useCallback((coupon) => {
      setAppliedCoupon((previous) => ({
        code: coupon.code || previous?.code || '',
        discountType: coupon.discount_type || previous?.discountType || 'fixed',
        discountValue: previous?.discountValue ?? 0,
        discount: Number(coupon.discount ?? 0),
        isFreeShipping: Boolean(coupon.is_free_shipping),
        isCombinable: previous?.isCombinable,
      }));
      setCouponError(null);
    }, []),
  });

  // Auto-select the first non-blocked payment method once methods + total are ready.
  useEffect(() => {
    if (filteredMethods.length === 0) return;
    const stillValid =
      selectedMethod &&
      filteredMethods.some((m) => m.id === selectedMethod.id) &&
      !isMethodOverLimit(selectedMethod, baseTotals.singlePaymentTotal);
    if (stillValid) return;
    const fallback = filteredMethods.find(
      (m) => !isMethodOverLimit(m, baseTotals.singlePaymentTotal),
    );
    setSelectedMethod(fallback ?? null);
  }, [filteredMethods, selectedMethod, baseTotals.singlePaymentTotal]);

  // ---- Coupon actions ----
  const applyCoupon = useCallback(
    async (codeFromList?: string) => {
      const code = (codeFromList ?? couponInput).trim();
      if (!code) {
        setCouponError('Lütfen kupon kodu girin.');
        return;
      }
      if (!selectedMethod) {
        setCouponError('Kupon uygulamak için önce ödeme yöntemi seçin.');
        return;
      }
      setCouponError(null);
      try {
        const response = await validateCoupon.mutateAsync({
          couponCode: code,
          paymentMethodId: selectedMethod.id,
          shippingPrice: cargoPrice,
        });
        if (!response.valid) {
          setAppliedCoupon(null);
          setCouponError(response.message || 'Kupon doğrulanamadı.');
          return;
        }
        setAppliedCoupon(mapAppliedCoupon(response, code));
        setCouponInput(response.coupon_code || code);
      } catch (error) {
        setAppliedCoupon(null);
        setCouponError(getApiErrorMessage(error, 'Kupon doğrulanamadı.'));
      }
    },
    [couponInput, selectedMethod, cargoPrice, validateCoupon],
  );

  const clearCoupon = useCallback(async () => {
    setCouponError(null);
    try {
      await removeCoupon.mutateAsync();
    } catch (error) {
      setCouponError(getApiErrorMessage(error, 'Kupon kaldırılırken bir hata oluştu.'));
      return;
    }
    setAppliedCoupon(null);
    setCouponInput('');
  }, [removeCoupon]);

  // ---- Navigation ----
  const openProduct = useCallback(
    (item: CartLineItem) => {
      router.push(`/product/${item.slug ?? item.productId}` as never);
    },
    [router],
  );

  const goToAddAddress = useCallback(() => {
    router.push('/address-form' as never);
  }, [router]);

  const goToEditAddress = useCallback(
    (address: CheckoutAddress) => {
      router.push(`/address-form?id=${address.id}` as never);
    },
    [router],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/cart' as never);
  }, [router]);

  // ---- Submit gating ----
  const billingResolved = sendInvoiceToSameAddress || Boolean(billingAddress);
  const isSelectedInstallmentReady =
    card.selectedInstallment <= 1 || (Boolean(card.selectedPlan) && !card.isLoadingInstallments);
  const canSubmit =
    isAgreementChecked &&
    Boolean(orderTokenSync.summary) &&
    !orderTokenSync.isLoading &&
    !orderTokenSync.errorMessage &&
    Boolean(shippingAddress) &&
    Boolean(selectedCargo) &&
    Boolean(selectedMethod) &&
    billingResolved &&
    (!isCardPayment || (card.isValid && isSelectedInstallmentReady));

  const hint = useMemo(() => {
    if (orderTokenSync.isLoading) return 'Sipariş tutarları API’den alınıyor.';
    if (orderTokenSync.errorMessage) return 'Sipariş tutarları alınamadı.';
    if (isCardPayment && card.isRestrictedBin) return 'Bu kartla ödeme yapılamaz.';
    if (isCardPayment && !card.isValid) return 'Kart bilgilerini eksiksiz doldurun.';
    if (isCardPayment && card.selectedInstallment > 1 && card.isLoadingInstallments) {
      return 'Güncel taksit tutarları hesaplanıyor.';
    }
    if (isCardPayment && card.selectedPlan)
      return 'Taksitli ödeme için 3D doğrulamaya yönlendirileceksiniz.';
    return null;
  }, [
    isCardPayment,
    orderTokenSync.isLoading,
    orderTokenSync.errorMessage,
    card.isRestrictedBin,
    card.isValid,
    card.isLoadingInstallments,
    card.selectedInstallment,
    card.selectedPlan,
  ]);

  return {
    // async state
    isLoading: checkoutBootstrap.isLoading,
    isError: checkoutBootstrap.isError,
    refetchCart: checkoutBootstrap.refetchCart,
    retryCheckout: checkoutBootstrap.retryCheckout,
    refetchAddresses: addressesQuery.refetch,
    // cart
    items,
    isCartExpanded,
    toggleCart: () => setIsCartExpanded((v) => !v),
    openProduct,
    // shipping estimate + campaigns
    shippingEstimate: shippingQuery.data,
    campaigns,
    campaignBasis,
    freeShippingCampaign,
    hasFreeShipping,
    // address
    addresses,
    isAddressesLoading: addressesQuery.isPending,
    isAddressesError: addressesQuery.isError,
    shippingAddress,
    billingAddress,
    sendInvoiceToSameAddress,
    selectShippingAddress: setShippingAddress,
    selectBillingAddress: setBillingAddress,
    setSendInvoiceToSameAddress,
    goToAddAddress,
    goToEditAddress,
    // cargo
    cargoCompanies,
    isCargoLoading: cargoQuery.isPending && Boolean(shippingAddress),
    selectedCargo,
    selectCargo,
    // payment methods
    paymentMethods: filteredMethods,
    isPaymentMethodsLoading: paymentTypesQuery.isPending,
    selectedMethod,
    selectMethod: setSelectedMethod,
    isCardPayment,
    // card form
    card,
    // coupon
    couponInput,
    setCouponInput,
    applyCoupon,
    clearCoupon,
    couponError,
    appliedCoupon,
    isApplyingCoupon: validateCoupon.isPending,
    isRemovingCoupon: removeCoupon.isPending,
    coupons: couponsQuery.data ?? [],
    isCouponsLoading: couponsQuery.isPending,
    // totals
    subtotal,
    userDiscount,
    campaignDiscount,
    couponDiscount,
    effectiveCouponDiscount,
    isFreeShippingCoupon,
    cargoPrice,
    totals,
    singlePaymentTotal: baseTotals.singlePaymentTotal,
    orderSummary: orderTokenSync.summary,
    isOrderSummaryLoading: orderTokenSync.isLoading,
    orderSummaryError: orderTokenSync.errorMessage,
    // contracts + submit
    isAgreementChecked,
    setIsAgreementChecked,
    isSummaryExpanded,
    toggleSummary: () => setIsSummaryExpanded((v) => !v),
    canSubmit,
    hint,
    submitError,
    setSubmitError,
    goBack,
    // order token + raw context for place-order
    orderToken,
    syncOrderToken: orderTokenSync.syncNow,
    markOrderSubmitted,
    resumeOrderTokenSync,
  };
}

export type CheckoutController = ReturnType<typeof useCheckoutController>;
