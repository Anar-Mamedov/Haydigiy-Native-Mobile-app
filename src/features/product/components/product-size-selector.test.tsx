import { fireEvent, screen } from '@testing-library/react-native';
import { ProductSizeSelector } from './product-size-selector';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductVariant } from '@/types/product.types';
import { Theme } from 'tamagui';

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

  it('renders a skeleton while variants are loading', () => {
    renderWithTamagui(
      <ProductSizeSelector isLoading variants={[]} selectedVariant={null} onSelectVariant={jest.fn()} />,
    );

    expect(screen.getByLabelText('Beden alanı yükleniyor')).toBeTruthy();
    expect(screen.getByLabelText('Beden seçenekleri yükleniyor')).toBeTruthy();
  });

  it('selects an in-stock variant on press', () => {
    const onSelectVariant = jest.fn();

    renderWithTamagui(
      <ProductSizeSelector variants={variants} selectedVariant={null} onSelectVariant={onSelectVariant} />,
    );

    fireEvent.press(screen.getByLabelText('Beden S seçilebilir'));

    expect(onSelectVariant).toHaveBeenCalledWith(variants[0]);
  });

  it('selects an out-of-stock variant too, so the footer can offer a stock notification', () => {
    const onSelectVariant = jest.fn();

    renderWithTamagui(
      <ProductSizeSelector variants={variants} selectedVariant={null} onSelectVariant={onSelectVariant} />,
    );

    fireEvent.press(screen.getByLabelText('Beden M stokta yok, gelince haber ver'));

    expect(onSelectVariant).toHaveBeenCalledWith(variants[1]);
  });

  it('disables every size and clears its selected appearance when the product is closed for sale', () => {
    const onSelectVariant = jest.fn();
    const selector = (theme: 'light' | 'dark', isApprovedForSale: boolean) => (
      <Theme name={theme}>
        <ProductSizeSelector
          isApprovedForSale={isApprovedForSale}
          onSelectVariant={onSelectVariant}
          selectedVariant={variants[0]}
          variants={variants}
        />
      </Theme>
    );
    const { rerender } = renderWithTamagui(selector('light', true));

    expect(screen.getByLabelText('Beden S seçilebilir')).toBeSelected();

    for (const theme of ['light', 'dark', 'light'] as const) {
      rerender(selector(theme, false));

      for (const variant of variants) {
        const button = screen.getByLabelText(`Beden ${variant.name} satışa kapalı`);
        expect(button).toBeDisabled();
        expect(button).not.toBeSelected();
        expect(screen.getByText(variant.name)).toHaveStyle({ textDecorationLine: 'line-through' });
        fireEvent.press(button);
      }
      expect(screen.getByText('Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.')).toBeTruthy();
    }

    expect(onSelectVariant).not.toHaveBeenCalled();

    rerender(selector('dark', true));
    expect(screen.queryByText('Ürün şu an satışa kapalıdır, daha sonra tekrar deneyiniz.')).toBeNull();
    fireEvent.press(screen.getByLabelText('Beden S seçilebilir'));
    expect(onSelectVariant).toHaveBeenCalledWith(variants[0]);
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
