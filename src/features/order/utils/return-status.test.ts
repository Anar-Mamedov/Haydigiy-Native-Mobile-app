import {
  getReturnProgress,
  getReturnStatusDetails,
  getReturnStatusNameLabel,
  isPendingReturn,
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

describe('isPendingReturn', () => {
  it('detects the pending state', () => {
    expect(isPendingReturn('pending')).toBe(true);
    expect(isPendingReturn(1)).toBe(true);
    expect(isPendingReturn(2)).toBe(false);
  });
});

describe('getReturnStatusDetails', () => {
  it('maps each status to the web card title and description', () => {
    expect(getReturnStatusDetails(1)).toEqual({
      title: 'İade Talebi Oluşturuldu',
      description: 'İade talebiniz işleme alındı.',
    });
    expect(getReturnStatusDetails(2).title).toBe('İade Onaylandı');
    expect(getReturnStatusDetails('rejected').title).toBe('İade Reddedildi');
    expect(getReturnStatusDetails(4)).toEqual({
      title: 'İade Kargoda',
      description: 'İade ürünleriniz kargo ile yolda.',
    });
    expect(getReturnStatusDetails(5).title).toBe('İade Ürünleri Ulaştı');
    expect(getReturnStatusDetails(6).title).toBe('İade Talebi İptal Edildi');
    expect(getReturnStatusDetails(7)).toEqual({
      title: 'İade Tamamlandı',
      description: 'İade ödemeniz tamamlandı.',
    });
  });

  it('falls back to the "created" copy for unknown statuses', () => {
    expect(getReturnStatusDetails(null).title).toBe('İade Talebi Oluşturuldu');
    expect(getReturnStatusDetails(99).title).toBe('İade Talebi Oluşturuldu');
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
