import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useOrderMergeOffer } from './use-order-merge-offer';
import { ORDER_MERGE_FALLBACK_TEXTS } from '../api/order-merge.mapper';
import type { OrderMergeOffer } from '@/types/order-merge.types';

const mockPush = jest.fn();
const mockLoadOffer = jest.fn();
const mockCodMerge = jest.fn();
const mockCardPrepare = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('../api/order-merge.queries', () => ({
  useOrderMergeOfferLoader: () => mockLoadOffer,
}));

jest.mock('../api/order-merge.mutations', () => ({
  useMergeCartIntoCodOrderMutation: () => ({ isPending: false, mutateAsync: mockCodMerge }),
  usePrepareCardMergeMutation: () => ({ isPending: false, mutateAsync: mockCardPrepare }),
}));

const CARD_OFFER: OrderMergeOffer = {
  orderId: 12450,
  orderNo: 'HG100254',
  paymentKind: 'card',
  title: 'Onaylanmış Siparişiniz Var!',
  description: '#HG100254 numaralı siparişinize ekstra kargo ödemeden ekleyebilirsiniz.',
  amountText: '250,00 TL',
  installmentText: 'Peşin Fiyatına 3 Taksit',
  confirmLabel: 'Mevcut Siparişime Ekle',
  continueLabel: 'Yeni Sipariş Olarak Devam Et',
};
const COD_OFFER: OrderMergeOffer = { ...CARD_OFFER, paymentKind: 'cod', installmentText: null };

function setup() {
  const onContinueAsNewOrder = jest.fn();
  const hook = renderHook(() => useOrderMergeOffer({ onContinueAsNewOrder }));
  return { ...hook, onContinueAsNewOrder };
}

async function openOffer(result: ReturnType<typeof setup>['result'], offer: OrderMergeOffer) {
  mockLoadOffer.mockResolvedValue(offer);
  let opened = false;
  await act(async () => {
    opened = await result.current.offerIfEligible();
  });
  return opened;
}

describe('useOrderMergeOffer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  it('opens the offer when the customer has a mergeable order', async () => {
    const { result } = setup();

    expect(await openOffer(result, CARD_OFFER)).toBe(true);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.offer).toEqual(CARD_OFFER);
    expect(result.current.isChecking).toBe(false);
  });

  it('lets the normal checkout continue when there is no offer', async () => {
    const { result } = setup();
    mockLoadOffer.mockResolvedValue(null);

    let opened = true;
    await act(async () => {
      opened = await result.current.offerIfEligible();
    });

    expect(opened).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  // Teklif isteğe bağlı: kontrol başarısızsa müşteri her zamanki gibi ödemeye geçer.
  it('lets the normal checkout continue when the eligibility check fails', async () => {
    const { result } = setup();
    mockLoadOffer.mockRejectedValue(new Error('network'));

    let opened = true;
    await act(async () => {
      opened = await result.current.offerIfEligible();
    });

    expect(opened).toBe(false);
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('adds the cart to a cash-on-delivery order and opens its detail', async () => {
    const { result } = setup();
    await openOffer(result, COD_OFFER);
    mockCodMerge.mockResolvedValue({ orderNo: 'HG100254', message: 'Ürünler eklendi.' });

    await act(async () => {
      result.current.accept();
    });

    expect(mockCodMerge).toHaveBeenCalledWith({ orderId: 12450, orderNo: 'HG100254' });
    expect(mockCardPrepare).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/order/12450');
    expect(Alert.alert).toHaveBeenCalledWith('Başarılı', 'Ürünler eklendi.');
    expect(result.current.isOpen).toBe(false);
  });

  it('opens the card step with the prepared draft for a card order', async () => {
    const { result } = setup();
    await openOffer(result, CARD_OFFER);
    mockCardPrepare.mockResolvedValue({
      orderToken: 'tok-1',
      parentOrderNo: 'HG100254',
      amount: 250,
      installmentCount: 3,
      cargoId: 4,
      paymentMethodId: 1,
    });

    await act(async () => {
      result.current.accept();
    });

    expect(mockCodMerge).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/checkout/merge-payment',
      params: {
        orderToken: 'tok-1',
        orderNo: 'HG100254',
        amount: '250',
        installmentCount: '3',
        cargoId: '4',
        paymentMethodId: '1',
      },
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('shows why the merge failed and keeps the customer in the cart', async () => {
    const { result } = setup();
    await openOffer(result, CARD_OFFER);
    mockCardPrepare.mockRejectedValue(new Error('Siparişiniz depoda toplama sürecine girdi.'));

    await act(async () => {
      result.current.accept();
    });

    expect(mockPush).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Siparişiniz depoda toplama sürecine girdi.');
  });

  it('uses the fallback message when the failure has none', async () => {
    const { result } = setup();
    await openOffer(result, COD_OFFER);
    mockCodMerge.mockRejectedValue({});

    await act(async () => {
      result.current.accept();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Hata', ORDER_MERGE_FALLBACK_TEXTS.codFailed);
  });

  it('continues as a new order without any merge request', async () => {
    const { result, onContinueAsNewOrder } = setup();
    await openOffer(result, CARD_OFFER);

    act(() => result.current.continueAsNewOrder());

    expect(onContinueAsNewOrder).toHaveBeenCalledTimes(1);
    expect(mockCodMerge).not.toHaveBeenCalled();
    expect(mockCardPrepare).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('only closes when the sheet is dismissed', async () => {
    const { result, onContinueAsNewOrder } = setup();
    await openOffer(result, CARD_OFFER);

    act(() => result.current.dismiss());

    expect(result.current.isOpen).toBe(false);
    expect(onContinueAsNewOrder).not.toHaveBeenCalled();
  });

  it('sends a single merge request on a double tap', async () => {
    const { result } = setup();
    await openOffer(result, COD_OFFER);
    let resolveMerge: (value: unknown) => void = () => undefined;
    mockCodMerge.mockReturnValue(new Promise((resolve) => (resolveMerge = resolve)));

    await act(async () => {
      result.current.accept();
      result.current.accept();
      resolveMerge({ orderNo: 'HG100254', message: 'ok' });
    });

    expect(mockCodMerge).toHaveBeenCalledTimes(1);
  });
});
