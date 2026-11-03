import { render, screen } from '@testing-library/react-native';
import { ProductFeedbackSheet } from './product-feedback-sheet';

jest.mock('@/features/customer-feedback/hooks/use-customer-feedback-v2', () => ({ useCustomerFeedbackV2Enabled: jest.fn() }));
jest.mock('@/features/customer-feedback/components/customer-feedback-sheet', () => ({
  CustomerFeedbackSheet: ({ productId }: { productId: number | null }) => {
    const { Text: RNText } = jest.requireActual('react-native');
    return <RNText>{`yeni-form:${productId}`}</RNText>;
  },
}));
jest.mock('./product-detail-modals', () => ({
  FeedbackModal: ({ productSlug }: { productSlug: string }) => {
    const { Text: RNText } = jest.requireActual('react-native');
    return <RNText>{`eski-form:${productSlug}`}</RNText>;
  },
}));

const { useCustomerFeedbackV2Enabled } = jest.requireMock('@/features/customer-feedback/hooks/use-customer-feedback-v2') as {
  useCustomerFeedbackV2Enabled: jest.Mock;
};

describe('ProductFeedbackSheet (customer_feedback_v2)', () => {
  it('keeps the old fixed-category sheet while the flag is off', () => {
    useCustomerFeedbackV2Enabled.mockReturnValue(false);
    render(<ProductFeedbackSheet onOpenChange={jest.fn()} open productId="123" productSlug="elbise" />);
    expect(screen.getByText('eski-form:elbise')).toBeTruthy();
  });

  it('opens the new site-wide form with the numeric product id when the flag is on', () => {
    useCustomerFeedbackV2Enabled.mockReturnValue(true);
    render(<ProductFeedbackSheet onOpenChange={jest.fn()} open productId="123" productSlug="elbise" />);
    expect(screen.getByText('yeni-form:123')).toBeTruthy();
  });
});
