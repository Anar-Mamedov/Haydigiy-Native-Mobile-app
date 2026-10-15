import { StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { CardFavoriteButton } from './card-favorite-button';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('CardFavoriteButton', () => {
  it('gives the small heart chip a 48dp touch area anchored to the card corner', () => {
    // Regresyon: 26–28dp kalp çipi Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<CardFavoriteButton iconSize={14} isFavorite={false} onPress={jest.fn()} productTitle="Elbise" />);

    const button = screen.getByLabelText('Elbise favorilere ekle');
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      minHeight: 48,
      minWidth: 48,
      paddingBottom: 8,
      paddingLeft: 8,
      paddingRight: 8,
      paddingTop: 8,
    });
  });

  it('announces the current state and calls onPress', () => {
    const onPress = jest.fn();
    renderWithTamagui(<CardFavoriteButton iconSize={16} isFavorite onPress={onPress} productTitle="Elbise" />);

    const button = screen.getByLabelText('Elbise favorilerden çıkar');
    expect(button.props.accessibilityState).toMatchObject({ selected: true });

    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders in the dark theme', () => {
    renderWithTamagui(<CardFavoriteButton iconSize={14} isFavorite={false} onPress={jest.fn()} productTitle="Elbise" />, 'dark');

    expect(screen.getByLabelText('Elbise favorilere ekle')).toBeTruthy();
  });
});
