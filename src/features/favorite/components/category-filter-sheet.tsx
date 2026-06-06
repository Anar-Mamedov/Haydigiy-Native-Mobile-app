import { useState, useEffect } from 'react';
import { Pressable } from 'react-native';
import { Sheet, YStack, XStack, Paragraph, Button, ScrollView } from 'tamagui';
import { X } from '@tamagui/lucide-icons-2';
import { FilterCheckbox } from '@/components/ui/filter-checkbox';

interface CategoryFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategories: string[];
  onApply: (selected: string[]) => void;
}

export function CategoryFilterSheet({
  open,
  onOpenChange,
  categories,
  selectedCategories,
  onApply,
}: CategoryFilterSheetProps) {
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setTempSelected(selectedCategories);
    }
  }, [open, selectedCategories]);

  const toggleCategory = (cat: string) => {
    setTempSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleApply = () => {
    onApply(tempSelected);
    onOpenChange(false);
  };

  const handleClear = () => {
    setTempSelected([]);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPointsMode="percent"
      snapPoints={[75]}
      dismissOnSnapToBottom
      modal
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame
        backgroundColor="$background"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        overflow="hidden"
      >
        {/* Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Paragraph fontSize={16} fontWeight="700" color="$color">
            Kategoriler
          </Paragraph>
          <Pressable onPress={() => onOpenChange(false)}>
            <X size={20} color="$color10" />
          </Pressable>
        </XStack>

        {/* Content */}
        <ScrollView flex={1} padding="$4" showsVerticalScrollIndicator={false}>
          <YStack gap="$3" pb="$6">
            {categories.map((cat) => {
              const checked = tempSelected.includes(cat);
              return (
                <Pressable key={cat} onPress={() => toggleCategory(cat)}>
                  <XStack alignItems="center" gap="$3" py="$2">
                    <FilterCheckbox checked={checked} />
                    <Paragraph fontSize={14} color="$color" numberOfLines={1} flex={1}>
                      {cat}
                    </Paragraph>
                  </XStack>
                </Pressable>
              );
            })}
          </YStack>
        </ScrollView>

        {/* Footer actions */}
        <XStack
          gap="$3"
          padding="$4"
          borderTopWidth={1}
          borderTopColor="$borderColor"
          backgroundColor="$background"
        >
          <Button
            flex={1}
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderWidth={1}
            borderRadius="$4"
            onPress={handleClear}
          >
            Temizle
          </Button>
          <Button
            flex={1}
            backgroundColor="$brand"
            borderRadius="$4"
            onPress={handleApply}
          >
            <Paragraph color="white" fontWeight="700">
              Uygula
            </Paragraph>
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
}
