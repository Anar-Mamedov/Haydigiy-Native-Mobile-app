import { mapAddress, mapAddressToFormValues } from './address.mapper';

describe('mapAddress', () => {
  it('maps nested location objects and builds a fallback title from the name', () => {
    const result = mapAddress({
      id: 7,
      name: 'Anar',
      surname: 'Mamedov',
      phone: '05551234567',
      address_line: 'Cadde 1',
      city: { name: 'İstanbul' },
      district: { name: 'Kadıköy' },
      neighbourhood: { name: 'Moda' },
    });

    expect(result).toEqual({
      id: '7',
      title: 'Anar Mamedov',
      name: 'Anar',
      surname: 'Mamedov',
      phone: '05551234567',
      addressLine: 'Cadde 1',
      city: 'İstanbul',
      district: 'Kadıköy',
      neighbourhood: 'Moda',
    });
  });

  it('falls back to the flat *_name fields and keeps an explicit title', () => {
    const result = mapAddress({
      id: 9,
      title: 'Ev',
      city_name: 'Ankara',
      district_name: 'Çankaya',
      neighbourhood_name: 'Kızılay',
    });

    expect(result.title).toBe('Ev');
    expect(result.city).toBe('Ankara');
    expect(result.district).toBe('Çankaya');
    expect(result.neighbourhood).toBe('Kızılay');
  });
});

describe('mapAddressToFormValues', () => {
  it('extracts the national phone, stringifies ids and reads the corporate invoice', () => {
    const result = mapAddressToFormValues({
      id: 3,
      title: 'İş',
      name: 'Anar',
      surname: 'Mamedov',
      phone: '05551234567',
      address_line: 'Cadde 2',
      tc_number: '10000000146',
      is_invoice: true,
      tax_number: '1234567890',
      tax_office: 'Kadıköy',
      company_name: 'Acme',
      is_e_invoice: true,
      city: { id: 34, name: 'İstanbul' },
      district: { id: 198, name: 'Kadıköy' },
      neighbourhood: { id: 1024, name: 'Moda' },
    });

    expect(result).toEqual({
      title: 'İş',
      name: 'Anar',
      surname: 'Mamedov',
      phone: '5551234567',
      tcNumber: '10000000146',
      cityId: '34',
      districtId: '198',
      neighbourhoodId: '1024',
      addressLine: 'Cadde 2',
      invoiceType: 'corporate',
      taxNumber: '1234567890',
      taxOffice: 'Kadıköy',
      companyName: 'Acme',
      isEFatura: true,
    });
  });

  it('defaults to the individual invoice when no invoice flag is present', () => {
    const result = mapAddressToFormValues({ id: 1, name: 'A', surname: 'B' });
    expect(result.invoiceType).toBe('individual');
    expect(result.isEFatura).toBe(false);
    expect(result.cityId).toBe('');
  });

  it('handles scalar location ids and serialized backend flags', () => {
    const result = mapAddressToFormValues({
      id: 5,
      city_id: '34',
      district_id: 198,
      neighbourhood_id: '1024',
      is_invoice: '0',
      is_e_invoice: '0',
      billing_type: 'individual',
    });

    expect(result.cityId).toBe('34');
    expect(result.districtId).toBe('198');
    expect(result.neighbourhoodId).toBe('1024');
    expect(result.invoiceType).toBe('individual');
    expect(result.isEFatura).toBe(false);
  });
});
