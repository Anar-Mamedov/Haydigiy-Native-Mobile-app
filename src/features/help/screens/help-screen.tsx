import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppScreen, EmptyState, ScreenHeader } from '@/components/ui';
import { matchesSearch } from '@/utils/search';
import { useHelpQuery } from '../api/help.queries';
import { getDefaultCategoryId } from '../utils/default-category';
import { HelpSearchInput } from '../components/help-search-input';
import { HelpCategoryTabs } from '../components/help-category-tabs';
import { HelpArticleItem } from '../components/help-article-item';

/**
 * "Yardım & Sıkça Sorulan Sorular" — searchable, category-tabbed FAQ accordion
 * backed by `GET /help`, mirroring the web help page. Handles loading, error,
 * empty and success states.
 */
export function HelpScreen() {
  const router = useRouter();
  const query = useHelpQuery();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [expandedArticleId, setExpandedArticleId] = useState<number | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const header = <ScreenHeader onBack={handleBack} title="Sıkça Sorulan Sorular" />;

  if (query.isPending) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Yardım içeriği yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const categories = query.data;

  if (categories.length === 0) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            description="Şu anda görüntülenecek yardım içeriği bulunmuyor."
            title="İçerik Bulunamadı"
          />
        </YStack>
      </AppScreen>
    );
  }

  const activeCategoryId = selectedCategoryId ?? getDefaultCategoryId(categories);
  const activeCategory = categories.find((category) => category.id === activeCategoryId);
  const filteredArticles =
    activeCategory?.articles.filter((article) => matchesSearch(article.question, search)) ?? [];

  const handleSelectCategory = (id: number) => {
    setSelectedCategoryId(id);
    setSearch('');
    setExpandedArticleId(null);
  };

  return (
    <AppScreen header={header}>
      <YStack gap="$3">
        <HelpSearchInput onChangeText={setSearch} value={search} />
        <HelpCategoryTabs
          activeId={activeCategoryId}
          categories={categories}
          onSelect={handleSelectCategory}
        />

        {filteredArticles.length === 0 ? (
          <Paragraph color="$color10" fontSize={14} paddingVertical="$6" textAlign="center">
            Bu kategoride makale bulunamadı.
          </Paragraph>
        ) : (
          <YStack gap="$2.5">
            {filteredArticles.map((article) => (
              <HelpArticleItem
                article={article}
                expanded={article.id === expandedArticleId}
                key={article.id}
                onToggle={() =>
                  setExpandedArticleId((prev) => (prev === article.id ? null : article.id))
                }
              />
            ))}
          </YStack>
        )}
      </YStack>
    </AppScreen>
  );
}
