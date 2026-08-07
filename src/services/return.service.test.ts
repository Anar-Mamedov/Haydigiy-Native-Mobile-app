import { getRefundMethodsDto, submitReturnRequestDto } from './return.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    get: jest.fn(async () => ({ data: {} })),
    post: jest.fn(async () => ({ data: {} })),
    delete: jest.fn(async () => ({ data: {} })),
  },
}));

jest.mock('@/lib/env', () => ({
  appEnv: { apiBaseUrl: 'https://api.test' },
}));

const get = apiClient.get as jest.Mock;
const post = apiClient.post as jest.Mock;

/** Reads the multipart body of the last `POST /return-requests` call. */
function lastFormEntries(): Record<string, string> {
  const form = post.mock.calls.at(-1)?.[1] as FormData;
  const entries: Record<string, string> = {};
  form.forEach((value, key) => {
    entries[key] = String(value);
  });
  return entries;
}

const BASE_PAYLOAD = {
  orderId: 10,
  cargoCompany: 'ptt' as const,
  items: [{ orderItemId: 101, quantity: 1, returnReasonId: 5 }],
};

describe('getRefundMethodsDto', () => {
  beforeEach(() => jest.clearAllMocks());

  it('reads the refund methods from the return-requests endpoint', async () => {
    get.mockResolvedValueOnce({ data: { data: [{ id: 1, name: 'IBAN', code: 'iban' }] } });

    await expect(getRefundMethodsDto()).resolves.toEqual([
      { id: 1, name: 'IBAN', code: 'iban' },
    ]);
    expect(get).toHaveBeenCalledWith('/return-requests/refund-methods');
  });

  it('returns an empty list when the response has no data array', async () => {
    get.mockResolvedValueOnce({ data: {} });

    await expect(getRefundMethodsDto()).resolves.toEqual([]);
  });
});

describe('submitReturnRequestDto — refund method', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends refund_method_id when one was chosen', async () => {
    await submitReturnRequestDto({ ...BASE_PAYLOAD, refundMethodId: 2 });

    expect(lastFormEntries().refund_method_id).toBe('2');
  });

  // Alan gönderilmezse backend IBAN varsayıyor; boş string göndermek bunu bozardı.
  it('omits refund_method_id when none is known', async () => {
    await submitReturnRequestDto({ ...BASE_PAYLOAD, refundMethodId: null });

    expect(lastFormEntries()).not.toHaveProperty('refund_method_id');
  });

  it('omits the IBAN fields when the gift voucher left them empty', async () => {
    await submitReturnRequestDto({ ...BASE_PAYLOAD, refundMethodId: 2 });

    const entries = lastFormEntries();
    expect(entries).not.toHaveProperty('iban');
    expect(entries).not.toHaveProperty('iban_name');
  });

  it('still sends the IBAN fields for an IBAN refund', async () => {
    await submitReturnRequestDto({
      ...BASE_PAYLOAD,
      refundMethodId: 1,
      iban: 'TR000000000000000000000000',
      ibanName: 'Test Kullanıcı',
    });

    const entries = lastFormEntries();
    expect(entries.refund_method_id).toBe('1');
    expect(entries.iban).toBe('TR000000000000000000000000');
    expect(entries.iban_name).toBe('Test Kullanıcı');
  });
});
