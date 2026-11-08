import {
  addCartGiftDto,
  getCartCampaignsDto,
  getCartDto,
  mergeCartDto,
  removeCartItemDto,
  updateCartItemDto,
} from './cart.service';
import { apiClient } from '@/lib/axios';
import { getAccessToken } from '@/lib/storage/secure-storage';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    delete: jest.fn(async () => ({ data: {} })),
    get: jest.fn(async () => ({ data: {} })),
    patch: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

jest.mock('@/lib/storage/secure-storage', () => ({
  getAccessToken: jest.fn(async () => 'token-1'),
}));

jest.mock('@/lib/storage/device-id', () => ({
  getDeviceId: jest.fn(async () => 'device-1'),
}));

describe('mergeCartDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('suppresses global network-error logging for the best-effort background merge', async () => {
    await mergeCartDto();

    expect(apiClient.post).toHaveBeenCalledWith(
      '/cart/merge',
      { device_id: 'device-1' },
      { skipNetworkErrorLog: true },
    );
  });
});

describe('cart line mutations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('targets a single row with cart_item_id when updating and removing', async () => {
    await updateCartItemDto(555, 3, 901);
    await removeCartItemDto(555, 902);

    expect(apiClient.patch).toHaveBeenCalledWith('/cart/update', {
      variant_id: 555,
      quantity: 3,
      cart_item_id: 901,
    });
    expect(apiClient.delete).toHaveBeenCalledWith('/cart/remove', {
      data: { variant_id: 555, cart_item_id: 902 },
    });
  });

  it('keeps the variant-only payload when no cart_item_id is known', async () => {
    await removeCartItemDto(555);

    expect(apiClient.delete).toHaveBeenCalledWith('/cart/remove', { data: { variant_id: 555 } });
  });
});

describe('addCartGiftDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts the chosen gift and returns the backend message', async () => {
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: { message: 'Hediye ürün seçtiğiniz bedenle sepete eklendi.', already_added: false },
    });

    const result = await addCartGiftDto({ campaignId: 12, productId: 77, variantId: 3001, quantity: 1 });

    expect(apiClient.post).toHaveBeenCalledWith('/cart/gifts/add', {
      campaign_id: 12,
      product_id: 77,
      variant_id: 3001,
      quantity: 1,
    });
    expect(result.message).toBe('Hediye ürün seçtiğiniz bedenle sepete eklendi.');
  });

  it('adds the guest device id when there is no session', async () => {
    (getAccessToken as jest.Mock).mockResolvedValueOnce(null);

    await addCartGiftDto({ campaignId: 12, productId: 77, variantId: 3001, quantity: 1 });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/cart/gifts/add',
      expect.objectContaining({ device_id: 'device-1' }),
    );
  });
});

describe('getCartCampaignsDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends the listed category as c so the backend returns its gift campaign', async () => {
    await getCartCampaignsDto(48);

    expect(apiClient.get).toHaveBeenCalledWith('/cart/campaigns', { params: { c: 48 } });
  });

  it('sends no category for a listing without one', async () => {
    await getCartCampaignsDto();

    expect(apiClient.get).toHaveBeenCalledWith('/cart/campaigns', { params: undefined });
  });
});

describe('getCartDto', () => {
  it('passes the available gifts through and defaults them to an empty list', async () => {
    const gift = {
      product_id: 77,
      name: 'Çorap',
      image: null,
      quantity: 1,
      campaign_ids: [12],
      variants: [],
    };
    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ data: { cart: [], available_gifts: [gift] } })
      .mockResolvedValueOnce({ data: { cart: [] } });

    expect((await getCartDto()).available_gifts).toEqual([gift]);
    expect((await getCartDto()).available_gifts).toEqual([]);
  });
});
