import { fireEvent, screen } from '@testing-library/react-native';
import { HelpCategoryTabs } from './help-category-tabs';
import { HelpCategory } from '@/types/help.types';
import { renderWithTamagui } from '@/test/render-with-tamagui';

const CATEGORIES: HelpCategory[] = [
  { id: 1, title: 'İade ve Değişim', articles: [] },
  { id: 2, title: 'Kargo', articles: [] },
];

describe('HelpCategoryTabs', () => {
  it('renders a tab for every category and marks the active one as selected', () => {
    renderWithTamagui(<HelpCategoryTabs activeId={1} categories={CATEGORIES} onSelect={jest.fn()} />);

    expect(screen.getByText('İade ve Değişim')).toBeTruthy();
    expect(screen.getByText('Kargo')).toBeTruthy();
    expect(screen.getByLabelText('İade ve Değişim').props.accessibilityState).toMatchObject({
      selected: true,
    });
    expect(screen.getByLabelText('Kargo').props.accessibilityState).toMatchObject({
      selected: false,
    });
  });

  it('calls onSelect with the pressed category id', () => {
    const onSelect = jest.fn();
    renderWithTamagui(<HelpCategoryTabs activeId={1} categories={CATEGORIES} onSelect={onSelect} />);

    fireEvent.press(screen.getByLabelText('Kargo'));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('keeps tab labels visible in dark theme', () => {
    renderWithTamagui(
      <HelpCategoryTabs activeId={2} categories={CATEGORIES} onSelect={jest.fn()} />,
      'dark',
    );

    expect(screen.getByText('İade ve Değişim')).toBeTruthy();
    expect(screen.getByText('Kargo')).toBeTruthy();
  });
});
