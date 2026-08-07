import { buildSizeMeasurementTable } from './size-measurement-table';
import { SizeMeasurement } from '@/types/product.types';

const S_SIZE: SizeMeasurement = {
  sizeName: 'S / 36',
  measurements: [
    { key: '45', name: 'Göğüs', value: '88 cm' },
    { key: '46', name: 'Bel', value: '68 cm' },
  ],
};

const M_SIZE: SizeMeasurement = {
  sizeName: 'M / 38',
  measurements: [
    { key: '45', name: 'Göğüs', value: '92 cm' },
    { key: '46', name: 'Bel', value: '72 cm' },
  ],
};

describe('buildSizeMeasurementTable', () => {
  it('returns null when there is nothing to show', () => {
    expect(buildSizeMeasurementTable(null)).toBeNull();
    expect(buildSizeMeasurementTable(undefined)).toBeNull();
    expect(buildSizeMeasurementTable([])).toBeNull();
    expect(buildSizeMeasurementTable([{ sizeName: 'S', measurements: [] }])).toBeNull();
  });

  it('builds one column per measurement and one row per size', () => {
    const table = buildSizeMeasurementTable([S_SIZE, M_SIZE]);

    expect(table?.columns).toEqual([
      { key: '45', label: 'Göğüs' },
      { key: '46', label: 'Bel' },
    ]);
    expect(table?.rows).toEqual([
      { sizeName: 'S / 36', values: ['88 cm', '68 cm'] },
      { sizeName: 'M / 38', values: ['92 cm', '72 cm'] },
    ]);
  });

  // Bedenler arasında ölçü seti farklı olabiliyor; kolonlar birleşimden kurulur.
  it('unions differing measurement sets and blanks the missing cells', () => {
    const table = buildSizeMeasurementTable([
      { sizeName: 'S', measurements: [{ key: '45', name: 'Göğüs', value: '88 cm' }] },
      {
        sizeName: 'M',
        measurements: [
          { key: '45', name: 'Göğüs', value: '92 cm' },
          { key: '46', name: 'Bel', value: '72 cm' },
        ],
      },
    ]);

    expect(table?.columns.map((column) => column.label)).toEqual(['Göğüs', 'Bel']);
    expect(table?.rows).toEqual([
      { sizeName: 'S', values: ['88 cm', '-'] },
      { sizeName: 'M', values: ['92 cm', '72 cm'] },
    ]);
  });

  it('keeps the first-seen column order', () => {
    const table = buildSizeMeasurementTable([
      { sizeName: 'S', measurements: [{ key: '46', name: 'Bel', value: '68 cm' }] },
      { sizeName: 'M', measurements: [{ key: '45', name: 'Göğüs', value: '92 cm' }] },
    ]);

    expect(table?.columns.map((column) => column.label)).toEqual(['Bel', 'Göğüs']);
  });

  it('falls back to a dash when the size has no name', () => {
    const table = buildSizeMeasurementTable([
      { sizeName: '  ', measurements: [{ key: '45', name: 'Göğüs', value: '88 cm' }] },
    ]);

    expect(table?.rows[0]?.sizeName).toBe('-');
  });

  it('skips sizes that carry no measurement at all', () => {
    const table = buildSizeMeasurementTable([{ sizeName: 'S', measurements: [] }, M_SIZE]);

    expect(table?.rows).toHaveLength(1);
    expect(table?.rows[0]?.sizeName).toBe('M / 38');
  });
});
