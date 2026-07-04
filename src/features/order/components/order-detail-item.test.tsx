import { fireEvent, screen } from '@testing-library/react-native';
import { OrderDetailItem } from './order-detail-item';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { OrderDetailItem as OrderDetailItemModel } from '@/types/order.types';

function makeItem(overrides: Partial<OrderDetailItemModel> = {}): OrderDetailItemModel {
  return {
    id: 1,
    name: 'Taş Detaylı Abiye',
    variantName: 'S',
    slug: 'tas-detayli-abiye',
    image: null,
    quantity: 1,
    price: 999.99,
    kind: 'normal',
    variantId: 77,
    ...overrides,
  };
}

describe('OrderDetailItem', () => {
  // Web paritesi: iptal/iade artık mümkün değilse teslim edilen ürün
  // "Tekrar Satın Al" aksiyonu taşır (Değerlendir ile yan yana).
  it('shows the repurchase action alongside review and fires the callback', () => {
    const onRepurchase = jest.fn();
    renderWithTamagui(
      <OrderDetailItem
        item={makeItem()}
        onPressProduct={jest.fn()}
        onRepurchase={onRepurchase}
        onReview={jest.fn()}
        repurchasable
        reviewState="available"
      />,
    );

    expect(screen.getByText('Değerlendir')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Tekrar satın al'));
    expect(onRepurchase).toHaveBeenCalledTimes(1);
  });

  it('marks cancelled lines with a strike line and the cancellation date', () => {
    renderWithTamagui(
      <OrderDetailItem
        item={makeItem({ kind: 'cancelled', cancelledAt: '04 Tem 2026 - 14:49' })}
        onPressProduct={jest.fn()}
      />,
    );

    expect(screen.getByTestId('cancelled-strike-line')).toBeTruthy();
    expect(screen.getByText('İptal Tarihi')).toBeTruthy();
    expect(screen.getByText('04 Tem 2026 - 14:49')).toBeTruthy();
    expect(screen.queryByLabelText('Tekrar satın al')).toBeNull();
  });
});
