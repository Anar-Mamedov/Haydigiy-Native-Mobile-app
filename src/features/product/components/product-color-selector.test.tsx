import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { BRAND_TINT_TEXT_COLOR, BRAND_TINT_TEXT_COLOR_DARK } from '@/lib/theme/colors';
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

describe('ProductColorSelector category redirect accessibility', () => {
  function renderRedirect(theme: 'light' | 'dark' = 'light') {
    return renderWithTamagui(
      <ProductColorSelector
        {...baseProps}
        categoryName="Elbise"
        categorySlug="elbise"
        onCategoryPress={jest.fn()}
        onColorSelect={jest.fn()}
        otherColors={[]}
      />,
      theme,
    );
  }

  it('is a labelled button at least 48dp tall', () => {
    // Regresyon: Play raporunda 44dp yükseklik ve etiketsiz tıklanabilir öğe olarak görünüyordu.
    renderRedirect();

    const button = screen.getByLabelText('Tüm Elbise modellerini gör');
    expect(button.props.accessibilityRole).toBe('button');

    let box = screen.getByText('Tüm Elbise modellerini gör').parent;
    while (box && StyleSheet.flatten(box.props?.style)?.minHeight === undefined) {
      box = box.parent;
    }
    expect(StyleSheet.flatten(box?.props.style)).toMatchObject({ minHeight: 48 });
  });

  it.each([
    ['light', BRAND_TINT_TEXT_COLOR],
    ['dark', BRAND_TINT_TEXT_COLOR_DARK],
  ] as const)('writes the label in a color that passes 4.5:1 on the tinted box (%s)', (theme, expectedColor) => {
    // Regresyon: #c45a08, #fff7ed zeminde 4.11:1 kalıyordu.
    renderRedirect(theme);

    expect(StyleSheet.flatten(screen.getByText('Tüm Elbise modellerini gör').props.style)).toMatchObject({
      color: expectedColor,
    });
  });
});
