import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductInfo } from './product-info';

function renderInfo(theme: 'light' | 'dark' = 'light', handlers = { onQuestionsPress: jest.fn(), onReviewsPress: jest.fn() }) {
  renderWithTamagui(
    <ProductInfo
      brand="HaydiGiy"
      questionsCount={4}
      rating={4.5}
      reviewCount={12}
      title="Keten Elbise"
      {...handlers}
    />,
    theme,
  );
  return handlers;
}

describe('ProductInfo rating row', () => {
  it('opens reviews and questions from 48dp text actions', () => {
    // Regresyon: bağlantılar 22dp yüksekliğindeydi (hitSlop taramaya görünmüyor).
    const handlers = renderInfo();

    const reviews = screen.getByLabelText('12 değerlendirme');
    const questions = screen.getByLabelText('4 soru ve cevap');
    expect(StyleSheet.flatten(reviews.props.style)).toMatchObject({ minHeight: 48 });
    expect(StyleSheet.flatten(questions.props.style)).toMatchObject({ minHeight: 48 });
    expect(reviews.props.accessibilityRole).toBe('button');

    fireEvent.press(reviews);
    fireEvent.press(questions);
    expect(handlers.onReviewsPress).toHaveBeenCalledTimes(1);
    expect(handlers.onQuestionsPress).toHaveBeenCalledTimes(1);
  });

  it('separates the links with a line instead of a "|" character', () => {
    // Regresyon: "|" metni zemine karşı 1.3:1 kontrastla metin kontrastı uyarısı veriyordu.
    renderInfo();

    expect(screen.queryByText('|')).toBeNull();
    expect(screen.getByTestId('product-info-rating-divider')).toBeTruthy();
  });

  it('keeps the row as tall as its text so the layout does not grow', () => {
    renderInfo();

    let row = screen.getByLabelText('12 değerlendirme').parent;
    while (row && StyleSheet.flatten(row.props?.style)?.marginTop === undefined) {
      row = row.parent;
    }
    expect(StyleSheet.flatten(row?.props.style)).toMatchObject({ marginBottom: -13, marginTop: -13 });
  });

  it('keeps both links readable in the dark theme', () => {
    renderInfo('dark');

    expect(screen.getByText('12 Değerlendirme')).toBeTruthy();
    expect(screen.getByText('4 Soru & Cevap')).toBeTruthy();
  });
});
