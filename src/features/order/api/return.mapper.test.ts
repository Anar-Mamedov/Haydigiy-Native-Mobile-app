import { mapRefundMethods } from './return.mapper';
import { RefundMethodDto } from './return.dtos';

describe('mapRefundMethods', () => {
  it('maps the backend list to the domain shape', () => {
    const dtos: RefundMethodDto[] = [
      { id: 1, name: 'IBAN', code: 'iban' },
      { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' },
    ];

    expect(mapRefundMethods(dtos)).toEqual([
      { id: 1, name: 'IBAN', code: 'iban' },
      { id: 2, name: 'Hediye Çeki', code: 'gift_voucher' },
    ]);
  });

  it('returns an empty list for an empty response', () => {
    expect(mapRefundMethods([])).toEqual([]);
  });

  // Bozuk bir satır seçilemeyen bir seçenek olarak ekrana düşmemeli.
  it('drops rows without a usable id or code', () => {
    const dtos = [
      { id: 1, name: 'IBAN', code: 'iban' },
      { id: 2, name: 'Kod yok', code: '   ' },
      { id: Number.NaN, name: 'Id yok', code: 'gift_voucher' },
    ] as RefundMethodDto[];

    expect(mapRefundMethods(dtos)).toEqual([{ id: 1, name: 'IBAN', code: 'iban' }]);
  });

  it('falls back to the code when the name is missing', () => {
    const dtos = [{ id: 3, code: 'gift_voucher' }] as RefundMethodDto[];

    expect(mapRefundMethods(dtos)).toEqual([
      { id: 3, name: 'gift_voucher', code: 'gift_voucher' },
    ]);
  });
});
