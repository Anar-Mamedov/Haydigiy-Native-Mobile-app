import { AddressDetailDto, AddressDto } from '@/services/address.service';
import { extractTurkishNationalNumber } from '@/utils/turkish-phone';
import { Address, AddressFormValues } from '@/types/address.types';

/** Maps a raw address DTO to the domain model used by the list card. */
export function mapAddress(dto: AddressDto): Address {
  const fullName = `${dto.name ?? ''} ${dto.surname ?? ''}`.trim();
  return {
    id: String(dto.id),
    title: dto.title?.trim() || fullName,
    name: dto.name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone ?? '',
    addressLine: dto.address_line ?? '',
    city: dto.city?.name || dto.city_name || '',
    district: dto.district?.name || dto.district_name || '',
    neighbourhood: dto.neighbourhood?.name || dto.neighbourhood_name || '',
  };
}

/** Maps a full address detail DTO into the editable form values. */
export function mapAddressToFormValues(dto: AddressDetailDto): AddressFormValues {
  const isCorporate = Boolean(dto.is_invoice);
  return {
    title: dto.title ?? '',
    name: dto.name ?? '',
    surname: dto.surname ?? '',
    phone: dto.phone ? extractTurkishNationalNumber(dto.phone) : '',
    tcNumber: dto.tc_number ?? '',
    cityId: dto.city?.id ? String(dto.city.id) : '',
    districtId: dto.district?.id ? String(dto.district.id) : '',
    neighbourhoodId: dto.neighbourhood?.id ? String(dto.neighbourhood.id) : '',
    addressLine: dto.address_line ?? '',
    invoiceType: isCorporate ? 'corporate' : 'individual',
    taxNumber: dto.tax_number ?? '',
    taxOffice: dto.tax_office ?? '',
    companyName: dto.company_name ?? '',
    isEFatura: dto.is_e_invoice ?? false,
  };
}
