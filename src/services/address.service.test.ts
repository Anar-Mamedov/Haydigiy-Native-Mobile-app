import {
  addAddressDto,
  isDefaultAddressResponse,
  NewAddressInput,
  updateAddressDto,
} from './address.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
    put: jest.fn(async () => ({ data: {} })),
    delete: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const post = apiClient.post as jest.Mock;
const put = apiClient.put as jest.Mock;

const INPUT: NewAddressInput = {
  title: 'Ev',
  name: 'Anar',
  surname: 'Mamedov',
  phone: '05551234567',
  cityId: '34',
  districtId: '198',
  neighbourhoodId: '1024',
  addressLine: 'Cadde 1',
  invoiceType: 'individual',
};

describe('addAddressDto', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends the "Varsayılan adres" choice like the web add form', async () => {
    await addAddressDto({ ...INPUT, isDefault: true });
    expect(post).toHaveBeenCalledWith('/addresses', expect.objectContaining({ is_default: true }));

    await addAddressDto({ ...INPUT, isDefault: false });
    expect(post).toHaveBeenLastCalledWith(
      '/addresses',
      expect.objectContaining({ is_default: false }),
    );
  });

  // İade akışı varsayılan bayrağı göndermez; istek o alana hiç dokunmamalı.
  it('leaves the default flag out when the caller does not choose one', async () => {
    await addAddressDto(INPUT);
    expect(post.mock.calls[0][1]).not.toHaveProperty('is_default');
  });
});

describe('updateAddressDto', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends an unticked default flag in the PUT body and stops there', async () => {
    await updateAddressDto('7', { ...INPUT, isDefault: false });

    expect(put).toHaveBeenCalledWith('/addresses/7', expect.objectContaining({ is_default: false }));
    expect(post).not.toHaveBeenCalled();
  });

  it('finishes a ticked default through make-default when the PUT did not apply it', async () => {
    put.mockResolvedValueOnce({ data: { address: { id: 7, is_default: 0 } } });

    await updateAddressDto('7', { ...INPUT, isDefault: true });

    expect(put.mock.calls[0][1]).not.toHaveProperty('is_default');
    expect(post).toHaveBeenCalledWith('/addresses/7/make-default');
  });

  it('skips make-default when the PUT response already reports the default', async () => {
    put.mockResolvedValueOnce({ data: { id: 7, is_default: true } });

    await updateAddressDto('7', { ...INPUT, isDefault: true });

    expect(post).not.toHaveBeenCalled();
  });

  it('does not save as default when the PUT fails', async () => {
    put.mockRejectedValueOnce(new Error('network'));

    await expect(updateAddressDto('7', { ...INPUT, isDefault: true })).rejects.toThrow('network');
    expect(post).not.toHaveBeenCalled();
  });
});

describe('isDefaultAddressResponse', () => {
  it('reads wrapped and bare address bodies in every flag format', () => {
    expect(isDefaultAddressResponse({ address: { is_default: 1 } })).toBe(true);
    expect(isDefaultAddressResponse({ is_default: '1' })).toBe(true);
    expect(isDefaultAddressResponse({ is_default: true })).toBe(true);
    expect(isDefaultAddressResponse({ address: { is_default: false } })).toBe(false);
    expect(isDefaultAddressResponse('ok')).toBe(false);
    expect(isDefaultAddressResponse(null)).toBe(false);
  });
});
