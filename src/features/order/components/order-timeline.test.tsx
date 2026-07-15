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

  it('renders the cancelled state for cancelled orders', () => {
    renderWithTamagui(<OrderTimeline statusId={4} />);

    expect(screen.getByText('Sipariş İptal Edildi')).toBeTruthy();
    expect(screen.getByText('Bu sipariş iptal edilmiştir.')).toBeTruthy();
  });
});
