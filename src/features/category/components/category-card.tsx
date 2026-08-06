import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { YStack, Spinner } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Image } from 'expo-image';
import { getRequiredApiBaseUrl } from '@/lib/env';
import { useCategoryFirstProductImageQuery } from '../api/category.queries';
import { MenuItem } from '../types/category.types';

function getImageUrl(path: string) {
  if (path.startsWith('http')) return path;
  try {
    let baseUrl = getRequiredApiBaseUrl();
    // Strip trailing slashes and /api if present
    baseUrl = baseUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    const storagePath = path.startsWith('/storage/')
      ? path
      : path.startsWith('storage/')
      ? `/${path}`
      : `/storage/${path}`;
    return `${baseUrl}${storagePath}`;
  } catch {
    return '';
  }
}

export function CategoryCard({ category, onPress }: { category: MenuItem; onPress: () => void }) {
  const { data, isPending } = useCategoryFirstProductImageQuery(category.category_id);

  const rawImage = category.image || data?.image;
  const imageUrl = rawImage ? getImageUrl(rawImage) : null;

  return (
    <YStack width="31%" margin="1%" backgroundColor="$background" borderRadius={12} borderWidth={1} borderColor="$borderColor" overflow="hidden">
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, width: '100%', padding: 8, alignItems: 'center' })}>
        <YStack
          width="100%"
          aspectRatio={1}
          borderRadius={8}
          overflow="hidden"
          backgroundColor="$backgroundHover"
          alignItems="center"
          justifyContent="center"
          marginBottom={6}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : isPending ? (
            <Spinner size="small" color="$brand" />
          ) : (
            <Paragraph fontSize={18} color="$color10">👕</Paragraph>
          )}
        </YStack>
        <Paragraph
          fontSize={10}
          color="$color"
          fontWeight="600"
          textAlign="center"
          numberOfLines={2}
          lineHeight={12}
          height={24}
        >
          {category.title}
        </Paragraph>
      </Pressable>
    </YStack>
  );
}
