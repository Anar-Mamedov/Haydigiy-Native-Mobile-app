import { getInstallmentsDto } from './installment.service';
import { apiClient } from '@/lib/axios';

jest.mock('@/lib/axios', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

const post = apiClient.post as jest.Mock;

describe('getInstallmentsDto', () => {
  beforeEach(() => jest.clearAllMocks());

  // Web parity (front 5554d034d): plans come from the backend payment router, which
  // answers with the active installment gateway; the app no longer asks İyzico directly.
  it('asks the payment router for the BIN plans with the single-payment amount', async () => {
    const dto = {
      status: 'success',
      installmentDetails: [
        { installmentPrices: [{ installmentNumber: 2, installmentPrice: 529.94, totalPrice: 1059.88 }] },
      ],
    };
    post.mockResolvedValueOnce({ data: dto });

    await expect(getInstallmentsDto('54006100', 1000)).resolves.toEqual(dto);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith('/payment-router/installments', {
      binNumber: '54006100',
      price: 1000,
    });
  });
});
