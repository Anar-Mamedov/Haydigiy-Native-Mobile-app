import { AddressInvoiceType } from '@/services/address.service';

/** A saved address as presented in the "Adres Bilgilerim" list. */
export type Address = {
  id: string;
  title: string;
  name: string;
  surname: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  neighbourhood: string;
};

/**
 * The form-shaped view of an address used to prefill the edit form. IDs are kept
 * as strings to match the cascading select values; invoice fields default to the
 * individual variant when absent.
 */
export type AddressFormValues = {
  title: string;
  name: string;
  surname: string;
  /** 10-digit national mobile number (without leading zero). */
  phone: string;
  tcNumber: string;
  cityId: string;
  districtId: string;
  neighbourhoodId: string;
  addressLine: string;
  invoiceType: AddressInvoiceType;
  taxNumber: string;
  taxOffice: string;
  companyName: string;
  isEFatura: boolean;
};
