import { fireEvent, screen } from '@testing-library/react-native';
import { ProductColorSelector } from './product-color-selector';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const otherColors = [
  { id: 'p-1', name: 'Mevcut', slug: 'current-product', imageUrl: 'https://example.com/a.png', price: 100, isStock: true },
  { id: 'p-2', name: 'Mavi', slug: 'blue-product', imageUrl: 'https://example.com/b.png', price: 120, isStock: true },
];

const baseProps = {
  currentProductId: 'p-1',
  currentProductSlug: 'current-product',
  currentProductImage: 'https://example.com/a.png',
};

describe('ProductColorSelector', () => {
  it('returns nothing when there are no colors and no category redirect', () => {
    const { toJSON } = renderWithTamagui(
      <ProductColorSelector {...baseProps} otherColors={[]} onColorSelect={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('selects a different color but ignores the already-selected one', () => {
    const onColorSelect = jest.fn();

    renderWithTamagui(
      <ProductColorSelector {...baseProps} otherColors={otherColors} onColorSelect={onColorSelect} />,
    );

    fireEvent.press(screen.getByLabelText('Mevcut renk seçeneği'));
    expect(onColorSelect).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Mavi renk seçeneği'));
    // The full option is passed so the target screen can render an instant preview.
    expect(onColorSelect).toHaveBeenCalledWith(otherColors[1]);
  });

  it('renders the category redirect and triggers it on press', () => {
    const onCategoryPress = jest.fn();

    renderWithTamagui(
      <ProductColorSelector
        {...baseProps}
        otherColors={[]}
        onColorSelect={jest.fn()}
        categoryName="Elbise"
        categorySlug="elbise"
        categoryId={7}
        onCategoryPress={onCategoryPress}
      />,
    );

    fireEvent.press(screen.getByText('Tüm Elbise modellerini gör'));

    expect(onCategoryPress).toHaveBeenCalledWith('elbise', 7);
  });
});
