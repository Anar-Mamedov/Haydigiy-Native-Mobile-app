import { screen, fireEvent } from '@testing-library/react-native';
import { Theme } from 'tamagui';
import { FavoritesToolbar } from './favorites-toolbar';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const baseProps = {
  searchQuery: '',
  onSearchChange: jest.fn(),
  selectedCategoryCount: 0,
  onOpenCategorySheet: jest.fn(),
  activeFilters: [] as never[],
  onToggleFilter: jest.fn(),
};

describe('FavoritesToolbar', () => {
  beforeEach(() => jest.clearAllMocks());

  // The chips were a Tamagui Button before, whose sub-theme made the inactive
  // label unreadable in dark mode. Render in dark and assert the labels exist.
  it('renders all filter chip labels in dark mode', () => {
    renderWithTamagui(
      <Theme name="dark">
        <FavoritesToolbar {...baseProps} />
      </Theme>
    );

    expect(screen.getByText(/Kategori/)).toBeTruthy();
    expect(screen.getByText('Stokta Olanlar')).toBeTruthy();
    expect(screen.getByText('Fiyatı Düşenler')).toBeTruthy();
    expect(screen.getByPlaceholderText('Favorilerimde ara...')).toBeTruthy();
  });

  it('toggles the in-stock filter when its chip is pressed', () => {
    renderWithTamagui(<FavoritesToolbar {...baseProps} />);

    fireEvent.press(screen.getByText('Stokta Olanlar'));
    expect(baseProps.onToggleFilter).toHaveBeenCalledWith('inStock');
  });

  it('opens the category sheet when the category chip is pressed', () => {
    renderWithTamagui(<FavoritesToolbar {...baseProps} />);

    fireEvent.press(screen.getByText(/Kategori/));
    expect(baseProps.onOpenCategorySheet).toHaveBeenCalled();
  });
});
