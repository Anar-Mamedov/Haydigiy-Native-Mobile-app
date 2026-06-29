import { PopularProductDto } from '@/features/product/api/product.dtos';
import { mockProductDtos } from '@/features/product/data/mock-product-dtos';
import { apiClient } from '@/lib/axios';
import { appEnv, getRequiredApiBaseUrl } from '@/lib/env';
import { sleep } from '@/utils/sleep';

const popularProductsEndpoint = '/popular-products';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const normalizeString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

function normalizePopularProductDto(value: unknown): PopularProductDto | null {
  if (!isRecord(value)) return null;

  const id = normalizeNumber(value.id);
  const name = normalizeString(value.name);
  const slug = normalizeString(value.slug);

  if (!id || !name || !slug) return null;

  return {
    id,
    name,
    slug,
    image: normalizeString(value.image),
    price: normalizeNumber(value.price),
  };
}

export async function listPopularProductDtos(): Promise<PopularProductDto[]> {
  if (!appEnv.apiBaseUrl) {
    await sleep(100);
    return mockProductDtos.slice(0, 20).map((product, index) => ({
      id: Number(product.id.replace(/\D/g, '')) || index + 1,
      name: product.title,
      slug: product.slug,
      image: product.image_url,
      price: product.price,
    }));
  }

  getRequiredApiBaseUrl();
  const response = await apiClient.get<{ data?: unknown }>(popularProductsEndpoint);
  const items = Array.isArray(response.data?.data) ? response.data.data : [];

  return items
    .map(normalizePopularProductDto)
    .filter((product): product is PopularProductDto => Boolean(product))
    .slice(0, 20);
}
