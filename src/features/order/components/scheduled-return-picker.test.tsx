import { fireEvent, screen } from '@testing-library/react-native';
import { ScheduledReturnPicker } from './scheduled-return-picker';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { UseScheduledReturn } from '../hooks/use-scheduled-return';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return {
    AppSelect: ({ label }: { label: string }) =>
      React.createElement(View, { accessibilityLabel: label }),
  };
});

const scheduledReturn: UseScheduledReturn = {
  availableDates: [],
  canSchedule: false,
  cancelPickup: jest.fn(),
  dateOptions: [],
  datesError: null,
  datesLoading: false,
  endDate: '2026-07-15',
  fetchDates: jest.fn(),
  hasFetchedDates: false,
  pickupSubmitting: false,
  refetchAddresses: jest.fn(),
  resolvedAddress: null,
  savedAddresses: [],
  savedLoading: false,
  selectedAddressId: null,
  selectedDate: null,
  setEndDate: jest.fn(),
  setSelectedAddressId: jest.fn(),
  setSelectedDate: jest.fn(),
  setStartDate: jest.fn(),
  startDate: '2026-07-01',
  submitPickup: jest.fn(),
  today: '2026-07-01',
};

describe('ScheduledReturnPicker', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('opens the shared full-screen address form instead of an in-sheet address modal', () => {
    renderWithTamagui(<ScheduledReturnPicker sr={scheduledReturn} />);

    fireEvent.press(screen.getByLabelText('Yeni Adres Ekle'));

    expect(mockPush).toHaveBeenCalledWith('/(tabs)/address-form');
  });
});
