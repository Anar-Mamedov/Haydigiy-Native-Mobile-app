import { CargoCompany } from '@/types/checkout.types';

/** The two delivery-coverage answers a carrier can give. */
export type CargoCoverageKey = 'cityDistrict' | 'villageRural';

export interface CargoCoverageItem {
  key: CargoCoverageKey;
  /** `true` renders the affirmative label, `false` the negative one. */
  isPositive: boolean;
  label: string;
}

const COVERAGE_LABELS: Record<CargoCoverageKey, { positive: string; negative: string }> = {
  cityDistrict: {
    positive: 'İl ve ilçe merkezlerine gider',
    negative: 'İl ve ilçe merkezlerine gitmez',
  },
  villageRural: {
    positive: 'Köylere ve kırsal bölgelere de gider',
    negative: 'Köylere ve kırsal bölgelere gitmez',
  },
};

type CargoCoverageSource = Pick<CargoCompany, 'toCityDistrict' | 'toVillageRural'>;

/**
 * Turns a carrier's tri-state coverage flags into renderable rows.
 *
 * `null` means the backend has no answer for that area, so the row is dropped
 * entirely — only an explicit `true`/`false` produces a label. Kept as a pure
 * function so the badge list and the row's accessibility label are built from
 * one source instead of repeating the copy in both places.
 */
export function getCargoCoverageItems(company: CargoCoverageSource): CargoCoverageItem[] {
  const flags: { key: CargoCoverageKey; value: boolean | null }[] = [
    { key: 'cityDistrict', value: company.toCityDistrict },
    { key: 'villageRural', value: company.toVillageRural },
  ];

  return flags
    .filter((flag) => flag.value !== null && flag.value !== undefined)
    .map(({ key, value }) => ({
      key,
      isPositive: Boolean(value),
      label: value ? COVERAGE_LABELS[key].positive : COVERAGE_LABELS[key].negative,
    }));
}

/**
 * Screen-reader label for a cargo row. The row is a single `accessibilityRole="radio"`
 * pressable, so its children are not announced separately — the coverage answers
 * have to be folded into the row's own label or they are lost to assistive tech.
 */
export function buildCargoAccessibilityLabel(company: CargoCompany): string {
  const coverage = getCargoCoverageItems(company).map((item) => item.label);
  return [company.name, ...coverage].join('. ');
}
