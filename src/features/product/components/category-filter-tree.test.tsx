import { fireEvent, screen } from '@testing-library/react-native';
import { CategoryFilterTree } from './category-filter-tree';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { FilterCategory } from '@/types/product.types';

const categories: FilterCategory[] = [
  { id: 100, name: 'KADIN', slug: 'kadin', productCount: 1609, parentId: null },
  { id: 101, name: 'Kadın Alt Giyim', slug: 'kadin-alt-giyim', productCount: 398, parentId: 100 },
  { id: 102, name: 'Kadın Üst Giyim', slug: 'kadin-ust-giyim', productCount: 512, parentId: 100 },
];

describe('CategoryFilterTree', () => {
  it('toggles the tapped category, including parent nodes', () => {
    const onToggle = jest.fn();
    renderWithTamagui(<CategoryFilterTree activeIds={[]} categories={categories} onToggle={onToggle} />);

    fireEvent.press(screen.getByLabelText('KADIN kategori filtresi'));
    expect(onToggle).toHaveBeenCalledWith(100);

    fireEvent.press(screen.getByLabelText('Kadın Alt Giyim kategori filtresi'));
    expect(onToggle).toHaveBeenCalledWith(101);
  });

  it('reflects active ids as checked and keeps children visible after selecting a parent', () => {
    renderWithTamagui(<CategoryFilterTree activeIds={[100, 101]} categories={categories} onToggle={jest.fn()} />);

    expect(screen.getByLabelText('KADIN kategori filtresi').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Kadın Alt Giyim kategori filtresi').props.accessibilityState.checked).toBe(true);
    expect(screen.getByLabelText('Kadın Üst Giyim kategori filtresi').props.accessibilityState.checked).toBe(false);
  });

  it('collapses a parent only through its dedicated expand control', () => {
    renderWithTamagui(<CategoryFilterTree activeIds={[]} categories={categories} onToggle={jest.fn()} />);

    // Children are visible while expanded
    expect(screen.getByLabelText('Kadın Alt Giyim kategori filtresi')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('KADIN alt kategorilerini gizle'));
    expect(screen.queryByLabelText('Kadın Alt Giyim kategori filtresi')).toBeNull();
  });
});
