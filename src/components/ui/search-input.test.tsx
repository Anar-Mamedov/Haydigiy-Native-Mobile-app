import { Platform, StyleSheet } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { SearchInput } from './search-input';
import { renderWithTamagui } from '@/test/render-with-tamagui';

describe('SearchInput', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it.each(['light', 'dark'] as const)('exposes its label and reports typed text in the %s theme', (theme) => {
    const onChangeText = jest.fn();
    renderWithTamagui(
      <SearchInput accessibilityLabel="Siparişlerde ara" onChangeText={onChangeText} placeholder="Ara..." value="" />,
      theme,
    );

    fireEvent.changeText(screen.getByLabelText('Siparişlerde ara'), 'elbise');

    expect(onChangeText).toHaveBeenCalledWith('elbise');
  });

  it('makes the field itself 48dp tall, not just its bordered box', () => {
    // Regresyon: 48dp çerçeveli kutudaki alan 46–47dp kalıyor, Play "Dokunma hedefi boyutu" uyarısı veriyordu.
    renderWithTamagui(<SearchInput onChangeText={jest.fn()} placeholder="Ara..." value="" />);

    expect(StyleSheet.flatten(screen.getByPlaceholderText('Ara...').props.style)).toMatchObject({ minHeight: 48 });
  });

  it('lets the placeholder name the field on Android instead of a contentDescription', () => {
    Platform.OS = 'android';
    renderWithTamagui(<SearchInput accessibilityLabel="Siparişlerde ara" onChangeText={jest.fn()} value="" />);

    expect(screen.getByPlaceholderText('Ara...').props.accessibilityLabel).toBeUndefined();
  });
});
