import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { ProductQuestion } from '@/types/product.types';
import { ProductQuestionsSection } from './product-questions-section';

const question: ProductQuestion = {
  id: 'q-1',
  question: 'Kalıbı nasıl?',
  reply: 'Normal kalıptır.',
  userName: 'A***',
  createdAt: '2026-05-24T00:00:00Z',
};

describe('ProductQuestionsSection', () => {
  it.each(['light', 'dark'] as const)('opens all questions from a 48dp button (%s)', (theme) => {
    const onQuestionsPress = jest.fn();
    renderWithTamagui(<ProductQuestionsSection onQuestionsPress={onQuestionsPress} questions={[question]} />, theme);

    const button = screen.getByRole('button', { name: /TÜM SORULARI GÖSTER/ });
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ height: 48 });

    fireEvent.press(button);
    expect(onQuestionsPress).toHaveBeenCalledTimes(1);
  });

  it('asks the first question from a 48dp button when there are none', () => {
    renderWithTamagui(<ProductQuestionsSection onQuestionsPress={jest.fn()} questions={[]} />);

    const button = screen.getByRole('button', { name: /İLK SORUYU SEN SOR/ });
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({ height: 48 });
  });

  it('shows the like count as plain text instead of a button that does nothing', () => {
    renderWithTamagui(<ProductQuestionsSection onQuestionsPress={jest.fn()} questions={[question]} />);

    expect(screen.getByText('Soruyu Beğen (0)')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Soruyu Beğen/ })).toBeNull();
  });
});
