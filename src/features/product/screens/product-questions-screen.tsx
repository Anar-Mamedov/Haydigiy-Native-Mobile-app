import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Paragraph, ScrollView, Spinner, XStack, YStack } from 'tamagui';
import { AppScreen, AppSelect, EmptyState, ScreenHeader, SearchInput, SectionCard } from '@/components/ui';
import { useAddToCartMutation } from '@/features/cart/api/cart.queries';
import { useGoToCartAfterAdd } from '@/features/cart/hooks/use-go-to-cart-after-add';
import { useShippingEstimateQuery } from '@/features/shipping/api/shipping.queries';
import { buildInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { ProductVariant } from '@/types/product.types';
import { useProductQuestionsQuery } from '../api/product-questions.queries';
import { ProductQAItem } from '../api/product-questions.mapper';
import { QaProductCard } from '../components/qa-product-card';
import { QuestionCard } from '../components/question-card';
import { AskQuestionSheet } from '../components/ask-question-sheet';
import { CriteriaSheet } from '../components/criteria-sheet';
import { ProductCtaFooter } from '../components/product-cta-footer';
import { SizeSelectionSheet } from '../components/size-selection-sheet';

const SORT_OPTIONS = [
  { label: 'Önerilen Sıralama', value: 'recommended' },
  { label: 'Yeniden Eskiye', value: 'newest' },
  { label: 'Eskiden Yeniye', value: 'oldest' },
];

const QUESTION_CRITERIA = [
  'Hukuka, genel ahlaka ve kamu düzenine uygun olmalı',
  'Kişisel verileri ve özel hayatın gizliliğini ihlal etmemeli',
  'Hakaret, küfür, tehdit, taciz veya müstehcenlik barındırmamalı',
  'Satın alınan veya satın alınmayı düşünülen ürünle doğrudan ilgili olmalı',
  'Yanıltıcı bilgi içermemeli',
  'Sağlık beyanı içermemeli',
];

const time = (value: string) => new Date(value.includes(' ') ? value.replace(' ', 'T') : value).getTime() || 0;

function sortQuestions(list: ProductQAItem[], sort: string): ProductQAItem[] {
  if (sort === 'recommended') return list;
  return [...list].sort((a, b) => {
    const da = time(a.createdAt);
    const db = time(b.createdAt);
    if (sort === 'newest') return db !== da ? db - da : Number(b.id) - Number(a.id);
    return da !== db ? da - db : Number(a.id) - Number(b.id);
  });
}

/** Dedicated product Q&A page (mirrors the web mobile `/soru/[slug]`). */
export function ProductQuestionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('tümü');
  const [sort, setSort] = useState('recommended');
  const [askOpen, setAskOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showSizeSheet, setShowSizeSheet] = useState(false);

  const addToCart = useAddToCartMutation();
  const goToCartAfterAdd = useGoToCartAfterAdd();
  const shippingQuery = useShippingEstimateQuery();
  const query = useProductQuestionsQuery(slug);

  useFocusEffect(useCallback(() => () => setShowSizeSheet(false), []));
  const questions = useMemo(() => query.data?.questions ?? [], [query.data?.questions]);
  const tags = query.data?.tags ?? [];

  const visibleQuestions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR');
    const filtered = questions.filter((item) => {
      const matchesSearch =
        !term ||
        item.question.toLocaleLowerCase('tr-TR').includes(term) ||
        item.userName.toLocaleLowerCase('tr-TR').includes(term) ||
        (item.reply?.text.toLocaleLowerCase('tr-TR').includes(term) ?? false);
      if (!matchesSearch) return false;
      if (selectedTag === 'tümü') return true;
      if (item.tag) return item.tag === selectedTag;
      return item.question.toLocaleLowerCase('tr-TR').includes(selectedTag.toLocaleLowerCase('tr-TR'));
    });
    return sortQuestions(filtered, sort);
  }, [questions, search, selectedTag, sort]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const goToProduct = () => router.push({ pathname: '/product/[id]', params: { id: slug } });

  const handleAddToCartPress = () => {
    const product = query.data?.product;
    if (!product) return;
    if (product.variants.length > 0 && !selectedVariant) {
      setShowSizeSheet(true);
      return;
    }
    confirmAddToCart();
  };

  const confirmAddToCart = () => {
    const product = query.data?.product;
    if (!product) return;
    const variantId = selectedVariant?.pivotId ?? selectedVariant?.id;
    if (variantId) {
      addToCart.mutate({
        variantId,
        tracking: buildInsiderInput({
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: selectedVariant?.price || Number(product.price) || 0,
          size: selectedVariant?.name,
          quantity: 1,
          slug,
        }),
      });
    }
    setShowSizeSheet(false);
    // Skip the success modal and take the user straight to the cart.
    goToCartAfterAdd();
  };

  const header = <ScreenHeader onBack={handleBack} title="Soru & Cevap" />;

  if (query.isPending) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Sorular yüklenirken bir hata oluştu."
            onActionPress={() => query.refetch()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  const allTags = ['tümü', ...tags];
  const hasFilterOrSearch = selectedTag !== 'tümü' || Boolean(search.trim());

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <ScrollView contentContainerStyle={{ gap: 12, padding: 16, paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        <QaProductCard
          onCriteriaPress={() => setCriteriaOpen(true)}
          onProductPress={goToProduct}
          product={query.data.product}
        />

        {allTags.length > 1 ? (
          <SectionCard elevated>
            <YStack gap="$2">
              <Paragraph color="$color" fontSize={16} fontWeight="700">
                Filtreler
              </Paragraph>
              <Paragraph color="$color11" fontSize={13} fontWeight="600">
                Konuya Göre Filtrele
              </Paragraph>
              <ScrollView contentContainerStyle={{ gap: 8 }} horizontal showsHorizontalScrollIndicator={false}>
                {allTags.map((tag) => {
                  const active = selectedTag === tag;
                  return (
                    <XStack
                      accessibilityLabel={tag}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      backgroundColor={active ? '$brand' : '$background'}
                      borderColor={active ? '$brand' : '$borderColor'}
                      borderRadius="$3"
                      borderWidth={1}
                      key={tag}
                      onPress={() => setSelectedTag(tag)}
                      paddingHorizontal="$3"
                      paddingVertical="$1.5"
                      pressStyle={{ opacity: 0.85 }}
                    >
                      <Paragraph color={active ? 'white' : '$color11'} fontSize={13} fontWeight={active ? '700' : '500'} textTransform="capitalize">
                        {tag}
                      </Paragraph>
                    </XStack>
                  );
                })}
              </ScrollView>
            </YStack>
          </SectionCard>
        ) : null}

        <XStack gap="$2">
          <YStack flex={1}>
            <SearchInput accessibilityLabel="Sorularda ara" onChangeText={setSearch} placeholder="Sorularda Ara" value={search} />
          </YStack>
          <YStack width={160}>
            <AppSelect label="Sıralama" onValueChange={(value) => setSort(String(value))} options={SORT_OPTIONS} value={sort} />
          </YStack>
        </XStack>

        {visibleQuestions.length === 0 ? (
          <Paragraph color="$color10" fontSize={14} paddingVertical="$6" textAlign="center">
            {hasFilterOrSearch ? 'Filtrelere uygun soru bulunamadı.' : 'Henüz soru sorulmamış.'}
          </Paragraph>
        ) : (
          visibleQuestions.map((item) => <QuestionCard item={item} key={item.id} />)
        )}
      </ScrollView>

      <ProductCtaFooter leftLabel="Soru Sor" onLeftPress={() => setAskOpen(true)} onRightPress={handleAddToCartPress} />

      {showSizeSheet ? (
        <SizeSelectionSheet
          imageUrl={query.data.product.imageUrl}
          onAskQuestion={() => {
            // Unmount the size sheet first, then open the ask sheet after it is
            // gone so the two modal sheets never stay stacked.
            setShowSizeSheet(false);
            setTimeout(() => setAskOpen(true), 300);
          }}
          onClose={() => setShowSizeSheet(false)}
          onConfirm={confirmAddToCart}
          onSelectVariant={setSelectedVariant}
          open
          priceLabel={query.data.product.price ? `${query.data.product.price} TL` : ''}
          productName={query.data.product.name}
          selectedVariant={selectedVariant}
          shippingMessage={shippingQuery.data?.message}
          variants={query.data.product.variants}
        />
      ) : null}

      <CriteriaSheet
        criteria={QUESTION_CRITERIA}
        intro="Ürün Soruları, müşterilerimizin HaydiGiy üzerinden satın aldıkları veya satın almayı düşündükleri ürünlere yönelik sorularını paylaşabilecekleri önemli bir araçtır."
        onClose={() => setCriteriaOpen(false)}
        open={criteriaOpen}
        title="Soru Sorma Kriterleri"
      />
      <AskQuestionSheet
        onClose={() => setAskOpen(false)}
        open={askOpen}
        productId={query.data.product.id ? Number(query.data.product.id) : null}
        slug={slug}
      />
    </AppScreen>
  );
}
