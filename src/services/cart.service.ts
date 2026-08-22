import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { getDeviceId } from '@/lib/storage/device-id';
import { CartResponseDto } from '@/features/cart/api/cart.dtos';
import { BundleSelection } from '@/types/bundle.types';

type CartMutationPayload = {
  variant_id: number;
  quantity?: number;
  device_id?: string;
};

type BundleAddPayload = {
  quantity: number;
  selections: { bundle_item_id: number; variant_id: number }[];
  device_id?: string;
};

type BundleQuantityPayload = {
  quantity: number;
  device_id?: string;
};

const EMPTY_CART: CartResponseDto = { cart: [] };

/**
 * Returns the guest device_id only when there is no authenticated session.
 * Authenticated requests rely on the Bearer token injected by the axios client.
 */
async function getGuestDeviceId(): Promise<string | undefined> {
  const token = await getAccessToken();
  if (token) {
    return undefined;
  }
  return getDeviceId();
}

export async function getCartDto(): Promise<CartResponseDto> {
  if (!appEnv.apiBaseUrl) {
    return EMPTY_CART;
  }

  const deviceId = await getGuestDeviceId();
  const response = await apiClient.get<CartResponseDto>('/cart/list', {
    params: deviceId ? { device_id: deviceId } : undefined,
  });

  return {
    cart: Array.isArray(response.data?.cart) ? response.data.cart : [],
    campaigns: Array.isArray(response.data?.campaigns) ? response.data.campaigns : [],
    user_discount: response.data?.user_discount,
    removed_items: response.data?.removed_items,
    message: response.data?.message,
  };
}


export async function addToCartDto(variantId: number, quantity = 1): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId, quantity };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.post('/cart/add', payload);
}

export async function updateCartItemDto(variantId: number, quantity: number): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId, quantity };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.patch('/cart/update', payload);
}

export async function removeCartItemDto(variantId: number): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.delete('/cart/remove', { data: payload });
}

/**
 * Bundle sepete eklenir. Paketteki HER ürün için bir seçim gönderilmesi zorunludur;
 * `variant_id` ürüne özel `product_variant_id` değeridir.
 */
export async function addBundleToCartDto(
  bundleProductId: number,
  selections: BundleSelection[],
  quantity = 1,
): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: BundleAddPayload = {
    quantity: Math.max(1, Math.trunc(quantity) || 1),
    selections: selections.map((selection) => ({
      bundle_item_id: selection.bundleItemId,
      variant_id: Number(selection.variantId),
    })),
  };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.post(`/cart/bundles/${bundleProductId}/add`, payload);
}

/**
 * Bundle adedi güncellenir. `variant_id` ile çalışan `/cart/update` bundle için
 * KULLANILMAZ; paket satırı yalnızca `bundle_group_id` ile hedeflenebilir.
 */
export async function updateBundleQuantityDto(bundleGroupId: string, quantity: number): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: BundleQuantityPayload = { quantity: Math.max(1, Math.trunc(quantity) || 1) };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.patch(`/cart/bundles/${encodeURIComponent(bundleGroupId)}`, payload);
}

/** Bundle sepetten tek parça olarak silinir; içindeki ürünler ayrı satır değildir. */
export async function removeBundleDto(bundleGroupId: string): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  await apiClient.delete(`/cart/bundles/${encodeURIComponent(bundleGroupId)}`, {
    data: deviceId ? { device_id: deviceId } : undefined,
  });
}

export async function mergeCartDto(): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const token = await getAccessToken();
  if (!token) return;

  const deviceId = await getDeviceId();
  await apiClient.post('/cart/merge', { device_id: deviceId }, { skipNetworkErrorLog: true });
}
