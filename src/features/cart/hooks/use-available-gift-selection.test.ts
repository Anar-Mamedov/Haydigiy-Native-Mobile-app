import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAvailableGiftSelection } from './use-available-gift-selection';
import { AvailableGift } from '@/types/cart.types';

const mockMutate = jest.fn();
let mockIsPending = false;
let mockVariables: { gift: AvailableGift; variantId: string } | undefined;

jest.mock('@/features/cart/api/cart.queries', () => ({
  useAddCartGiftMutation: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
    variables: mockVariables,
  }),
}));

const GIFT: AvailableGift = {
  productId: '77',
  campaignId: '12',
  name: 'Pamuklu Çorap',
  imageUrl: '',
  quantity: 1,
  sizes: [
    { variantId: '3001', name: 'S', availableQuantity: 5, canAdd: true },
    { variantId: '3002', name: 'M', availableQuantity: 0, canAdd: false },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPending = false;
  mockVariables = undefined;
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

describe('useAvailableGiftSelection', () => {
  it('cannot add before a size is chosen', () => {
    const { result } = renderHook(() => useAvailableGiftSelection());

    expect(result.current.canAdd(GIFT)).toBe(false);
    act(() => result.current.add(GIFT));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('adds the gift with the chosen size', () => {
    const { result } = renderHook(() => useAvailableGiftSelection());

    act(() => result.current.selectSize('77', '3001'));
    expect(result.current.canAdd(GIFT)).toBe(true);

    act(() => result.current.add(GIFT));
    expect(mockMutate).toHaveBeenCalledWith({ gift: GIFT, variantId: '3001' }, expect.anything());
  });

  it('never sends a size that has no stock for the gift', () => {
    const { result } = renderHook(() => useAvailableGiftSelection());

    act(() => result.current.selectSize('77', '3002'));
    act(() => result.current.add(GIFT));

    expect(result.current.canAdd(GIFT)).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('shows the backend reason when the gift cannot be added', () => {
    const { result } = renderHook(() => useAvailableGiftSelection());

    act(() => result.current.selectSize('77', '3001'));
    act(() => result.current.add(GIFT));
    act(() =>
      mockMutate.mock.calls[0][1].onError({
        isAxiosError: true,
        response: { status: 422, data: { message: 'Seçilen bedende yeterli stok bulunmamaktadır.' } },
      }),
    );

    expect(Alert.alert).toHaveBeenCalledWith('Hata', 'Seçilen bedende yeterli stok bulunmamaktadır.');
  });

  it('adds one gift at a time', () => {
    mockIsPending = true;
    mockVariables = { gift: GIFT, variantId: '3001' };
    const { result } = renderHook(() => useAvailableGiftSelection());

    act(() => result.current.selectSize('77', '3001'));
    act(() => result.current.add(GIFT));

    expect(result.current.addingProductId).toBe('77');
    expect(result.current.canAdd(GIFT)).toBe(false);
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
