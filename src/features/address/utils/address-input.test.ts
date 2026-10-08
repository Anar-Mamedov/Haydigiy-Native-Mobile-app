import { AddressFormData } from '../schemas/address.schema';
import { toNewAddressInput } from './address-input';

const FORM: AddressFormData = {
  title: 'Ev',
  name: ' Anar ',
  surname: 'Mamedov',
  phone: '5551234567',
  tcNumber: '',
  cityId: '34',
  districtId: '198',
  neighbourhoodId: '1024',
  addressLine: ' Cadde 1 ',
  invoiceType: 'individual',
  taxNumber: '123',
  taxOffice: 'Kadıköy',
  companyName: 'Acme',
  isEFatura: true,
  isDefault: false,
};

describe('toNewAddressInput', () => {
  it('trims the fields, prefixes the phone and drops corporate fields for individuals', () => {
    expect(toNewAddressInput(FORM)).toEqual({
      title: 'Ev',
      name: 'Anar',
      surname: 'Mamedov',
      phone: '05551234567',
      tcNumber: undefined,
      cityId: '34',
      districtId: '198',
      neighbourhoodId: '1024',
      addressLine: 'Cadde 1',
      invoiceType: 'individual',
      taxNumber: undefined,
      taxOffice: undefined,
      companyName: undefined,
      isEFatura: false,
      isDefault: false,
    });
  });

  it('passes the "Varsayılan adres" choice through explicitly', () => {
    expect(toNewAddressInput({ ...FORM, isDefault: true }).isDefault).toBe(true);
  });

  it('keeps the corporate invoice fields for corporate addresses', () => {
    const input = toNewAddressInput({ ...FORM, invoiceType: 'corporate' });

    expect(input).toMatchObject({
      taxNumber: '123',
      taxOffice: 'Kadıköy',
      companyName: 'Acme',
      isEFatura: true,
    });
  });
});
