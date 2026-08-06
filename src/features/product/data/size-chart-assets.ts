export type SizeChartGender = 'kadin' | 'erkek' | 'cocuk';
export type SizeChartSection = 'giyim' | 'ayakkabi' | 'pantolon';

export const SIZE_CHART_GENDER_OPTIONS: ReadonlyArray<{
  label: string;
  value: SizeChartGender;
}> = [
  { label: 'KADIN', value: 'kadin' },
  { label: 'ERKEK', value: 'erkek' },
  { label: 'ÇOCUK', value: 'cocuk' },
];

export const SIZE_CHART_SECTION_OPTIONS: ReadonlyArray<{
  label: string;
  value: SizeChartSection;
}> = [
  { label: 'Giyim', value: 'giyim' },
  { label: 'Ayakkabı', value: 'ayakkabi' },
  { label: 'Pantolon & Alt', value: 'pantolon' },
];

export const SIZE_CHART_ASPECT_RATIO = 497 / 500;

const SIZE_CHART_IMAGE_SOURCES = {
  kadin: {
    giyim: require('../../../../assets/size-charts/kadingiyim.jpg'),
    ayakkabi: require('../../../../assets/size-charts/kadinayakkabi.jpg'),
    pantolon: require('../../../../assets/size-charts/kadinpantolon.jpg'),
  },
  erkek: {
    giyim: require('../../../../assets/size-charts/erkekgiyim.jpg'),
    ayakkabi: require('../../../../assets/size-charts/erkekayakkabi.jpg'),
    pantolon: require('../../../../assets/size-charts/erkekpantolon.jpg'),
  },
  cocuk: {
    giyim: require('../../../../assets/size-charts/cocuk.jpg'),
    ayakkabi: require('../../../../assets/size-charts/cocukayakkabi.jpg'),
  },
} as const;

/**
 * Sections that actually have a chart for this gender, in display order.
 * Children have no separate trousers chart.
 */
export function getSizeChartSections(
  gender: SizeChartGender,
): typeof SIZE_CHART_SECTION_OPTIONS {
  if (gender === 'cocuk') {
    return SIZE_CHART_SECTION_OPTIONS.filter((section) => section.value !== 'pantolon');
  }

  return SIZE_CHART_SECTION_OPTIONS;
}

export function getSizeChartImageSource(
  gender: SizeChartGender,
  section: SizeChartSection,
) {
  if (gender === 'cocuk') {
    return section === 'ayakkabi'
      ? SIZE_CHART_IMAGE_SOURCES.cocuk.ayakkabi
      : SIZE_CHART_IMAGE_SOURCES.cocuk.giyim;
  }

  return SIZE_CHART_IMAGE_SOURCES[gender][section];
}
