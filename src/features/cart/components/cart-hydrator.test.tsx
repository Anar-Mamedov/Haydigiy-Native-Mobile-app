import { waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartHydrator } from './cart-hydrator';
import { mergeCartDto } from '@/services/cart.service';

const mockInvalidateQueries = jest.fn();
const mockAuthenticatedUser = { id: 1, name: 'Anar' };

jest.mock('@tanstack/react-query', () => {
  const actualReactQuery = jest.requireActual('@tanstack/react-query');

  return {
    ...actualReactQuery,
    useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  };
});

jest.mock('@/features/cart/api/cart.queries', () => ({
  useCartQuery: jest.fn(),
}));

jest.mock('@/features/auth/store/use-auth-store', () => ({
  useAuthStore: (selector: (state: { user: unknown }) => unknown) =>
    selector({ user: mockAuthenticatedUser }),
}));

jest.mock('@/services/cart.service', () => ({
  mergeCartDto: jest.fn(),
}));

describe('CartHydrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('catches background cart merge failures and still refreshes the cart query', async () => {
    (mergeCartDto as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    renderWithTamagui(<CartHydrator />);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });
  });
});
