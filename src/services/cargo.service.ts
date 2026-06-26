import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

/** A shipping company from `GET /cargo-companies(/available)`. */
export interface CargoCompanyDto {
  id: number;
  name: string;
  logo: string;
  price: string;
  sort_order: number;
}

interface CargoCompaniesResponseDto {
  status?: boolean;
  data?: CargoCompanyDto[];
}

/** Location filters; when present the address-aware `/available` endpoint is used. */
export interface CargoCompanyParams {
  cityId?: number;
  districtId?: number;
  neighbourhoodId?: number;
}

/**
 * Cargo options for the selected delivery address. Mirrors the web `Cargo`
 * component: with an address it queries `/cargo-companies/available` (which can
 * vary price/availability by region), otherwise the plain `/cargo-companies`.
 */
export async function getCargoCompaniesDto(params?: CargoCompanyParams): Promise<CargoCompanyDto[]> {
  if (!appEnv.apiBaseUrl) return [];

  const query: Record<string, number> = {};
  if (params?.cityId) query.city_id = params.cityId;
  if (params?.districtId) query.district_id = params.districtId;
  if (params?.neighbourhoodId) query.neighbourhood_id = params.neighbourhoodId;

  const hasFilters = Object.keys(query).length > 0;
  const endpoint = hasFilters ? '/cargo-companies/available' : '/cargo-companies';

  const response = await apiClient.get<CargoCompaniesResponseDto>(endpoint, {
    params: hasFilters ? query : undefined,
  });
  return Array.isArray(response.data?.data) ? response.data.data : [];
}
