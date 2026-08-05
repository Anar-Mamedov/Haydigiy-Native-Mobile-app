import { createElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useSubmitReviewMutation } from './review.mutations';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import * as reviewService from '@/services/review.service';

jest.mock('@/services/review.service', () => ({
  submitReviewDto: jest.fn(async () => undefined),
}));

jest.mock('@/features/insider/services/insider-tracker', () => ({
  insiderTracker: {
    trackReviewSubmitted: jest.fn(),
  },
}));

const submitReviewDto = reviewService.submitReviewDto as jest.MockedFunction<
  typeof reviewService.submitReviewDto
>;
const trackerMock = insiderTracker as jest.Mocked<typeof insiderTracker>;

const payload = {
  productId: 42,
  variantId: 7,
  rating: 5,
  comment: 'Harika ürün',
};

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  jest.clearAllMocks();
  submitReviewDto.mockResolvedValue(undefined);
});

describe('useSubmitReviewMutation', () => {
  it('sends the yorum_yapildi event after the review is saved', async () => {
    const { result } = renderHook(() => useSubmitReviewMutation('order-1'), { wrapper });

    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(submitReviewDto).toHaveBeenCalledWith(payload);
    expect(trackerMock.trackReviewSubmitted).toHaveBeenCalledWith({
      productId: '42',
      rating: 5,
    });
  });

  it('does not send the event when the submission fails', async () => {
    submitReviewDto.mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useSubmitReviewMutation('order-1'), { wrapper });

    result.current.mutate(payload);
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(trackerMock.trackReviewSubmitted).not.toHaveBeenCalled();
  });
});
