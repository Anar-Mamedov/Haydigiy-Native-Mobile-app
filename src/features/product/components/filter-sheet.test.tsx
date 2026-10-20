import { ComponentProps } from 'react';
import { Dimensions, TextInput } from 'react-native';
import { fireEvent, screen, within } from '@testing-library/react-native';
import { FilterSheet } from './filter-sheet';
import { getFitSheetMaxHeight } from '@/components/ui/use-fit-sheet-max-height';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductAvailableFilters } from '@/types/product.types';

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const { View } = jest.requireActual('react-native');

  const SheetRoot = function SheetRoot({ children, open, ...props }: any) {
    if (!open) return null;
    return React.createElement(View, { testID: 'filter-sheet', ...props }, children);
  };
  SheetRoot.Overlay = function SheetOverlay(props: any) {
    return React.createElement(View, { testID: 'filter-sheet-overlay', ...props });
  };
  SheetRoot.Frame = function SheetFrame({ children, ...props }: any) {
    return React.createElement(View, props, children);
  };

  return { ...jest.requireActual('tamagui'), Sheet: SheetRoot };
});

type SheetProps = ComponentProps<typeof FilterSheet>;

const availableFilters: ProductAvailableFilters = {
  colors: [
    { id: 11, name: 'Kırmızı', hex: '#ff0000' },
    { id: 12, name: 'Mavi', hex: '#0000ff' },
  ],
  variants: [
    { id: 1, name: 'S' },
    { id: 2, name: 'M' },
    { id: 3, name: 'XL' },
  ],
  properties: [
    { id: 21, name: 'Pamuk', parentId: 5, parentName: 'Kumaş' },
    { id: 22, name: 'Keten', parentId: 5, parentName: 'Kumaş' },
  ],
  priceRanges: [
    { label: '0 - 100 TL', min: 0, max: 100 },
    { label: '100 TL üzeri', min: 100, max: null },
  ],
  productCategories: [],
  categoryChildren: [],
  useProductCategoryFilters: false,
  hasCombinationProduct: true,
  hasOpportunityPackage: true,
};

const SEARCH_SECTIONS = [
  { row: 'Beden', input: 'Beden Ara' },
  { row: 'Renk', input: 'Renk Ara' },
  { row: 'Fiyat Aralığı', input: 'Fiyat Ara' },
  { row: 'Kumaş', input: 'Kumaş Ara' },
];

function makeProps(overrides: Partial<SheetProps> = {}): SheetProps {
  return {
    open: true,
    onOpenChange: jest.fn(),
    availableFilters,
    activeFilters: {},
    onApply: jest.fn(),
    ...overrides,
  };
}

function expandSection(label: string) {
  fireEvent.press(screen.getByLabelText(`${label} filtresini aç`));
}

