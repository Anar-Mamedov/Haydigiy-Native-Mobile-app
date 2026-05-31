import {
  getSizeChartImageSource,
  SIZE_CHART_GENDER_OPTIONS,
  SIZE_CHART_SECTION_OPTIONS,
} from './size-chart-assets';

describe('size chart assets', () => {
  it('provides an image source for every selectable size chart tab', () => {
    for (const gender of SIZE_CHART_GENDER_OPTIONS) {
      const sections = gender.value === 'cocuk'
        ? SIZE_CHART_SECTION_OPTIONS.filter((section) => section.value === 'giyim')
        : SIZE_CHART_SECTION_OPTIONS;

      for (const section of sections) {
        expect(getSizeChartImageSource(gender.value, section.value)).toBeTruthy();
      }
    }
  });

  it('uses the child chart for every child section fallback', () => {
    const childChart = getSizeChartImageSource('cocuk', 'giyim');

    expect(getSizeChartImageSource('cocuk', 'ayakkabi')).toBe(childChart);
    expect(getSizeChartImageSource('cocuk', 'pantolon')).toBe(childChart);
  });
});
