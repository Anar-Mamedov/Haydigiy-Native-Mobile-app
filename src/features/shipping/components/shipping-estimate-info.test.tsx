import { screen } from '@testing-library/react-native';
import { ShippingEstimateInfo } from './shipping-estimate-info';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ShippingEstimate } from '@/types/shipping.types';

const baseEstimate: ShippingEstimate = {
  timeLeft: '02:13:00',
  dispatchDayHuman: 'bugün',
  message: 'Bugün sipariş verirsen yarın kargoda.',
  avgDeliveryDays: 3,
  estimatedDeliveryDayHuman: '03 Haziran Çarşamba',
  deliveryWarning: null,
};

describe('ShippingEstimateInfo', () => {
  it('shows the API dispatch message with the trailing period stripped', () => {
    renderWithTamagui(<ShippingEstimateInfo estimate={baseEstimate} />);

    expect(screen.getByText('Bugün sipariş verirsen yarın kargoda')).toBeTruthy();
    expect(screen.getByText('03 Haziran Çarşamba kapında!')).toBeTruthy();
  });

  it('renders the loading placeholder and hides the delivery row when no estimate is provided', () => {
    renderWithTamagui(<ShippingEstimateInfo estimate={null} />);

    expect(screen.getByText('Yükleniyor...')).toBeTruthy();
    expect(screen.queryByText(/kapında!/)).toBeNull();
  });

  it('uses the holiday label and renders the warning message for a holiday_period warning', () => {
    const estimate: ShippingEstimate = {
      ...baseEstimate,
      deliveryWarning: {
        show: true,
        type: 'holiday_period',
        message:
          'Siparişiniz bayrama yetişmeyebilir. Tahmini teslimatınız bayram sonrası: 03 Haziran Çarşamba.',
      },
    };

    renderWithTamagui(<ShippingEstimateInfo estimate={estimate} variant="product" />);

    expect(screen.getByText('Tahmini teslimat (bayram sonrası):')).toBeTruthy();
    expect(
      screen.getByText(/Siparişiniz bayrama yetişmeyebilir/),
    ).toBeTruthy();
  });

  it('uses the default delivery label when there is no active warning', () => {
    renderWithTamagui(<ShippingEstimateInfo estimate={baseEstimate} />);

    expect(screen.getByText('Tahmini Teslim:')).toBeTruthy();
  });
});
