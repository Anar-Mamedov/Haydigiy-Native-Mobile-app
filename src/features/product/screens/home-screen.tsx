import { useState } from 'react';
import { RefreshControl, useWindowDimensions } from 'react-native';
import { ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppHeader, AppScreen, EmptyState } from '@/components/ui';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { useMobilePageDesignQuery } from '@/features/product/api/page-design.queries';
import { InsiderRecommendationSections } from '@/features/insider/components/insider-recommendation-sections';
import { useLastViewedInsiderProduct } from '@/features/insider/hooks/use-last-viewed-insider-product';
import { useTrackHomePageView } from '@/features/insider/hooks/use-insider-page-tracking';
import { HomeBannerSection } from '@/features/product/components/home-banner-section';
import { HomeHeadingSection } from '@/features/product/components/home-heading-section';
import { HomeSliderSection } from '@/features/product/components/home-slider-section';
import { HomeStorySection } from '@/features/product/components/home-story-section';
import { HomeTextSection } from '@/features/product/components/home-text-section';
import { MobileHomeSearch } from '@/features/product/components/mobile-home-search';
import { HomeFooter } from '@/features/product/components/home-footer';
import { BannerContent, StoryContent, HeadingContent, TextContent, Section } from '@/types/page-design.types';

export function HomeScreen() {
  useTrackHomePageView();

  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - 20; // 10px padding on each side to match web mobile layout

  const {
    data: designData,
    isPending,
    isError,
    refetch: refetchDesign,
  } = useMobilePageDesignQuery();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchDesign();
    setIsRefreshing(false);
  };

  const handleRetry = () => {
    refetchDesign();
  };

  // Group dynamic sections in order
  const activeSections = designData?.sections
    ? [...designData.sections]
        .filter((section) => section.status)
        .sort((a, b) => a.order - b.order)
    : [];

  // Group sections by row matching the 12-column CSS grid system of the web mobile layout
  const rows: Section[][] = [];
  let currentRow: Section[] = [];
  let currentSpan = 0;

  activeSections.forEach((section) => {
    const span = section.type === 'banner' ? (section.width_ratio ?? 12) : 12;

    if (currentSpan + span > 12) {
      if (currentRow.length > 0) {
        rows.push(currentRow);
      }
      currentRow = [section];
      currentSpan = span;
    } else {
      currentRow.push(section);
      currentSpan += span;
    }
  });

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  // Ana sayfadaki "Son Görüntülenenler" kampanyası ürünlü SDK metodunu gerektiriyor.
  const lastViewedProduct = useLastViewedInsiderProduct();

  const renderSection = (section: Section, width: number) => {
    switch (section.type) {
      case 'story':
        return (
          <HomeStorySection
            content={section.content as StoryContent}
            key={section.id}
          />
        );
      case 'slider':
        return (
          <HomeSliderSection
            content={section.content as StoryContent}
            key={section.id}
          />
        );
      case 'banner':
        return (
          <HomeBannerSection
            content={section.content as BannerContent}
            key={section.id}
            width={width}
          />
        );
      case 'heading':
        return (
          <HomeHeadingSection
            content={section.content as HeadingContent}
            key={section.id}
          />
        );
      case 'text':
        return (
          <HomeTextSection
            content={section.content as TextContent}
            key={section.id}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AppScreen scrollable={false} header={<AppHeader />} padding={0} gap={0}>

      {isPending ? (
        <YStack alignItems="center" flex={1} justifyContent="center" gap="$3">
          <Spinner color="$brand" size="large" />
          <Paragraph color="$color10">Yükleniyor...</Paragraph>
        </YStack>
      ) : null}

      {isError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Sayfa yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onActionPress={handleRetry}
          title="Sayfa Yüklenemedi"
        />
      ) : null}

      {!isPending && !isError ? (
        <ScrollView
          flex={1}
          refreshControl={
            <RefreshControl
              colors={[BRAND_COLOR]}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              tintColor={BRAND_COLOR}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <YStack paddingTop={8} paddingHorizontal={10} paddingBottom="$4" width="100%">
            <YStack paddingHorizontal={8} width="100%">
              <MobileHomeSearch />
            </YStack>

            <YStack gap={12} marginTop={10} width="100%">
              {rows.map((row, rowIndex) => {
                const isSingleFullWidth =
                  row.length === 1 &&
                  (row[0].type !== 'banner' || (row[0].width_ratio ?? 12) === 12);

                if (isSingleFullWidth) {
                  return renderSection(row[0], containerWidth);
                }

                return (
                  <XStack gap={12} key={rowIndex} width="100%">
                    {row.map((section) => {
                      const span = section.type === 'banner' ? (section.width_ratio ?? 12) : 12;
                      const gap = 12;
                      const itemWidth =
                        (span / 12) * containerWidth - ((12 - span) / 12) * gap;
                      return renderSection(section, itemWidth);
                    })}
                  </XStack>
                );
              })}
            </YStack>

            <InsiderRecommendationSections product={lastViewedProduct} slot="home" />

            <HomeFooter />
          </YStack>
        </ScrollView>
      ) : null}
    </AppScreen>
  );
}
