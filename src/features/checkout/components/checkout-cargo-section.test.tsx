import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CargoCompany } from '@/types/checkout.types';
import { CheckoutCargoSection } from './checkout-cargo-section';

const companies: CargoCompany[] = [
  {
    id: 1,
    name: 'Hepsijet',
    logo: '',
    price: 119.99,
    sortOrder: 1,
    toCityDistrict: null,
    toVillageRural: null,
  },
  {
    id: 2,
    name: 'Aras Kargo',
    logo: '',
    price: 124.99,
    sortOrder: 2,
    toCityDistrict: null,
    toVillageRural: null,
  },
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

  describe('teslimat kapsamı rozetleri', () => {
    function renderCoverage(coverage: Partial<CargoCompany>) {
      return renderWithTamagui(
        <CheckoutCargoSection
          companies={[{ ...companies[0], ...coverage }]}
          hasFreeShipping={false}
          isLoading={false}
          onSelect={jest.fn()}
          selectedId={1}
        />,
      );
    }

    it('shows nothing while the backend has no coverage answer', () => {
      renderCoverage({});

      expect(screen.queryByText(/merkezlerine/)).toBeNull();
      expect(screen.queryByText(/Köylere/)).toBeNull();
    });

    it('renders the affirmative and negative labels together', () => {
      renderCoverage({ toCityDistrict: true, toVillageRural: false });

      expect(screen.getByText('İl ve ilçe merkezlerine gider')).toBeTruthy();
      expect(screen.getByText('Köylere ve kırsal bölgelere gitmez')).toBeTruthy();
    });

    // The row is a single pressable, so the badges only reach assistive tech
    // through the row's own label.
    it('announces the coverage through the row label', () => {
      renderCoverage({ toCityDistrict: true, toVillageRural: true });

      expect(
        screen.getByLabelText(
          'Hepsijet. İl ve ilçe merkezlerine gider. Köylere ve kırsal bölgelere de gider',
        ),
      ).toBeTruthy();
    });
  });

  // HMA-75: Mağazadan Al satırında mağaza adresi ve konum linki.
  describe('Mağazadan Al', () => {
    const storePickup: CargoCompany = {
      id: 5,
      name: 'Mağazadan Al',
      logo: '',
      price: 0,
      sortOrder: 3,
      toCityDistrict: null,
      toVillageRural: null,
    };
    const ROW_LABEL = 'Mağazadan Al. Selçuk Mah. Gemili Park Karşısı Haydigiy Mağaza';
    const MAP_URL = 'https://maps.app.goo.gl/9FFKFdVv4tTwyjZKA';

    function renderWithStorePickup(onSelect = jest.fn()) {
      renderWithTamagui(
        <CheckoutCargoSection
          companies={[...companies, storePickup]}
          hasFreeShipping={false}
          isLoading={false}
          onSelect={onSelect}
          selectedId={1}
        />,
      );
      return onSelect;
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('shows the store address only under the store pickup row', () => {
      renderWithStorePickup();

      expect(screen.getAllByTestId('store-pickup-location')).toHaveLength(1);
      expect(screen.getByText(/Selçuk Mah\. Gemili Park Karşısı Haydigiy Mağaza/)).toBeTruthy();
    });

    it('opens the map from the link without selecting the row', () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      const onSelect = renderWithStorePickup();

      fireEvent.press(screen.getByLabelText('Konum İçin Tıklayın'));

      expect(openURL).toHaveBeenCalledWith(MAP_URL);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('still selects store pickup when the row itself is pressed', () => {
      const onSelect = renderWithStorePickup();

      fireEvent.press(screen.getByLabelText(ROW_LABEL));

      expect(onSelect).toHaveBeenCalledWith(storePickup);
    });

    // The row is one accessibility element, so the address joins its label and the link
    // becomes a custom action; activation still selects the row.
    it('exposes the address and the map link to screen readers', () => {
      const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
      const onSelect = renderWithStorePickup();
      const row = screen.getByLabelText(ROW_LABEL);

      expect(row.props.accessibilityActions).toEqual([
        { name: 'activate' },
        { name: 'openStorePickupMap', label: 'Konum İçin Tıklayın' },
      ]);

      fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'openStorePickupMap' } });
      expect(openURL).toHaveBeenCalledWith(MAP_URL);
      expect(onSelect).not.toHaveBeenCalled();

      fireEvent(row, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
      expect(onSelect).toHaveBeenCalledWith(storePickup);
    });

    it('adds no extra accessibility actions to other carriers', () => {
      renderWithStorePickup();

      expect(screen.getByLabelText('Aras Kargo').props.accessibilityActions).toBeUndefined();
    });
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
