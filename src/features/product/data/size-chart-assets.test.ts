import {
  getSizeChartImageSource,
  getSizeChartSections,
  SIZE_CHART_GENDER_OPTIONS,
  SIZE_CHART_SECTION_OPTIONS,
} from './size-chart-assets';

describe('size chart assets', () => {
  it('provides an image source for every selectable size chart tab', () => {
    for (const gender of SIZE_CHART_GENDER_OPTIONS) {
      for (const section of getSizeChartSections(gender.value)) {
        expect(getSizeChartImageSource(gender.value, section.value)).toBeTruthy();
      }
    }
  });

  it('offers clothing and shoes for children, but no trousers chart', () => {
    expect(getSizeChartSections('cocuk').map((section) => section.value)).toEqual([
      'giyim',
      'ayakkabi',
    ]);
  });

  it('offers every section for women and men', () => {
    const allSections = SIZE_CHART_SECTION_OPTIONS.map((section) => section.value);

    expect(getSizeChartSections('kadin').map((section) => section.value)).toEqual(allSections);
    expect(getSizeChartSections('erkek').map((section) => section.value)).toEqual(allSections);
  });

  it('gives children their own shoe chart instead of the clothing one', () => {
    const childClothing = getSizeChartImageSource('cocuk', 'giyim');

    expect(getSizeChartImageSource('cocuk', 'ayakkabi')).toBeTruthy();
    expect(getSizeChartImageSource('cocuk', 'ayakkabi')).not.toBe(childClothing);
  });

  it('falls back to the clothing chart for the child trousers section', () => {
    expect(getSizeChartImageSource('cocuk', 'pantolon')).toBe(
      getSizeChartImageSource('cocuk', 'giyim'),
    );
  });
});
