import { screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderTimeline } from './order-timeline';

jest.mock('@/components/ui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  return {
    SectionCard: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

describe('OrderTimeline', () => {
  it('renders the frontend-style vertical timeline with reached step dates', () => {
    renderWithTamagui(
      <OrderTimeline
        statusId={7}
        timelineDates={{
          orderedAt: '04 Tem 2026 - 16:09',
          confirmedAt: '04 Tem 2026 - 16:09',
          preparedAt: null,
          shippedAt: '06 Tem 2026 - 13:15',
          deliveredAt: '08 Tem 2026 - 12:00',
        }}
      />,
    );

    expect(screen.getByText('Sipariş Alındı')).toBeTruthy();
    expect(screen.getByText('Onaylandı')).toBeTruthy();
    expect(screen.getByText('Hazırlanıyor')).toBeTruthy();
    expect(screen.getByText('Kargoya Verildi')).toBeTruthy();
    expect(screen.getByText('Teslim Edildi')).toBeTruthy();
    expect(screen.getAllByText('04 Tem 2026 - 16:09')).toHaveLength(2);
    expect(screen.getByText('06 Tem 2026 - 13:15')).toBeTruthy();
    expect(screen.queryByText('08 Tem 2026 - 12:00')).toBeNull();
  });

  it('checks the current step too, so a shipped order is not read as still preparing', () => {
    renderWithTamagui(
      <OrderTimeline
        statusId={7}
        timelineDates={{
          orderedAt: '23 Eyl 2026 - 16:39',
          confirmedAt: '23 Eyl 2026 - 16:41',
          preparedAt: null,
          shippedAt: '24 Eyl 2026 - 16:57',
          deliveredAt: null,
        }}
      />,
    );

    expect(screen.getAllByLabelText(/: tamamlandı/)).toHaveLength(4);
    expect(
      screen.getByLabelText('Kargoya Verildi: tamamlandı, mevcut aşama, 24 Eyl 2026 - 16:57'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Teslim Edildi: bekleniyor')).toBeTruthy();
  });

  it('checks every step of a delivered order', () => {
    renderWithTamagui(<OrderTimeline statusId={8} />, 'dark');

    expect(screen.getAllByLabelText(/: tamamlandı/)).toHaveLength(5);
    expect(screen.getByLabelText('Teslim Edildi: tamamlandı, mevcut aşama')).toBeTruthy();
  });

  it('renders the cancelled state for cancelled orders', () => {
    renderWithTamagui(<OrderTimeline statusId={4} />);

    expect(screen.getByText('Sipariş İptal Edildi')).toBeTruthy();
    expect(screen.getByText('Bu sipariş iptal edilmiştir.')).toBeTruthy();
  });
});
