import { reorderOrderDto } from './order.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const post = apiClient.post as jest.Mock;

function axiosError(status: number, data: unknown) {
  return {
    isAxiosError: true,
    message: `Request failed with status code ${status}`,
    response: { data, status },
  };
}

describe('reorderOrderDto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks first with an empty body', async () => {
    post.mockResolvedValueOnce({ data: { success: true, requires_confirmation: true } });

    await expect(reorderOrderDto('42')).resolves.toEqual({
      success: true,
      requires_confirmation: true,
    });
    expect(post).toHaveBeenCalledWith('/order/42/reorder', {});
  });

  it('sends the confirmation flag once the customer accepted', async () => {
    post.mockResolvedValueOnce({ data: { success: true, added_to_cart: true } });

    await reorderOrderDto(42, true);

    expect(post).toHaveBeenCalledWith('/order/42/reorder', { confirmed: true });
  });

  // 422 "hiçbiri stokta yok" bir iş sonucudur; gövdesi ekranda mesaj olarak gösterilir.
  it('returns the 422 "all out of stock" body instead of throwing', async () => {
    const body = { success: false, all_out_of_stock: true, message: 'Hiçbiri stokta yok.' };
    post.mockRejectedValueOnce(axiosError(422, body));

    await expect(reorderOrderDto('42')).resolves.toBe(body);
  });

  it('rethrows any other failure', async () => {
    const validation = axiosError(422, { message: 'The confirmed field must be true or false.' });
    post.mockRejectedValueOnce(validation);
    await expect(reorderOrderDto('42')).rejects.toBe(validation);

    const notFound = axiosError(404, { message: 'Sipariş bulunamadı.' });
    post.mockRejectedValueOnce(notFound);
    await expect(reorderOrderDto('42')).rejects.toBe(notFound);

    const network = { isAxiosError: true, code: 'ERR_NETWORK', message: 'Network Error' };
    post.mockRejectedValueOnce(network);
    await expect(reorderOrderDto('42')).rejects.toBe(network);
  });
});
