import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { FreeShippingCampaignCard } from './free-shipping-campaign-card';
import { CartCampaign } from '@/types/cart.types';

const NOW = new Date('2026-06-17T00:00:00Z');
const IN_TWO_HOURS = new Date(NOW.getTime() + 2 * 3600 * 1000).toISOString();

function freeShipping(overrides: Partial<CartCampaign> = {}): CartCampaign {
  return {
    id: 1,
    name: 'Kargo Bedava Kampanyası',
    type: 'free_shipping',
    isApplicable: false,
    threshold: 500,
    remaining: 0,
    endDate: null,
    ...overrides,
  };
}

describe('FreeShippingCampaignCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders nothing without a free-shipping campaign', () => {
    const { toJSON } = renderWithTamagui(<FreeShippingCampaignCard campaigns={[]} subtotal={250} />);
    expect(toJSON()).toBeNull();
  });

  it('shows the remaining amount until the threshold is met', () => {
    renderWithTamagui(<FreeShippingCampaignCard campaigns={[freeShipping()]} subtotal={250} />);

    expect(screen.getByText('250 TL')).toBeTruthy();
    expect(screen.getByText(/ve üzeri siparişlerde ücretsiz kargo/)).toBeTruthy();
  });

  it('shows the success state once the threshold is met', () => {
    renderWithTamagui(<FreeShippingCampaignCard campaigns={[freeShipping()]} subtotal={600} />);
    expect(screen.getByText('Tebrikler! Kargo ücretsiz.')).toBeTruthy();
  });

  // Web paritesi: web bu kartta geri sayımı her durumda gizliyor
  // (`SHOW_FREE_SHIPPING_COUNTDOWN = false`); sayaç anahtarı açık olsa bile.
  it.each([
    ['the counter is on', { counter: 1, endDate: IN_TWO_HOURS }],
    ['the counter is off', { endDate: IN_TWO_HOURS }],
  ])('never shows the countdown when %s', (_label, overrides) => {
    renderWithTamagui(
      <FreeShippingCampaignCard campaigns={[freeShipping(overrides)]} subtotal={250} />,
    );

    expect(screen.getByText('Kargo Bedava Kampanyası')).toBeTruthy();
    expect(screen.queryByLabelText(/Kampanya bitişine/)).toBeNull();
    expect(screen.queryByText('Kampanya bitiş:')).toBeNull();
  });

  it('keeps its labels readable in dark theme', () => {
    renderWithTamagui(
      <FreeShippingCampaignCard campaigns={[freeShipping()]} subtotal={250} />,
      'dark',
    );

    expect(screen.getByText('Kargo Bedava Kampanyası')).toBeTruthy();
    expect(screen.getByText('250 TL')).toBeTruthy();
  });
});
