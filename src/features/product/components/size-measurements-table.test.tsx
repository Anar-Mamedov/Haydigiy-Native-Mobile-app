import { screen } from '@testing-library/react-native';
import { SizeMeasurementsTable } from './size-measurements-table';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { SizeMeasurement } from '@/types/product.types';

const MEASUREMENTS: SizeMeasurement[] = [
  {
    sizeName: 'S / 36',
    measurements: [
      { key: '45', name: 'Göğüs', value: '88 cm' },
      { key: '46', name: 'Bel', value: '68 cm' },
    ],
  },
  {
    sizeName: 'M / 38',
    measurements: [
      { key: '45', name: 'Göğüs', value: '92 cm' },
      { key: '46', name: 'Bel', value: '72 cm' },
    ],
  },
];

describe('SizeMeasurementsTable', () => {
  it('renders nothing without measurements', () => {
    renderWithTamagui(<SizeMeasurementsTable measurements={[]} />);

    expect(screen.queryByTestId('size-measurements-table')).toBeNull();
  });

  it('renders nothing when the sizes carry no measurement', () => {
    renderWithTamagui(<SizeMeasurementsTable measurements={[{ sizeName: 'S', measurements: [] }]} />);

    expect(screen.queryByTestId('size-measurements-table')).toBeNull();
  });

  it('renders a header per measurement and a row per size', () => {
    renderWithTamagui(<SizeMeasurementsTable measurements={MEASUREMENTS} />);

    expect(screen.getByTestId('size-measurements-table')).toBeTruthy();
    expect(screen.getByText('Beden Ölçüleri')).toBeTruthy();
    expect(screen.getByText('Beden')).toBeTruthy();
    expect(screen.getByText('Göğüs')).toBeTruthy();
    expect(screen.getByText('Bel')).toBeTruthy();
    expect(screen.getByText('S / 36')).toBeTruthy();
    expect(screen.getByText('88 cm')).toBeTruthy();
    expect(screen.getByText('M / 38')).toBeTruthy();
    expect(screen.getByText('72 cm')).toBeTruthy();
  });

  it('shows a dash where a size has no value for a column', () => {
    renderWithTamagui(
      <SizeMeasurementsTable
        measurements={[
          { sizeName: 'S', measurements: [{ key: '45', name: 'Göğüs', value: '88 cm' }] },
          {
            sizeName: 'M',
            measurements: [
              { key: '45', name: 'Göğüs', value: '92 cm' },
              { key: '46', name: 'Bel', value: '72 cm' },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('-')).toBeTruthy();
  });

  it('stays readable in the dark theme', () => {
    renderWithTamagui(<SizeMeasurementsTable measurements={MEASUREMENTS} />, 'dark');

    expect(screen.getByText('Beden Ölçüleri')).toBeTruthy();
    expect(screen.getByText('S / 36')).toBeTruthy();
    expect(screen.getByText('88 cm')).toBeTruthy();
  });
});
