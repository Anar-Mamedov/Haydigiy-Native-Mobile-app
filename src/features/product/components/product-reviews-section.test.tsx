import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductReview } from '@/types/product.types';
import { ProductReviewsSection } from './product-reviews-section';

const reviews: ProductReview[] = [
  {
    id: '1',
    rating: 3,
    comment: 'Urun gercekten guzel her kez numarasini alsin ben beyendim',
    photo: 'https://cdn.example.com/storage/reviews/photo.webp',
    userName: 'T***e',
    userSurname: 'U***r',
    createdAt: '2026-05-24T00:00:00Z',
  },
];

describe('ProductReviewsSection', () => {
  it('renders uploaded review photos as frontend-style thumbnails', () => {
    renderWithTamagui(
      <ProductReviewsSection averageRating={4.3} onReviewsPress={jest.fn()} reviews={reviews} />,
    );

    expect(screen.getByTestId('product-review-photo-1')).toBeTruthy();
  });

  it('opens all reviews when the review photo thumbnail is pressed', () => {
    const onReviewsPress = jest.fn();

    renderWithTamagui(
      <ProductReviewsSection averageRating={4.3} onReviewsPress={onReviewsPress} reviews={reviews} />,
    );

    fireEvent.press(screen.getByLabelText('Degerlendirme fotografini ac'));

    expect(onReviewsPress).toHaveBeenCalledTimes(1);
  });
});
