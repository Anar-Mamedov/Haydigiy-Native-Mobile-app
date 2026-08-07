import { SizeMeasurement } from '@/types/product.types';

export type SizeMeasurementColumn = { key: string; label: string };
export type SizeMeasurementRow = { sizeName: string; values: string[] };
export type SizeMeasurementTable = { columns: SizeMeasurementColumn[]; rows: SizeMeasurementRow[] };

const EMPTY_CELL = '-';
const MISSING_SIZE_NAME = '-';

/**
 * Beden ölçülerini tablo şekline çevirir: satırlar bedenler, kolonlar ölçü adları.
 * Bedenler arasında ölçü seti farklı olabildiği için kolonlar birleşimden, ilk
 * görülme sırasıyla kurulur; o bedende olmayan ölçü boş hücre olur.
 * Gösterilecek veri yoksa `null` döner.
 */
export function buildSizeMeasurementTable(
  measurements: SizeMeasurement[] | null | undefined,
): SizeMeasurementTable | null {
  if (!Array.isArray(measurements) || measurements.length === 0) return null;

  const rowsSource = measurements.filter(
    (row) => row && Array.isArray(row.measurements) && row.measurements.length > 0,
  );
  if (rowsSource.length === 0) return null;

  const columns: SizeMeasurementColumn[] = [];
  const seen = new Set<string>();
  rowsSource.forEach((row) => {
    row.measurements.forEach((entry) => {
      if (!entry?.key || !entry?.name || seen.has(entry.key)) return;
      seen.add(entry.key);
      columns.push({ key: entry.key, label: entry.name });
    });
  });
  if (columns.length === 0) return null;

  const rows: SizeMeasurementRow[] = rowsSource.map((row) => ({
    sizeName: row.sizeName?.trim() || MISSING_SIZE_NAME,
    values: columns.map(
      (column) => row.measurements.find((entry) => entry.key === column.key)?.value || EMPTY_CELL,
    ),
  }));

  return { columns, rows };
}
