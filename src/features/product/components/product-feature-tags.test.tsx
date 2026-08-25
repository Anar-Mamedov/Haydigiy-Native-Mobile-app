import { act, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { renderWithTamagui } from '@/test/render-with-tamagui';
import {
  buildDescriptionTickerItems,
  ProductFeatureAssetTicker,
  ProductFeatureDescriptionList,
  ProductFeatureDescriptionTicker,
  RANKING_TICKER_ITEM_ID,
} from './product-feature-tags';
import { RANKING_BADGE_GRADIENT } from '@/lib/theme/colors';
import { FeatureIcon } from '@/types/product.types';

const featureIcons: FeatureIcon[] = [
  {
    id: 15,
    name: 'Butik Kontrol',
    slug: 'butik-kontrol',
    description: 'Butik kontrol edildi',
    descriptionBgColor: '#111111',
    assetUrl: 'https://cdn.example.com/tags/butik.png',
    displayOrder: 2,
  },
  {
    id: 20,
    name: 'Peşin Fiyatına 3 Taksit',
    slug: 'pesin-fiyatina-3-taksit',
    description: 'Peşin Fiyatına 3 Taksit',
    descriptionBgColor: '#FF8800',
    assetUrl: 'https://cdn.example.com/tags/installment.png',
    displayOrder: 1,
  },
];

describe('product feature tags', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows feature assets and descriptions one by one in backend order', () => {
    renderWithTamagui(
      <YStack>
        <ProductFeatureAssetTicker featureIcons={featureIcons} />
        <ProductFeatureDescriptionTicker featureIcons={featureIcons} />
      </YStack>,
    );

    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
    expect(screen.getByLabelText('Peşin Fiyatına 3 Taksit ürün etiketi')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Butik kontrol edildi')).toBeTruthy();
    expect(screen.getByLabelText('Butik Kontrol ürün etiketi')).toBeTruthy();
  });

  it('lists every description at once in backend order and never rotates', () => {
    renderWithTamagui(<ProductFeatureDescriptionList featureIcons={featureIcons} />);

    const list = screen.getByTestId('product-feature-description-list');
    expect(list).toBeTruthy();
    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
    expect(screen.getByText('Butik kontrol edildi')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(9000);
    });

    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();
    expect(screen.getByText('Butik kontrol edildi')).toBeTruthy();
  });

  it('renders nothing when no feature icon carries a description', () => {
    renderWithTamagui(
      <ProductFeatureDescriptionList
        featureIcons={[{ id: 1, name: 'Etiket', slug: 'etiket', assetUrl: '', description: '   ' }]}
      />,
    );

    expect(screen.queryByTestId('product-feature-description-list')).toBeNull();
  });

  it('rotates the ranking badge in after every feature description', () => {
    renderWithTamagui(
      <ProductFeatureDescriptionTicker featureIcons={featureIcons} rankingText=" En çok satan 3. ürün " />,
    );

    expect(screen.getByText('Peşin Fiyatına 3 Taksit')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('Butik kontrol edildi')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('🏅 En çok satan 3. ürün')).toBeTruthy();
  });

  it('shows the ranking badge on its own when no feature carries a description', () => {
    renderWithTamagui(
      <ProductFeatureDescriptionTicker
        featureIcons={[{ id: 1, name: 'Etiket', slug: 'etiket', assetUrl: '', description: '   ' }]}
        rankingText="En çok favorilenen ürün"
      />,
    );

    expect(screen.getByText('🏅 En çok favorilenen ürün')).toBeTruthy();
  });

  it('keeps the ticker hidden when the ranking text is blank', () => {
    renderWithTamagui(<ProductFeatureDescriptionTicker featureIcons={[]} rankingText="   " />);

    expect(screen.queryByTestId('product-feature-description')).toBeNull();
  });

  it('draws the ranking badge with a gradient instead of a flat color', () => {
    renderWithTamagui(<ProductFeatureDescriptionTicker featureIcons={[]} rankingText="En çok satan 3. ürün" />);

    expect(screen.getByTestId('product-feature-description-gradient')).toBeTruthy();
  });

  it('draws feature descriptions with the flat backend color', () => {
    renderWithTamagui(<ProductFeatureDescriptionTicker featureIcons={featureIcons} />);

    expect(screen.queryByTestId('product-feature-description-gradient')).toBeNull();
    expect(StyleSheet.flatten(screen.getByTestId('product-feature-description').props.style)?.backgroundColor).toBe(
      '#FF8800',
    );
  });

  it('rotates only the tags the backend pinned to the top-left corner', () => {
    renderWithTamagui(
      <ProductFeatureAssetTicker
        featureIcons={[
          { ...featureIcons[1], positionHint: 'top-right' },
          { ...featureIcons[0], positionHint: null, position: null },
        ]}
      />,
    );

    expect(screen.getByLabelText('Butik Kontrol ürün etiketi')).toBeTruthy();
    expect(screen.queryByLabelText('Peşin Fiyatına 3 Taksit ürün etiketi')).toBeNull();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByLabelText('Butik Kontrol ürün etiketi')).toBeTruthy();
  });

  it('renders no asset badge when every tag belongs to another corner', () => {
    renderWithTamagui(<ProductFeatureAssetTicker featureIcons={[{ ...featureIcons[0], position: 'center' }]} />);

    expect(screen.queryByTestId('product-feature-asset')).toBeNull();
  });

  it('cross-fades while more than one badge rotates', () => {
    renderWithTamagui(<ProductFeatureAssetTicker featureIcons={featureIcons} />);

    expect(screen.getByTestId('product-feature-asset').props.transition).toMatchObject({ duration: 300 });
  });

  it('does not fade a single static badge', () => {
    renderWithTamagui(<ProductFeatureAssetTicker featureIcons={[featureIcons[0]]} />);

    expect(screen.getByTestId('product-feature-asset').props.transition).toMatchObject({ duration: 0 });
  });
});

describe('buildDescriptionTickerItems', () => {
  it('appends the trimmed ranking badge last and paints it with the brand gradient', () => {
    const items = buildDescriptionTickerItems(featureIcons, '  En çok satan 3. ürün  ');

    expect(items).toHaveLength(3);
    expect(items[2]).toEqual({
      id: RANKING_TICKER_ITEM_ID,
      text: '🏅 En çok satan 3. ürün',
      background: { type: 'gradient', colors: RANKING_BADGE_GRADIENT },
    });
  });

  it('keeps the backend solid color for feature descriptions', () => {
    expect(buildDescriptionTickerItems(featureIcons, null)[0].background).toEqual({
      type: 'color',
      color: '#FF8800',
    });
  });

  it('keeps only the feature descriptions when no ranking text arrives', () => {
    expect(buildDescriptionTickerItems(featureIcons, null).map((item) => item.text)).toEqual([
      'Peşin Fiyatına 3 Taksit',
      'Butik kontrol edildi',
    ]);
  });
});
