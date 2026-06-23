import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { LocationOption } from '@/types/order.types';

export interface AddressDto {
  id: number;
  title?: string;
  name?: string;
  surname?: string;
  phone?: string;
  address_line?: string;
  city?: { name?: string } | null;
  district?: { name?: string } | null;
  neighbourhood?: { name?: string } | null;
  city_name?: string;
  district_name?: string;
  neighbourhood_name?: string;
  [key: string]: unknown;
}

interface LocationOptionDto {
  id: number | string;
  name?: string;
}

/**
 * Fetches the authenticated user's saved addresses. Used by checkout to decide
 * whether an address must be added, and by the scheduled-return pickup picker.
 */
export async function getAddressesDto(): Promise<AddressDto[]> {
  if (!appEnv.apiBaseUrl) return [];

  const response = await apiClient.get<AddressDto[]>('/addresses');
  return Array.isArray(response.data) ? response.data : [];
}

function mapLocationOptions(data: LocationOptionDto[] | undefined): LocationOption[] {
  if (!Array.isArray(data)) return [];
  return data.map((option) => ({ id: String(option.id), name: option.name ?? '' }));
}

/** Provinces (`GET /address/cities`). */
export async function getCitiesDto(): Promise<LocationOption[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<LocationOptionDto[]>('/address/cities');
  return mapLocationOptions(response.data);
}

/** Districts for a province (`GET /address/districts/{cityId}`). */
export async function getDistrictsDto(cityId: string): Promise<LocationOption[]> {
  if (!appEnv.apiBaseUrl || !cityId) return [];
  const response = await apiClient.get<LocationOptionDto[]>(`/address/districts/${cityId}`);
  return mapLocationOptions(response.data);
}

/** Neighbourhoods for a district (`GET /address/neighbourhoods/{districtId}`). */
export async function getNeighbourhoodsDto(districtId: string): Promise<LocationOption[]> {
  if (!appEnv.apiBaseUrl || !districtId) return [];
  const response = await apiClient.get<LocationOptionDto[]>(
    `/address/neighbourhoods/${districtId}`,
  );
  return mapLocationOptions(response.data);
}

export type AddressInvoiceType = 'individual' | 'corporate';

export interface NewAddressInput {
  title: string;
  name: string;
  surname: string;
  phone: string;
  tcNumber?: string;
  cityId: string;
  districtId: string;
  neighbourhoodId: string;
  addressLine: string;
  invoiceType: AddressInvoiceType;
  /** VKN/TCKN (corporate only). */
  taxNumber?: string;
  /** Vergi Dairesi (corporate only). */
  taxOffice?: string;
  /** Firma Adı (corporate only). */
  companyName?: string;
  /** E-fatura mükellefi (corporate only). */
  isEFatura?: boolean;
}

/** Full address record (`GET /addresses/{id}`) used to prefill the edit form. */
export interface AddressDetailDto {
  id: number;
  title?: string;
  name?: string;
  surname?: string;
  phone?: string;
  address_line?: string;
  zip_code?: string;
  is_invoice?: boolean;
  tax_number?: string;
  tax_office?: string;
  tc_number?: string;
  company_name?: string;
  is_e_invoice?: boolean;
  city?: { id?: number; name?: string } | null;
  district?: { id?: number; name?: string } | null;
  neighbourhood?: { id?: number; name?: string } | null;
  [key: string]: unknown;
}

/** Maps a domain address input to the backend create/update payload shape. */
function toAddressPayload(input: NewAddressInput) {
  const isCorporate = input.invoiceType === 'corporate';
  return {
    title: input.title,
    name: input.name,
    surname: input.surname,
    phone: input.phone,
    country_id: 1,
    city_id: Number(input.cityId),
    district_id: Number(input.districtId),
    neighbourhood_id: Number(input.neighbourhoodId),
    address_line: input.addressLine,
    zip_code: '00000',
    is_invoice: isCorporate,
    tax_number: isCorporate ? (input.taxNumber ?? '') : '',
    tax_office: isCorporate ? (input.taxOffice ?? '') : '',
    billing_type: input.invoiceType,
    tc_number: input.tcNumber ?? '',
    company_name: isCorporate ? (input.companyName ?? '') : '',
    is_e_invoice: isCorporate ? (input.isEFatura ?? false) : false,
  };
}

/**
 * Creates a new address (`POST /addresses`). Mirrors the web address-add
 * payload, including the optional T.C. number and corporate (invoice) fields.
 */
export async function addAddressDto(input: NewAddressInput): Promise<void> {
  await apiClient.post('/addresses', toAddressPayload(input));
}

/** Loads a single saved address (`GET /addresses/{id}`) for editing. */
export async function getAddressByIdDto(id: string): Promise<AddressDetailDto | null> {
  if (!appEnv.apiBaseUrl || !id) return null;
  const response = await apiClient.get<AddressDetailDto>(`/addresses/${id}`);
  return response.data ?? null;
}

/** Updates an existing address (`PUT /addresses/{id}`). */
export async function updateAddressDto(id: string, input: NewAddressInput): Promise<void> {
  await apiClient.put(`/addresses/${id}`, toAddressPayload(input));
}

/** Deletes a saved address (`DELETE /addresses/{id}`). */
export async function deleteAddressDto(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}
