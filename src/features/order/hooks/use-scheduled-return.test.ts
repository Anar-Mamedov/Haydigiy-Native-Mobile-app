import { renderHook } from '@testing-library/react-native';
import { useScheduledReturn } from './use-scheduled-return';

const mockRefetch = jest.fn();

// Mirrors the real useFocusEffect contract: runs as an effect re-triggered only
// when the (useCallback-memoized) callback identity changes.
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    useFocusEffect: (callback: () => void) => {
      useEffect(callback, [callback]);
    },
  };
});

jest.mock('../api/return.queries', () => ({
  useSavedAddressesQuery: () => ({ data: [], isPending: false, refetch: mockRefetch }),
}));

jest.mock('../api/hepsijet.mutations', () => ({
  useCancelHepsijetDeliveryMutation: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useHepsijetAvailableDatesMutation: () => ({ isPending: false, mutateAsync: jest.fn() }),
  useSendHepsijetDeliveryMutation: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

describe('useScheduledReturn', () => {
  beforeEach(() => {
    mockRefetch.mockClear();
  });

  it('refetches saved addresses when the return screen regains focus while enabled', () => {
    renderHook(() => useScheduledReturn(null, true));

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('does not refetch saved addresses on focus while disabled', () => {
    renderHook(() => useScheduledReturn(null, false));

    expect(mockRefetch).not.toHaveBeenCalled();
  });
});
