import { screen } from '@testing-library/react-native';
import { InsiderRecommendationSections } from './insider-recommendation-sections';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import { InsiderRecommendationSection } from './insider-recommendation-section';

jest.mock('./insider-recommendation-section', () => {
  const React = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');

  return {
    InsiderRecommendationSection: jest.fn(({ campaign }) =>
      React.createElement(Text, null, `campaign:${campaign.id}`),
    ),
  };
});

const sectionMock = InsiderRecommendationSection as unknown as jest.Mock;

beforeEach(() => {
  sectionMock.mockClear();
});

describe('InsiderRecommendationSections', () => {
  /** Panelde ürün detayda iki kampanya var; ikisi de ayrı slider olarak çizilmeli. */
  it('renders one section per campaign of the slot', () => {
    renderWithTamagui(<InsiderRecommendationSections slot="productDetail" />);

    expect(screen.getByText('campaign:1')).toBeTruthy();
    expect(screen.getByText('campaign:2')).toBeTruthy();
    expect(sectionMock).toHaveBeenCalledTimes(2);
  });

  it('forwards the screen inputs to every campaign', () => {
    renderWithTamagui(
      <InsiderRecommendationSections productIds={['10', '11']} slot="cart" />,
    );

    sectionMock.mock.calls.forEach(([props]) => {
      expect(props.productIds).toEqual(['10', '11']);
    });
    expect(sectionMock).toHaveBeenCalledTimes(2);
  });

  it('renders a single section where the panel has one campaign', () => {
    renderWithTamagui(<InsiderRecommendationSections slot="orderSuccess" />);

    expect(screen.getByText('campaign:7')).toBeTruthy();
    expect(sectionMock).toHaveBeenCalledTimes(1);
  });
});
