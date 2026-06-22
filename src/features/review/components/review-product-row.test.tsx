import { fireEvent, screen } from '@testing-library/react-native';
import { ReviewProductRow } from './review-product-row';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { UserReview } from '@/types/review.types';

const review: UserReview = {
  id: '1',
  orderItemId: 10,
  orderId: 5,
  productId: 100,
  variantId: 200,
  slug: 'urun',
  productName: 'Çizgili Gömlek',
  variantName: 'M',
  productImage: 'img.jpg',
  deliveredAt: '2026-01-01',
  rating: null,
  comment: null,
  isReviewed: false,
};

describe('ReviewProductRow', () => {
  it('lets a pending unreviewed item be reviewed', () => {
    const onReviewPress = jest.fn();
    renderWithTamagui(
      <ReviewProductRow
        activeTab="pending"
        onProductPress={jest.fn()}
        onReviewPress={onReviewPress}
        review={review}
      />,
    );

    expect(screen.getByText('Ürünü Değerlendir')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Ürünü değerlendir'));
    expect(onReviewPress).toHaveBeenCalledWith(review);
  });

  it('shows a disabled "Değerlendirildi" action and stars for an approved item', () => {
    const onReviewPress = jest.fn();
    renderWithTamagui(
      <ReviewProductRow
        activeTab="approved"
        onProductPress={jest.fn()}
        onReviewPress={onReviewPress}
        review={{ ...review, isReviewed: true, rating: 4 }}
      />,
    );

    expect(screen.getByText('Değerlendirildi')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Değerlendirildi'));
    expect(onReviewPress).not.toHaveBeenCalled();
  });
});
