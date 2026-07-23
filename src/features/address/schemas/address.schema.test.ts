import { addressSchema } from './address.schema';
import { ADDRESS_TITLES } from '../utils/address-title';

const validIndividual = {
  title: 'Ev',
  name: 'Anar',
  surname: 'Mamedov',
  phone: '5551234567',
  tcNumber: '',
  cityId: '34',
  districtId: '198',
  neighbourhoodId: '1024',
  addressLine: 'Cadde, sokak, no',
  invoiceType: 'individual' as const,
  taxNumber: '',
  taxOffice: '',
  companyName: '',
  isEFatura: false,
};

describe('addressSchema', () => {
  it('accepts a valid individual address', () => {
    expect(addressSchema.safeParse(validIndividual).success).toBe(true);
  });

  it('treats an empty T.C. number as valid (optional) but rejects an invalid one', () => {
    expect(addressSchema.safeParse({ ...validIndividual, tcNumber: '' }).success).toBe(true);
    expect(addressSchema.safeParse({ ...validIndividual, tcNumber: '12345678901' }).success).toBe(
      false,
    );
    expect(addressSchema.safeParse({ ...validIndividual, tcNumber: '10000000146' }).success).toBe(
      true,
    );
  });

  it('requires title, location selections, address and a valid phone', () => {
    expect(addressSchema.safeParse({ ...validIndividual, title: '' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, cityId: '' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, districtId: '' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, neighbourhoodId: '' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, addressLine: '' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, phone: '123' }).success).toBe(false);
  });

  it('accepts only the fixed address title options', () => {
    for (const title of ADDRESS_TITLES) {
      expect(addressSchema.safeParse({ ...validIndividual, title }).success).toBe(true);
    }

    expect(addressSchema.safeParse({ ...validIndividual, title: 'Ev Adresim' }).success).toBe(false);
    expect(addressSchema.safeParse({ ...validIndividual, title: 'İş' }).success).toBe(false);
  });

  it('requires VKN/TCKN, tax office and company name for corporate invoices', () => {
    const corporate = { ...validIndividual, invoiceType: 'corporate' as const };
    expect(addressSchema.safeParse(corporate).success).toBe(false);
    expect(
      addressSchema.safeParse({
        ...corporate,
        taxNumber: '1234567890',
        taxOffice: 'Kadıköy',
        companyName: 'Acme A.Ş.',
      }).success,
    ).toBe(true);
  });
});
