import { CargoCompany } from '@/types/checkout.types';
import { buildCargoAccessibilityLabel, getCargoCoverageItems } from './cargo-coverage';

function makeCompany(overrides: Partial<CargoCompany> = {}): CargoCompany {
  return {
    id: 1,
    name: 'Hepsijet',
    logo: '',
    price: 119.99,
    sortOrder: 1,
    toCityDistrict: null,
    toVillageRural: null,
    ...overrides,
  };
}

describe('getCargoCoverageItems', () => {
  it('drops an area the backend has no answer for', () => {
    expect(getCargoCoverageItems(makeCompany())).toEqual([]);
  });

  it('keeps an explicit false separate from an unknown null', () => {
    const items = getCargoCoverageItems(makeCompany({ toCityDistrict: false, toVillageRural: null }));

    expect(items).toEqual([
      { key: 'cityDistrict', isPositive: false, label: 'İl ve ilçe merkezlerine gitmez' },
    ]);
  });

  it('labels both areas when both answers are present', () => {
    const items = getCargoCoverageItems(makeCompany({ toCityDistrict: true, toVillageRural: false }));

    expect(items).toEqual([
      { key: 'cityDistrict', isPositive: true, label: 'İl ve ilçe merkezlerine gider' },
      { key: 'villageRural', isPositive: false, label: 'Köylere ve kırsal bölgelere gitmez' },
    ]);
  });

  it('uses the affirmative village wording when the carrier covers rural areas', () => {
    const items = getCargoCoverageItems(makeCompany({ toVillageRural: true }));

    expect(items).toEqual([
      { key: 'villageRural', isPositive: true, label: 'Köylere ve kırsal bölgelere de gider' },
    ]);
  });
});

describe('buildCargoAccessibilityLabel', () => {
  // The row is one pressable, so its children are not announced separately.
  it('folds the coverage wording into the row label', () => {
    const label = buildCargoAccessibilityLabel(
      makeCompany({ toCityDistrict: true, toVillageRural: false }),
    );

    expect(label).toBe('Hepsijet. İl ve ilçe merkezlerine gider. Köylere ve kırsal bölgelere gitmez');
  });

  it('falls back to the bare carrier name when no answer is known', () => {
    expect(buildCargoAccessibilityLabel(makeCompany())).toBe('Hepsijet');
  });
});
