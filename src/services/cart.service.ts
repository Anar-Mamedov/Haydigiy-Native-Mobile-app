import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { getAccessToken } from '@/lib/storage/secure-storage';
import { getDeviceId } from '@/lib/storage/device-id';
import {
  AddCartGiftResponseDto,
  CartCampaignsResponseDto,
  CartResponseDto,
} from '@/features/cart/api/cart.dtos';
import { BundleSelection } from '@/types/bundle.types';

type CartMutationPayload = {
  variant_id: number;
  /** Aynı varyantın ücretli ve hediye satırı ayrı durduğu için tek satırı hedefler. */
  cart_item_id?: number;
  quantity?: number;
  device_id?: string;
};

type CartGiftAddPayload = {
  campaign_id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  device_id?: string;
};

/** Sepete eklenecek hediyenin seçimi; hak ve stok backend'de yeniden doğrulanır. */
export type CartGiftSelection = {
  campaignId: number;
  productId: number;
  variantId: number;
  quantity: number;
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
const EMPTY_CAMPAIGNS: CartCampaignsResponseDto = { campaigns: [] };

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
    available_gifts: Array.isArray(response.data?.available_gifts)
      ? response.data.available_gifts
      : [],
    user_discount: response.data?.user_discount,
    removed_items: response.data?.removed_items,
    message: response.data?.message,
  };
}


/**
 * Sepet kampanya durumunu döndürür. `/cart/list` sepet satırlarını taşır;
 * kampanya bandı satırlara değil yalnızca eşik/tutar bilgisine ihtiyaç duyduğu
 * için ayrı ve daha hafif olan bu ucu kullanır.
 *
 * `categoryId` listelenen kategoridir (`c`); backend o kategoriye özel hediye
 * kampanyasını buna göre döndürür.
 */
export async function getCartCampaignsDto(categoryId?: number): Promise<CartCampaignsResponseDto> {
  if (!appEnv.apiBaseUrl) {
    return EMPTY_CAMPAIGNS;
  }

  const deviceId = await getGuestDeviceId();
  const hasCategory = typeof categoryId === 'number' && Number.isSafeInteger(categoryId) && categoryId > 0;
  const params = {
    ...(deviceId ? { device_id: deviceId } : {}),
    ...(hasCategory ? { c: categoryId } : {}),
  };
  const response = await apiClient.get<CartCampaignsResponseDto>('/cart/campaigns', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });

  return {
    subtotal: response.data?.subtotal,
    campaign_basis: response.data?.campaign_basis,
    primary_campaign_message: response.data?.primary_campaign_message ?? null,
    campaigns: Array.isArray(response.data?.campaigns) ? response.data.campaigns : [],
  };
}

export async function addToCartDto(variantId: number, quantity = 1): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId, quantity };
  if (deviceId) payload.device_id = deviceId;

  await apiClient.post('/cart/add', payload);
}

/**
 * Satır adedini günceller. `cartItemId` verilirse yalnız o satır değişir; yoksa
 * backend varyantın tüm satırlarına dokunur (hediye satırı varsa onu da küçültür).
 */
export async function updateCartItemDto(
  variantId: number,
  quantity: number,
  cartItemId?: number,
): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId, quantity };
  if (cartItemId) payload.cart_item_id = cartItemId;
  if (deviceId) payload.device_id = deviceId;

  await apiClient.patch('/cart/update', payload);
}

/**
 * Satırı siler. `cartItemId` olmadan backend, varyantta hediye satırı varsa o
 * varyantın ücretli ve hediye satırlarını birlikte siler.
 */
export async function removeCartItemDto(variantId: number, cartItemId?: number): Promise<void> {
  if (!appEnv.apiBaseUrl) return;

  const deviceId = await getGuestDeviceId();
  const payload: CartMutationPayload = { variant_id: variantId };
  if (cartItemId) payload.cart_item_id = cartItemId;
  if (deviceId) payload.device_id = deviceId;

  await apiClient.delete('/cart/remove', { data: payload });
}

/**
 * Müşterinin seçtiği bedenle hak ettiği hediyeyi sepete ücretsiz ekler. Tutar ve
 * hak istemciden alınmaz; backend kampanya uygunluğunu ve stoğu yeniden doğrular.
 */
export async function addCartGiftDto(selection: CartGiftSelection): Promise<AddCartGiftResponseDto> {
  if (!appEnv.apiBaseUrl) return {};

  const deviceId = await getGuestDeviceId();
  const payload: CartGiftAddPayload = {
    campaign_id: selection.campaignId,
    product_id: selection.productId,
    variant_id: selection.variantId,
    quantity: selection.quantity,
  };
  if (deviceId) payload.device_id = deviceId;

  const response = await apiClient.post<AddCartGiftResponseDto>('/cart/gifts/add', payload);
  return response.data ?? {};
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
