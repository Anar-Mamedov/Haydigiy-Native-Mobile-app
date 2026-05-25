import { useState, useEffect } from 'react';
import { Pressable, TextInput } from 'react-native';
import { Paragraph, Spinner, XStack, YStack, ScrollView, Button, useTheme } from 'tamagui';
import { ArrowLeft, Search } from '@tamagui/lucide-icons-2';
import { AppScreen, EmptyState } from '@/components/ui';
import { useRouter } from 'expo-router';
import { useMenuGroupsQuery, useMenuItemsQuery } from '../api/category.queries';
import { CategoryCard } from '../components/category-card';
import { MenuItem } from '../types/category.types';

export function CategoriesScreen() {
  const router = useRouter();
  const theme = useTheme();

  // States
  const [selectedMainIndex, setSelectedMainIndex] = useState(0);
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Queries
  const { data: groups, isPending: isPendingGroups, isError: isErrorGroups, refetch: refetchGroups } = useMenuGroupsQuery();
  const mobileGroupId = groups?.find((group) => group.location === 'mobile')?.id;

  const { data: menuItems, isPending: isPendingItems, isError: isErrorItems, refetch: refetchItems } = useMenuItemsQuery(mobileGroupId);

  const handleRetry = () => {
    if (isErrorGroups) refetchGroups();
    if (isErrorItems) refetchItems();
  };

  // Reset subcategory selection when switching main tab
  useEffect(() => {
    setSelectedSubIndex(0);
    setSearchTerm('');
  }, [selectedMainIndex]);

  const isPending = isPendingGroups || isPendingItems;
  const isError = isErrorGroups || isErrorItems;

  const selectedMain = menuItems?.[selectedMainIndex];
  const subCategories = selectedMain?.children || [];
  const selectedSub = subCategories[selectedSubIndex] || null;
  const selectedSubChildren = selectedSub?.children || [];

  const flattenMenuItems = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    const queue = [...items];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) continue;
      result.push(current);
      if (Array.isArray(current.children) && current.children.length > 0) {
        queue.push(...current.children);
      }
    }
    return result;
  };

  const baseCategories = selectedSubChildren;
  const searchableCategories = flattenMenuItems(subCategories);
  const filteredSubCategories = searchTerm
    ? searchableCategories.filter((cat) => cat.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : baseCategories;

  const handleCategoryPress = (categoryId: number | null, url: string, menuItem?: MenuItem) => {
    const targetUrl = menuItem?.url || url;
    if (targetUrl) {
      const formatted = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
      router.push(formatted as any);
    } else if (categoryId) {
      router.push(`/kategori/c-${categoryId}` as any);
    }
  };

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Custom Search Header
  const customHeader = (
    <XStack
      alignItems="center"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
      paddingHorizontal="$3"
      paddingVertical="$2"
      gap="$2"
      height={56}
      width="100%"
    >
      <Pressable onPress={handleBackPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
        <ArrowLeft color="#6b7280" size={24} />
      </Pressable>
      <XStack
        flex={1}
        alignItems="center"
        backgroundColor="$backgroundHover"
        borderRadius={100}
        paddingHorizontal="$4"
        paddingVertical="$1.5"
        gap="$2"
        height={40}
        minWidth={0}
      >
        <Search color="#f27a1a" size={18} />
        <TextInput
          placeholder="Ürün veya kategori ara"
          placeholderTextColor="#9ca3af"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={{
            flex: 1,
            height: '100%',
            fontSize: 14,
            color: theme.color.val,
            padding: 0,
          }}
        />
      </XStack>
    </XStack>
  );

  return (
    <AppScreen scrollable={false} header={customHeader} padding={0} gap={0}>
      {isPending ? (
        <YStack alignItems="center" flex={1} justifyContent="center" gap="$3">
          <Spinner color="#f27a1a" size="large" />
          <Paragraph color="$color10">Kategoriler yükleniyor...</Paragraph>
        </YStack>
      ) : null}

      {isError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Kategoriler yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin."
          onActionPress={handleRetry}
          title="Kategoriler Yüklenemedi"
        />
      ) : null}

      {!isPending && !isError && (!menuItems || menuItems.length === 0) ? (
        <EmptyState
          description="Gösterilecek kategori bulunamadı."
          title="Kategori Bulunamadı"
        />
      ) : null}

      {!isPending && !isError && menuItems && menuItems.length > 0 ? (
        <YStack flex={1} width="100%">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            height={48}
            maxHeight={48}
            minHeight={48}
            flex={0}
            contentContainerStyle={{ height: 48, alignItems: 'center' }}
          >
            <XStack paddingHorizontal="$2" height={48} alignItems="center">
              {menuItems.map((cat, index) => {
                const isActive = selectedMainIndex === index;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedMainIndex(index)}
                    style={{
                      paddingHorizontal: 16,
                      height: 48,
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <Paragraph
                      color={isActive ? '#f27a1a' : '$color'}
                      fontWeight={isActive ? '800' : '500'}
                      fontSize={13.5}
                    >
                      {cat.title}
                    </Paragraph>
                    {isActive && (
                      <YStack
                        position="absolute"
                        bottom={0}
                        left={12}
                        right={12}
                        height={2}
                        backgroundColor="#f27a1a"
                        borderRadius={100}
                      />
                    )}
                  </Pressable>
                );
              })}
            </XStack>
          </ScrollView>

          {/* Dual Panel Body Layout */}
          <XStack flex={1} width="100%" overflow="hidden">
            {/* Left Sidebar: Subcategories */}
            <ScrollView
              width="28%"
              minWidth={100}
              maxWidth={140}
              backgroundColor="$backgroundHover"
              borderRightWidth={1}
              borderRightColor="$borderColor"
              showsVerticalScrollIndicator={false}
            >
              <YStack paddingVertical="$2">
                {subCategories.map((item, index) => {
                  const isActive = selectedSubIndex === index;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedSubIndex(index)}
                      style={{
                        width: '100%',
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        backgroundColor: isActive ? theme.background.val : 'transparent',
                        borderLeftWidth: isActive ? 3 : 0,
                        borderLeftColor: '#f27a1a',
                      }}
                    >
                      <Paragraph
                        color={isActive ? '#f27a1a' : '$color10'}
                        fontWeight={isActive ? '700' : '500'}
                        fontSize={13}
                      >
                        {item.title}
                      </Paragraph>
                    </Pressable>
                  );
                })}
              </YStack>
            </ScrollView>

            {/* Right Panel: Grid Cards */}
            <ScrollView flex={1} backgroundColor="$background" showsVerticalScrollIndicator={false}>
              <YStack padding="$3" gap="$3" width="100%">
                {/* View All Button */}
                {selectedMain && (
                  <Button
                    backgroundColor="#f27a1a"
                    borderRadius={8}
                    height={40}
                    onPress={() => {
                      const target = selectedSub || selectedMain;
                      if (target) {
                        handleCategoryPress(target.category_id, target.url, target);
                      }
                    }}
                    pressStyle={{ opacity: 0.8 }}
                  >
                    <Paragraph color="white" fontSize={13} fontWeight="700">
                      {selectedSub?.title || selectedMain?.title} Tüm Ürünler
                    </Paragraph>
                  </Button>
                )}

                {/* Category Grid */}
                {filteredSubCategories.length > 0 ? (
                  <XStack flexWrap="wrap" width="100%" justifyContent="flex-start" marginHorizontal="-1%">
                    {filteredSubCategories.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onPress={() => handleCategoryPress(cat.category_id, cat.url, cat)}
                      />
                    ))}
                  </XStack>
                ) : (
                  <YStack alignItems="center" justifyContent="center" height={200}>
                    <Paragraph color="$color10" fontSize={13} textAlign="center">
                      "{searchTerm}" için sonuç bulunamadı.
                    </Paragraph>
                  </YStack>
                )}
              </YStack>
            </ScrollView>
          </XStack>
        </YStack>
      ) : null}
    </AppScreen>
  );
}
