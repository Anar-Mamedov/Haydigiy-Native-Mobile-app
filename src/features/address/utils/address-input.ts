import { NewAddressInput } from '@/services/address.service';
import { AddressFormData } from '../schemas/address.schema';

/**
 * Doğrulanmış form verisini ekle/güncelle isteğinin girdisine çevirir. Kurumsal
 * alanlar yalnız kurumsal faturada gider; varsayılan adres seçimi her iki modda
 * da açıkça (`true`/`false`) gönderilir, web formu gibi.
 */
export function toNewAddressInput(data: AddressFormData): NewAddressInput {
  const isCorporate = data.invoiceType === 'corporate';
  return {
    title: data.title.trim(),
    name: data.name.trim(),
    surname: data.surname.trim(),
    phone: `0${data.phone}`,
    tcNumber: data.tcNumber.trim() || undefined,
    cityId: data.cityId,
    districtId: data.districtId,
    neighbourhoodId: data.neighbourhoodId,
    addressLine: data.addressLine.trim(),
    invoiceType: data.invoiceType,
    taxNumber: isCorporate ? data.taxNumber.trim() : undefined,
    taxOffice: isCorporate ? data.taxOffice.trim() : undefined,
    companyName: isCorporate ? data.companyName.trim() : undefined,
    isEFatura: isCorporate ? data.isEFatura : false,
    isDefault: data.isDefault,
  };
}