describe('FilterSheet', () => {
  // Arama alanları klavye açar: sheet %70 sabit boyda ve alt snap noktasıyla açılıyordu,
  // klavye arama alanını örtüyor ve klavye açılıp kapanırken sheet kapanabiliyordu.
  it('follows the keyboard-aware form sheet standard', () => {
    renderWithTamagui(<FilterSheet {...makeProps()} />);

    const sheet = screen.getByTestId('filter-sheet');
    expect(sheet.props.moveOnKeyboardChange).toBe(true);
    expect(sheet.props.snapPointsMode).toBe('fit');
    expect(sheet.props.snapPoints).toBeUndefined();
    expect(sheet.props.dismissOnSnapToBottom).toBeUndefined();
    expect(sheet.props.dismissOnOverlayPress).toBe(true);

    const frame = screen.getByTestId('filter-sheet-frame');
    expect(frame.props.adjustPaddingForOffscreenContent).toBe(true);
    expect(frame.props.overflow).toBe('visible');
    expect(frame.props.maxHeight).toBe(getFitSheetMaxHeight(Dimensions.get('window').height, 40));
    expect(screen.getByTestId('filter-sheet-bottom-cover')).toBeTruthy();

    const scroll = screen.getByTestId('filter-sheet-keyboard-aware-scroll');
    expect(scroll.props.bounces).toBe(false);
    expect(scroll.props.alwaysBounceVertical).toBe(false);
    expect(scroll.props.overScrollMode).toBe('never');
    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
  });

  it('keeps the title and the Temizle/Kapat footer pinned outside the scroller', () => {
    renderWithTamagui(<FilterSheet {...makeProps()} />);

    const scroll = screen.getByTestId('filter-sheet-keyboard-aware-scroll');
    expect(screen.getByText('Filtrele')).toBeTruthy();
    expect(within(scroll).queryByText('Filtrele')).toBeNull();
    expect(screen.getByLabelText('Filtreleri temizle')).toBeTruthy();
    expect(within(scroll).queryByLabelText('Filtreleri temizle')).toBeNull();
    expect(within(scroll).getByLabelText('Beden filtresini aç')).toBeTruthy();
  });

  it('gives every search input an accessible label', () => {
    renderWithTamagui(<FilterSheet {...makeProps()} />);

    SEARCH_SECTIONS.forEach(({ row }) => expandSection(row));

    const scroll = screen.getByTestId('filter-sheet-keyboard-aware-scroll');
    SEARCH_SECTIONS.forEach(({ input }) => {
      expect(within(scroll).getByLabelText(input).props.placeholder).toBe(input);
    });
    const inputs = screen.UNSAFE_getAllByType(TextInput);
    expect(inputs).toHaveLength(SEARCH_SECTIONS.length);
    inputs.forEach((input) => expect(input.props.accessibilityLabel).toBeTruthy());
  });

  it('filters a section by its search field', () => {
    renderWithTamagui(<FilterSheet {...makeProps()} />);

    expandSection('Beden');
    fireEvent.changeText(screen.getByLabelText('Beden Ara'), 'x');

    expect(screen.getByText('XL')).toBeTruthy();
    expect(screen.queryByText('S')).toBeNull();
    expect(screen.queryByText('M')).toBeNull();
  });

  it('starts collapsed with an empty search every time it opens', () => {
    const props = makeProps();
    const { rerender } = renderWithTamagui(<FilterSheet {...props} />);

    expandSection('Beden');
    fireEvent.changeText(screen.getByLabelText('Beden Ara'), 'x');

    rerender(<FilterSheet {...props} open={false} />);
    rerender(<FilterSheet {...props} open />);
    expect(screen.queryByLabelText('Beden Ara')).toBeNull();

    expandSection('Beden');
    expect(screen.getByLabelText('Beden Ara').props.value).toBe('');
    expect(screen.getByText('S')).toBeTruthy();
  });

  it('applies a checkbox immediately and keeps the other active filters', () => {
    const onApply = jest.fn();
    renderWithTamagui(<FilterSheet {...makeProps({ activeFilters: { variants: '1', colors: '11' }, onApply })} />);

    expandSection('Beden');
    fireEvent.press(screen.getByText('M'));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ colors: '11', variants: '1,2' }));
  });

  it('applies a special product filter from the Ürün Tipi section', () => {
    const onApply = jest.fn();
    renderWithTamagui(<FilterSheet {...makeProps({ onApply })} />);

    expandSection('Ürün Tipi');
    fireEvent.press(screen.getByRole('checkbox', { name: 'Fırsat Ürünleri' }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ has_opportunity_package: '1' }));
  });

  it('clears only its own section and closes from the section footer', () => {
    const onApply = jest.fn();
    const onOpenChange = jest.fn();
    renderWithTamagui(
      <FilterSheet {...makeProps({ activeFilters: { variants: '1,2', colors: '11' }, onApply, onOpenChange })} />,
    );

    expandSection('Beden');
    const scroll = screen.getByTestId('filter-sheet-keyboard-aware-scroll');
    fireEvent.press(within(scroll).getByText('Temizle'));
    expect(onApply).toHaveBeenCalledWith({ colors: '11', variants: undefined });

    fireEvent.press(within(scroll).getByText('Kapat'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('resets every filter and closes from the pinned footer', () => {
    const onApply = jest.fn();
    const onOpenChange = jest.fn();
    renderWithTamagui(
      <FilterSheet {...makeProps({ activeFilters: { variants: '1', has_combination_product: '1' }, onApply, onOpenChange })} />,
    );

    fireEvent.press(screen.getByLabelText('Filtreleri temizle'));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ variants: undefined, has_combination_product: undefined, has_opportunity_package: undefined }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  // dismissOnSnapToBottom kaldırıldı; aşağı kaydırarak kapatma başlıktan sürüyor.
  it('closes when the header is swiped down, without a bottom snap point', () => {
    const onOpenChange = jest.fn();
    renderWithTamagui(<FilterSheet {...makeProps({ onOpenChange })} />);

    const header = screen.getByTestId('filter-sheet-swipe-close');
    fireEvent(header, 'touchStart', { nativeEvent: { pageY: 100, timestamp: 1000 } });
    fireEvent(header, 'touchEnd', { nativeEvent: { pageY: 300, timestamp: 1400 } });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('keeps the labels readable in the dark theme', () => {
    renderWithTamagui(<FilterSheet {...makeProps()} />, 'dark');

    expandSection('Renk');

    expect(screen.getByText('Filtrele')).toBeTruthy();
    expect(screen.getByLabelText('Renk Ara')).toBeTruthy();
    expect(screen.getAllByText('Temizle')).toHaveLength(2);
    expect(screen.getAllByText('Kapat')).toHaveLength(2);
  });
});
