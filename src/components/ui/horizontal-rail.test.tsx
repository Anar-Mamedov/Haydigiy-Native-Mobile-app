import { FlashList } from '@shopify/flash-list';
import { screen } from '@testing-library/react-native';
import { Text } from 'tamagui';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { HorizontalRail } from './horizontal-rail';

type Card = { id: string; title: string };

const cards: Card[] = [
  { id: 'a', title: 'Bluz' },
  { id: 'b', title: 'Etek' },
  { id: 'c', title: 'Tayt' },
];

const renderRail = () =>
  renderWithTamagui(
    <HorizontalRail
      data={cards}
      gap={12}
      keyExtractor={(card) => card.id}
      paddingHorizontal={16}
      paddingTop={10}
      renderItem={(card, index) => <Text>{`${index + 1}. ${card.title}`}</Text>}
      testID="rail"
    />,
  );

describe('HorizontalRail', () => {
  it('renders every card with its position', () => {
    renderRail();

    expect(screen.getByText('1. Bluz')).toBeTruthy();
    expect(screen.getByText('2. Etek')).toBeTruthy();
    expect(screen.getByText('3. Tayt')).toBeTruthy();
  });

  it('windows the cards through a horizontal FlashList instead of a plain ScrollView', () => {
    renderRail();

    const list = screen.UNSAFE_getByType(FlashList);
    expect(list.props.horizontal).toBe(true);
    expect(list.props.contentContainerStyle).toEqual({ paddingBottom: 0, paddingHorizontal: 16, paddingTop: 10 });
    expect(list.props.ItemSeparatorComponent).toBeTruthy();
  });

  it('puts the gap only between cards', () => {
    renderRail();

    const Gap = screen.UNSAFE_getByType(FlashList).props.ItemSeparatorComponent;
    expect(screen.UNSAFE_getAllByType(Gap)).toHaveLength(cards.length - 1);
  });
});
