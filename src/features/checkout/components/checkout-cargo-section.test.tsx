import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CargoCompany } from '@/types/checkout.types';
import { CheckoutCargoSection } from './checkout-cargo-section';

const companies: CargoCompany[] = [
  { id: 1, name: 'Hepsijet', logo: '', price: 119.99, sortOrder: 1 },
  { id: 2, name: 'Aras Kargo', logo: '', price: 124.99, sortOrder: 2 },
];

describe('CheckoutCargoSection', () => {
  it('selects a cargo company when the checkout is not locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutCargoSection
        companies={companies}
        hasFreeShipping={false}
        isLoading={false}
        onSelect={onSelect}
        selectedId={1}
      />,
    );

    fireEvent.press(screen.getByLabelText('Aras Kargo'));

    expect(onSelect).toHaveBeenCalledWith(companies[1]);
  });

  it('ignores presses while the checkout is locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutCargoSection
        companies={companies}
        disabled
        hasFreeShipping={false}
        isLoading={false}
        onSelect={onSelect}
        selectedId={1}
      />,
    );

    fireEvent.press(screen.getByLabelText('Aras Kargo'));

    expect(onSelect).not.toHaveBeenCalled();
  });

  describe('ücretsiz kargo sayacı', () => {
    const NOW = new Date('2026-06-17T00:00:00Z');
    const IN_TWO_HOURS = new Date(NOW.getTime() + 2 * 3600 * 1000).toISOString();

    function renderFreeShipping(
      overrides: Partial<React.ComponentProps<typeof CheckoutCargoSection>> = {},
    ) {
      return renderWithTamagui(
        <CheckoutCargoSection
          companies={companies}
          hasFreeShipping
          isLoading={false}
          onSelect={jest.fn()}
          selectedId={1}
          {...overrides}
        />,
      );
    }

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(NOW);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('counts down next to the free-shipping badge when the counter is 1', () => {
      renderFreeShipping({ campaignCounter: 1, campaignEndDate: IN_TWO_HOURS });
      expect(screen.getAllByLabelText(/Kampanya bitişine/).length).toBe(companies.length);
    });

    // Ücretsiz kargo kupondan da gelebiliyor; sayaç yalnızca kampanyanın kendi
    // anahtarı açıkken gösterilir.
    it('hides the countdown when the campaign counter is off', () => {
      renderFreeShipping({ campaignEndDate: IN_TWO_HOURS });
      expect(screen.queryByLabelText(/Kampanya bitişine/)).toBeNull();
    });

    it('hides the countdown when the campaign has no end date', () => {
      renderFreeShipping({ campaignCounter: 1, campaignEndDate: null });
      expect(screen.queryByLabelText(/Kampanya bitişine/)).toBeNull();
    });
  });
});
