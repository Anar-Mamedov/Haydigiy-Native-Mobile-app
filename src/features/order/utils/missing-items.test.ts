import { MissingCase } from '@/types/order.types';
import { getMissingCasesSummary } from './missing-items';

function makeCase(overrides: Partial<MissingCase> = {}): MissingCase {
  return {
    id: 1,
    caseNo: 'EK-1',
    kind: 'product',
    status: 'open',
    statusLabel: 'Bildirildi',
    resolutionNote: null,
    lines: [
      { id: 1, name: 'Elbise', image: null, variantName: 'M', missingQuantity: 2, slug: 'elbise' },
    ],
    delivery: null,
    ...overrides,
  };
}

describe('getMissingCasesSummary', () => {
  it('counts open reports and the total missing quantity', () => {
    const summary = getMissingCasesSummary([
      makeCase(),
      makeCase({ id: 2, kind: 'part', status: 'resolved' }),
    ]);

    expect(summary).toBe('1 bildiriminiz inceleniyor. Toplam 4 adet ürün için kayıt bulunuyor.');
  });

  it('reports that every case is resolved', () => {
    expect(getMissingCasesSummary([makeCase({ status: 'resolved' })])).toBe(
      'Eksik ürün bildirimleriniz çözümlendi. Toplam 2 adet ürün için kayıt bulunuyor.',
    );
  });

  it('omits the quantity sentence when no quantity is recorded', () => {
    expect(getMissingCasesSummary([makeCase({ lines: [] })])).toBe('1 bildiriminiz inceleniyor.');
  });
});
