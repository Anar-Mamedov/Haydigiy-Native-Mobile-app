import { waitFor } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CartHydrator } from './cart-hydrator';
import { mergeCartDto } from '@/services/cart.service';
import { createSessionOnceGate } from '../utils/session-once-gate';

const mockInvalidateQueries = jest.fn();
const mockAuthenticatedUser = { id: 1, name: 'Anar' };
let mockUser: unknown = mockAuthenticatedUser;

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
    selector({ user: mockUser }),
}));

jest.mock('@/services/cart.service', () => ({
  mergeCartDto: jest.fn(),
}));

describe('CartHydrator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = mockAuthenticatedUser;
  });

  it('catches background cart merge failures and still refreshes the cart query', async () => {
    (mergeCartDto as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

    renderWithTamagui(<CartHydrator mergeGate={createSessionOnceGate()} />);

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['cart'] });
    });
  });

  // Android MainActivity yeniden oluşturulunca (hazır durumda başlatma) kök ağaç yeniden mount olur.
  it('does not merge again when the tree remounts within the same signed-in session', async () => {
    (mergeCartDto as jest.Mock).mockResolvedValue(undefined);
    const gate = createSessionOnceGate();

    const { unmount } = renderWithTamagui(<CartHydrator mergeGate={gate} />);
    await waitFor(() => expect(mockInvalidateQueries).toHaveBeenCalledTimes(1));
    unmount();

    renderWithTamagui(<CartHydrator mergeGate={gate} />);

    expect(mergeCartDto).toHaveBeenCalledTimes(1);
  });

  it('merges the guest cart again after signing out and back in', async () => {
    (mergeCartDto as jest.Mock).mockResolvedValue(undefined);
    const gate = createSessionOnceGate();

    const { rerender } = renderWithTamagui(<CartHydrator mergeGate={gate} />);
    await waitFor(() => expect(mergeCartDto).toHaveBeenCalledTimes(1));

    mockUser = null;
    rerender(<CartHydrator mergeGate={gate} />);
    mockUser = { ...mockAuthenticatedUser };
    rerender(<CartHydrator mergeGate={gate} />);

    await waitFor(() => expect(mergeCartDto).toHaveBeenCalledTimes(2));
  });
});
