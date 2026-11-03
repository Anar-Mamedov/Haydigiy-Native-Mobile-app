import { render, screen } from '@testing-library/react-native';
import { ProductFeedbackSheet } from './product-feedback-sheet';

jest.mock('@/features/customer-feedback/components/customer-feedback-sheet', () => ({
  CustomerFeedbackSheet: ({ productId, initialCategoryKey }: { productId: number | null; initialCategoryKey?: string }) => {
    const { Text: RNText } = jest.requireActual('react-native');
    return <RNText>{`yeni-form:${productId}:${initialCategoryKey}`}</RNText>;
  },
}));

describe('ProductFeedbackSheet (sözleşme v1.1 §2)', () => {
  it('always opens the site-wide form on "Ürünle İlgili Sorunlar" with the numeric product id', () => {
    render(<ProductFeedbackSheet onOpenChange={jest.fn()} open productId="123" />);
    expect(screen.getByText('yeni-form:123:product_issues')).toBeTruthy();
  });

  it('sends no product id when the id is not numeric', () => {
    render(<ProductFeedbackSheet onOpenChange={jest.fn()} open productId="abc" />);
    expect(screen.getByText('yeni-form:null:product_issues')).toBeTruthy();
  });
});
