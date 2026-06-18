import { buildReturnBaseMessage, buildReturnSuccessMessage } from './return-messages';

describe('buildReturnBaseMessage', () => {
  it('omits the code line when no code is returned', () => {
    expect(buildReturnBaseMessage()).toBe('İade talebiniz başarıyla alındı.');
  });

  it('includes the code and expiry when present', () => {
    expect(buildReturnBaseMessage('RT-99', '2026-07-01')).toBe(
      'İade talebiniz alındı.\nİade Kodunuz: RT-99\nKod geçerlilik: 2026-07-01',
    );
  });
});

describe('buildReturnSuccessMessage', () => {
  it('returns the simple store message for "Mağazadan Al"', () => {
    expect(
      buildReturnSuccessMessage({ cargoCompanyName: 'Mağazadan Al', returnMethod: 'ptt' }),
    ).toBe('İade talebiniz başarıyla alındı.');
  });

  it('prepends the appointment line for a Hepsijet pickup', () => {
    const message = buildReturnSuccessMessage({
      cargoCompanyName: 'Hepsijet',
      returnMethod: 'hepsijet',
      code: 'RT-1',
      selectedDate: '2026-07-05',
    });
    expect(message).toContain('Randevunuz oluşturuldu!');
    expect(message).toContain('Kurye 2026-07-05 tarihinde');
    expect(message).toContain('İade Kodunuz: RT-1');
  });

  it('returns the base message for a PTT return', () => {
    expect(
      buildReturnSuccessMessage({ cargoCompanyName: 'Yurtiçi', returnMethod: 'ptt', code: 'RT-2' }),
    ).toBe('İade talebiniz alındı.\nİade Kodunuz: RT-2');
  });
});
