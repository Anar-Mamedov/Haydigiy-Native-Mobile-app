import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { BestListingTabs } from './best-listing-tabs';

describe('BestListingTabs', () => {
  it.each(['light', 'dark'] as const)('shows the three lists with the current one selected in the %s theme', (theme) => {
    renderWithTamagui(<BestListingTabs onSelect={jest.fn()} value="views" />, theme);

    expect(screen.getByText('En Çok Satılanlar')).toBeTruthy();
    expect(screen.getByText('En Çok Favorilenenler')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'En Çok Ziyaret Edilenler' }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByRole('button', { name: 'En Çok Satılanlar' }).props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('switches to another list but ignores a tap on the current one', () => {
    const onSelect = jest.fn();
    renderWithTamagui(<BestListingTabs onSelect={onSelect} value="sales" />);

    fireEvent.press(screen.getByRole('button', { name: 'En Çok Satılanlar' }));
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.press(screen.getByRole('button', { name: 'En Çok Favorilenenler' }));
    expect(onSelect).toHaveBeenCalledWith('favorites');
  });
});
