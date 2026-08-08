import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { CargoCompany } from '@/types/checkout.types';
import { CheckoutCargoSection } from './checkout-cargo-section';

const companies: CargoCompany[] = [
  { id: 1, name: 'Hepsijet', logo: '', price: 119.99, sortOrder: 1 },
  { id: 2, name: 'Aras Kargo', logo: '', price: 124.99, sortOrder: 2 },
];

describe('CheckoutCargoSection', () => {
  it('selects a cargo company when the checkout is not locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutCargoSection
        companies={companies}
        hasFreeShipping={false}
        isLoading={false}
        onSelect={onSelect}
        selectedId={1}
      />,
    );

    fireEvent.press(screen.getByLabelText('Aras Kargo'));

    expect(onSelect).toHaveBeenCalledWith(companies[1]);
  });

  it('ignores presses while the checkout is locked', () => {
    const onSelect = jest.fn();
    renderWithTamagui(
      <CheckoutCargoSection
        companies={companies}
        disabled
        hasFreeShipping={false}
        isLoading={false}
        onSelect={onSelect}
        selectedId={1}
      />,
    );

    fireEvent.press(screen.getByLabelText('Aras Kargo'));

    expect(onSelect).not.toHaveBeenCalled();
  });
});
