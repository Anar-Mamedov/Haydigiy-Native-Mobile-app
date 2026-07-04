import {
  getReturnProgress,
  getReturnStatusNameLabel,
  isPendingReturn,
  isShippedOrLater,
  normalizeReturnStatus,
  RETURN_PROGRESS_STEPS,
  RETURN_REJECTED_STEPS,
} from './return-status';

// Web sipariş detayındaki iade durumu yardımcılarının 1:1 port doğrulaması.
describe('normalizeReturnStatus', () => {
  it('passes numbers through and maps known string statuses', () => {
    expect(normalizeReturnStatus(4)).toBe(4);
    expect(normalizeReturnStatus('pending')).toBe(1);
    expect(normalizeReturnStatus('APPROVED'.toLowerCase())).toBe(2);
    expect(normalizeReturnStatus('rejected')).toBe(3);
    expect(normalizeReturnStatus('canceled')).toBe(6);
    expect(normalizeReturnStatus('5')).toBe(5);
    expect(normalizeReturnStatus('bilinmeyen')).toBeNull();
    expect(normalizeReturnStatus(null)).toBeNull();
  });
});

describe('isPendingReturn / isShippedOrLater', () => {
  it('detects pending and shipped-or-later states', () => {
    expect(isPendingReturn('pending')).toBe(true);
    expect(isPendingReturn(2)).toBe(false);
    expect(isShippedOrLater(4)).toBe(true);
    expect(isShippedOrLater(7)).toBe(true);
    expect(isShippedOrLater(1)).toBe(false);
    expect(isShippedOrLater(6)).toBe(false); // iptal edilmiş iade
  });
});

describe('getReturnStatusNameLabel', () => {
  it('falls back to "İşlem Bekliyor" when the backend label is empty', () => {
    expect(getReturnStatusNameLabel('  ')).toBe('İşlem Bekliyor');
    expect(getReturnStatusNameLabel(null)).toBe('İşlem Bekliyor');
    expect(getReturnStatusNameLabel(' İade Onaylandı ')).toBe('İade Onaylandı');
  });
});

describe('getReturnProgress', () => {
  it('maps each status to the correct step index', () => {
    expect(getReturnProgress(1)?.currentIndex).toBe(0);
    expect(getReturnProgress(4)?.currentIndex).toBe(1);
    expect(getReturnProgress(5)?.currentIndex).toBe(2);
    expect(getReturnProgress(2)?.currentIndex).toBe(3);
    expect(getReturnProgress(7)?.currentIndex).toBe(4);
    expect(getReturnProgress(1)?.steps).toEqual(RETURN_PROGRESS_STEPS);
  });

  it('returns the rejected variant for status 3', () => {
    const progress = getReturnProgress(3);
    expect(progress?.isError).toBe(true);
    expect(progress?.steps).toEqual(RETURN_REJECTED_STEPS);
  });

  it('returns null for cancelled or unknown statuses', () => {
    expect(getReturnProgress(6)).toBeNull();
    expect(getReturnProgress(null)).toBeNull();
    expect(getReturnProgress(99)).toBeNull();
  });
});
