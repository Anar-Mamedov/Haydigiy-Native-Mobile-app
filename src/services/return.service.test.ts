import { submitReturnRequestDto } from './return.service';
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

describe('submitReturnRequestDto — refund details', () => {
  beforeEach(() => jest.clearAllMocks());

  // Web `b339307e6` / backend `0b6d92d`: yöntem seçimi kalktı, kapıda ödeme iadesi her zaman IBAN'a.
  it('never sends refund_method_id', async () => {
    await submitReturnRequestDto({ ...BASE_PAYLOAD, iban: 'TR000000000000000000000000', ibanName: 'Test Kullanıcı' });

    expect(lastFormEntries()).not.toHaveProperty('refund_method_id');
  });

  it('omits the IBAN fields for a card-paid order', async () => {
    await submitReturnRequestDto(BASE_PAYLOAD);

    const entries = lastFormEntries();
    expect(entries).not.toHaveProperty('iban');
    expect(entries).not.toHaveProperty('iban_name');
  });

  it('sends the IBAN fields for a pay-on-delivery refund', async () => {
    await submitReturnRequestDto({
      ...BASE_PAYLOAD,
      iban: 'TR000000000000000000000000',
      ibanName: 'Test Kullanıcı',
    });

    const entries = lastFormEntries();
    expect(entries.iban).toBe('TR000000000000000000000000');
    expect(entries.iban_name).toBe('Test Kullanıcı');
  });
});
