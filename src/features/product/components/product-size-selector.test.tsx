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

describe('ProductSizeSelector — bedene özel indirim rozeti', () => {
  // Süet pijama: ürün 339,99 TL; yalnızca 2XL'in kendi (ucuz) fiyatı var, 3XL ucuz ama tükendi.
  const pajamaSizes: ProductVariant[] = [
    { id: 'v-l', name: 'L', quantity: 18, price: 0, hasStock: true },
    { id: 'v-2xl', name: '2XL', quantity: 9, price: 269.99, hasStock: true },
    { id: 'v-3xl', name: '3XL', quantity: 0, price: 249.99, hasStock: false },
  ];

  function renderPajama(props: Partial<React.ComponentProps<typeof ProductSizeSelector>> = {}, theme?: 'light' | 'dark') {
    return renderWithTamagui(
      <ProductSizeSelector
        onSelectVariant={jest.fn()}
        productPricing={{ price: 339.99 }}
        selectedVariant={null}
        variants={pajamaSizes}
        {...props}
      />,
      theme,
    );
  }

  it('shows the whole discount on a size of an already discounted product', () => {
    // Regresyon: 209,99 TL'lik ürün %5 indirimle 199,99 TL, S bedeni 159,99 TL. S seçilince fiyat
    // kutusu %24 gösteriyor; rozet indirimli fiyata göre %20 diyordu.
    renderWithTamagui(
      <ProductSizeSelector
        onSelectVariant={jest.fn()}
        productPricing={{ firstPrice: 209.99, price: 199.99 }}
        selectedVariant={null}
        variants={[
          { id: 'v-s', name: 'S', quantity: 23, price: 159.99, hasStock: true },
          { id: 'v-l', name: 'L', quantity: 6, price: 0, hasStock: true },
        ]}
      />,
    );

    expect(screen.getByText('%24')).toBeTruthy();
    expect(screen.queryByText('%20')).toBeNull();
    expect(screen.getByLabelText('Beden S, yüzde 24 indirimli seçilebilir')).toBeTruthy();
    expect(screen.queryByTestId('size-discount-badge-v-l')).toBeNull();
  });

  it('marks the size sold below the product price with its discount rate', () => {
    renderPajama();

    expect(screen.getByTestId('size-discount-badge-v-2xl')).toBeTruthy();
    expect(screen.getByText('%21')).toBeTruthy();
    expect(screen.getByLabelText('Beden 2XL, yüzde 21 indirimli seçilebilir')).toBeTruthy();
  });

  it('leaves a size without its own cheaper price unmarked', () => {
    renderPajama();

    expect(screen.queryByTestId('size-discount-badge-v-l')).toBeNull();
    expect(screen.getByLabelText('Beden L seçilebilir')).toBeTruthy();
  });

  it('does not promise a discount on a sold-out size', () => {
    renderPajama();

    expect(screen.queryByTestId('size-discount-badge-v-3xl')).toBeNull();
    expect(screen.getByLabelText('Beden 3XL stokta yok, gelince haber ver')).toBeTruthy();
  });

  it('shows no badge while the product price is unknown', () => {
    renderPajama({ productPricing: undefined });

    expect(screen.queryByText(/%/)).toBeNull();
  });

  it('shows no badge when the product is closed for sale', () => {
    renderPajama({ isApprovedForSale: false });

    expect(screen.queryByTestId('size-discount-badge-v-2xl')).toBeNull();
  });

  it('keeps the badge readable on the selected size in the dark theme', () => {
    renderPajama({ selectedVariant: pajamaSizes[1] }, 'dark');

    expect(screen.getByTestId('size-discount-badge-v-2xl')).toBeTruthy();
    expect(screen.getByText('%21')).toBeTruthy();
  });
});
