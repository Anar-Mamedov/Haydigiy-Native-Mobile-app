import { StyleSheet } from 'react-native';
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

    fireEvent.press(screen.getByLabelText('1. değerlendirmenin fotoğrafını aç'));

    expect(onReviewsPress).toHaveBeenCalledTimes(1);
  });

  it('gives every review photo its own label', () => {
    // Regresyon: tüm fotoğraf butonları aynı "Degerlendirme fotografini ac" etiketini taşıyordu;
    // ekran okuyucu bunları ayırt edemiyor, Play "yinelenen etiket" uyarısı veriyor.
    renderWithTamagui(
      <ProductReviewsSection
        averageRating={4.3}
        onReviewsPress={jest.fn()}
        reviews={[reviews[0], { ...reviews[0], id: '2' }]}
      />,
    );

    expect(screen.getByLabelText('1. değerlendirmenin fotoğrafını aç')).toBeTruthy();
    expect(screen.getByLabelText('2. değerlendirmenin fotoğrafını aç')).toBeTruthy();
  });

  it('labels the average rating row as a button that opens all reviews', () => {
    const onReviewsPress = jest.fn();
    renderWithTamagui(
      <ProductReviewsSection averageRating={4.3} onReviewsPress={onReviewsPress} reviews={reviews} />,
    );

    const row = screen.getByLabelText('Ortalama puan 4.3, 1 değerlendirme');
    expect(row.props.accessibilityRole).toBe('button');

    fireEvent.press(row);
    expect(onReviewsPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the "see all reviews" button at the 48dp touch target in both themes', () => {
    for (const theme of ['light', 'dark'] as const) {
      const view = renderWithTamagui(
        <ProductReviewsSection averageRating={4.3} onReviewsPress={jest.fn()} reviews={reviews} />,
        theme,
      );

      const button = screen.getByRole('button', { name: /TÜM YORUMLARI GÖSTER/ });
      expect(StyleSheet.flatten(button.props.style)).toMatchObject({ height: 48 });
      expect(screen.getByText('TÜM YORUMLARI GÖSTER')).toBeTruthy();
      view.unmount();
    }
  });
});
