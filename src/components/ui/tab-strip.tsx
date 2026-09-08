import { Pressable } from 'react-native';
import { ScrollView, XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';

export type TabStripItem = {
  key: string;
  label: string;
};

export interface TabStripProps {
  tabs: TabStripItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

/**
 * Yatay, temaya duyarlı sekme şeridi.
 *
 * `SegmentedControl` eşit genişlikte bölmeler kullanır ve "Cevap Bekleyenler"
 * gibi uzun etiketlerde metin sığmaz; bu şerit ise kayabildiği için etiket
 * uzunluğundan bağımsızdır. Değerlendirmelerim ve Sorularım ekranlarının aynı
 * görünmesi için ikisi de bunu kullanır.
 */
export function TabStrip({ tabs, activeKey, onChange }: TabStripProps) {
  return (
    <ScrollView
      horizontal
      // Şeridin yüksekliği sabitlenir; Tamagui ScrollView varsayılan olarak
      // flex:1 olduğu için sütun içinde dikeyde büyüyüp listeyi aşağı iterdi.
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, alignItems: 'center' }}
      flexGrow={0}
      flexShrink={0}
      height={60}
      showsHorizontalScrollIndicator={false}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XStack
              backgroundColor={isActive ? '$background' : '$color3'}
              borderColor={isActive ? '$brand' : '$borderColor'}
              borderRadius="$3"
              borderWidth={1}
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              <Paragraph color={isActive ? '$brand' : '$color10'} fontSize={12} fontWeight={isActive ? '700' : '500'}>
                {tab.label}
              </Paragraph>
            </XStack>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
