import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { StandardCampaignCard } from './standard-campaign-card';
import { CartCampaign } from '@/types/cart.types';
import { formatCurrency } from '@/utils/format-currency';

const NOW = new Date('2026-06-17T00:00:00Z');
const IN_TWO_HOURS = new Date(NOW.getTime() + 2 * 3600 * 1000).toISOString();

function cartDiscount(overrides: Partial<CartCampaign> = {}): CartCampaign {
  return {
    id: 3,
    name: 'Sepette %10 indirim',
    type: 'cart_discount',
    isApplicable: false,
    threshold: 1000,
    remaining: 0,
    endDate: null,
    ...overrides,
  };
}

function freeShipping(overrides: Partial<CartCampaign> = {}): CartCampaign {
  return {
    id: 1,
    name: 'Ücretsiz Kargo',
    type: 'free_shipping',
    isApplicable: false,
    threshold: 500,
    remaining: 0,
    endDate: null,
    ...overrides,
  };
}

describe('StandardCampaignCard', () => {
  it('renders nothing when no campaign has anything to show', () => {
    const { toJSON } = renderWithTamagui(<StandardCampaignCard campaigns={[]} subtotal={250} />);
    expect(toJSON()).toBeNull();
  });

  it('opens itself when there is a single campaign', () => {
    renderWithTamagui(<StandardCampaignCard campaigns={[cartDiscount()]} subtotal={250} />);

    expect(screen.getByText('1 Kampanya')).toBeTruthy();
    expect(screen.getByText('Sepette %10 indirim')).toBeTruthy();
    expect(screen.getByText('750 TL eksik')).toBeTruthy();
  });

  // Birden fazla kampanyada liste kapalı başlar; özet satırı ekranı şişirmeden
  // kampanya sayısını gösterir.
  it('starts collapsed with more than one campaign and opens on press', () => {
    renderWithTamagui(
      <StandardCampaignCard campaigns={[cartDiscount(), freeShipping()]} subtotal={250} />,
    );

    expect(screen.getByText('2 Kampanya')).toBeTruthy();
    expect(screen.queryByText('Sepette %10 indirim')).toBeNull();

    fireEvent.press(screen.getByLabelText('Kampanyalar, 2 kampanya'));

    expect(screen.getByText('Sepette %10 indirim')).toBeTruthy();
    expect(screen.getByText('Ücretsiz Kargo')).toBeTruthy();
  });

  // Ücretsiz kargo satırı "kaldı", diğer kampanyalar "eksik" der (web paritesi).
  it('labels the free-shipping remainder differently from other campaigns', () => {
    renderWithTamagui(<StandardCampaignCard campaigns={[freeShipping()]} subtotal={250} />);
    expect(screen.getByText('250 TL kaldı')).toBeTruthy();
  });

  it('shows the applied discount and message once the threshold is met', () => {
    renderWithTamagui(
      <StandardCampaignCard
        campaigns={[cartDiscount({ discount: 50, message: '50 TL indirim uygulandı.' })]}
        subtotal={1000}
      />,
    );

    expect(screen.getByText(`-${formatCurrency(50)}`)).toBeTruthy();
    expect(screen.getByText('50 TL indirim uygulandı.')).toBeTruthy();
  });

  it('falls back to a generated message when the backend sends none', () => {
    renderWithTamagui(<StandardCampaignCard campaigns={[cartDiscount()]} subtotal={1000} />);
    expect(screen.getByText('Sepette %10 indirim sepette uygulandı.')).toBeTruthy();
  });

  describe('countdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(NOW);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('shows the countdown only when the backend counter is 1', () => {
      renderWithTamagui(
        <StandardCampaignCard
          campaigns={[cartDiscount({ counter: 1, endDate: IN_TWO_HOURS })]}
          subtotal={250}
        />,
      );

      expect(screen.getByLabelText(/Kampanya bitişine/)).toBeTruthy();
    });

    // Bitiş tarihi dolu olsa bile sayaç anahtarı kapalıysa geri sayım gizlenir.
    it('hides the countdown when the counter is off', () => {
      renderWithTamagui(
        <StandardCampaignCard
          campaigns={[cartDiscount({ endDate: IN_TWO_HOURS })]}
          subtotal={250}
        />,
      );

      expect(screen.queryByLabelText(/Kampanya bitişine/)).toBeNull();
    });

    // Sayaç açık ama tarih gelmediğinde ekranda "NaN" değil, hiçbir şey olmalı.
    it('hides the countdown when the counter is on but the end date is missing', () => {
      renderWithTamagui(
        <StandardCampaignCard campaigns={[cartDiscount({ counter: 1 })]} subtotal={250} />,
      );

      expect(screen.queryByLabelText(/Kampanya bitişine/)).toBeNull();
    });
  });

  it('keeps the campaign labels readable in dark theme', () => {
    renderWithTamagui(
      <StandardCampaignCard campaigns={[cartDiscount()]} subtotal={250} />,
      'dark',
    );

    expect(screen.getByText('Kampanyalar')).toBeTruthy();
    expect(screen.getByText('Sepette %10 indirim')).toBeTruthy();
    expect(screen.getByText('750 TL eksik')).toBeTruthy();
  });
});
