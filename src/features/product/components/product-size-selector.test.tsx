import { fireEvent, screen } from '@testing-library/react-native';
import { ProductSizeSelector } from './product-size-selector';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductVariant } from '@/types/product.types';

const variants: ProductVariant[] = [
  { id: 'v-s', name: 'S', quantity: 4, price: 100, hasStock: true },
  { id: 'v-m', name: 'M', quantity: 0, price: 100, hasStock: false },
];

describe('ProductSizeSelector', () => {
  it('returns nothing when there are no variants', () => {
    const { toJSON } = renderWithTamagui(
      <ProductSizeSelector variants={[]} selectedVariant={null} onSelectVariant={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('selects an in-stock variant on press', () => {
    const onSelectVariant = jest.fn();

    renderWithTamagui(
      <ProductSizeSelector variants={variants} selectedVariant={null} onSelectVariant={onSelectVariant} />,
    );

    fireEvent.press(screen.getByLabelText('Beden S seçilebilir'));

    expect(onSelectVariant).toHaveBeenCalledWith(variants[0]);
  });

  it('does not select an out-of-stock variant', () => {
    const onSelectVariant = jest.fn();

    renderWithTamagui(
      <ProductSizeSelector variants={variants} selectedVariant={null} onSelectVariant={onSelectVariant} />,
    );

    fireEvent.press(screen.getByLabelText('Beden M stokta yok'));

    expect(onSelectVariant).not.toHaveBeenCalled();
  });

  it('renders sizing helper actions only when their handlers are provided', () => {
    renderWithTamagui(
      <ProductSizeSelector
        variants={variants}
        selectedVariant={variants[0]}
        onSelectVariant={jest.fn()}
        onSizeChartPress={jest.fn()}
        onSizeCalculatorPress={jest.fn()}
      />,
    );

    expect(screen.getByText('Beden Tablosu')).toBeTruthy();
    expect(screen.getByText('Bedenimi hesapla')).toBeTruthy();
  });
});
