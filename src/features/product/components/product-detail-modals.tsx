import React, { useState } from 'react';
import { Sheet, YStack, XStack, Paragraph, Button, Input } from 'tamagui';
import { X, Table, Calculator, WashingMachine, MessageSquare, Check } from '@tamagui/lucide-icons-2';
import { Pressable, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { AppSheetOverlay } from '@/components/ui/app-sheet-overlay';
import { BRAND_COLOR } from '@/lib/theme/colors';
import { calculateSize, submitProductFeedback } from '@/services/product.service';
import {
  getSizeChartImageSource,
  getSizeChartSections,
  SIZE_CHART_ASPECT_RATIO,
  SIZE_CHART_GENDER_OPTIONS,
  type SizeChartGender,
  type SizeChartSection,
} from '../data/size-chart-assets';

// --- WASHING INSTRUCTIONS DATA ---
const WASHING_INSTRUCTIONS = [
  {
    title: 'DENİM',
    items: [
      'Kot pantolonunuzu çamaşır makinesinde, en fazla 30 dereceye ayarlanmış programda yıkayın.',
      'Yıkama işlemi için düşük sıkma devrini tercih edin.',
      'Kot pantolonunuzu çamaşır makinesine atarken, diğer kıyafetlerle birlikte atmayın. Bu, kot pantolonunuzun pamuklanmasına veya renk değiştirmesine neden olabilir.',
      'Yumuşatıcı veya ağartıcı kullanmayın. Yalnızca renkli kıyafetler için önerilen deterjanları kullanın.',
      'Kotunuzu yıkarken ters çevirin.',
    ],
  },
  {
    title: 'VİSKON',
    items: [
      'Viskon kumaş küçülmeye meyilli olduğu için, 30 derecelik program üzerinde yıkanmamalıdır.',
      'Kurutma makinesinde kurutmamalısınız.',
      'Beyazlatıcı veya ağartıcı kullanmayın.',
    ],
  },
  {
    title: 'TRİKO',
    items: [
      'Triko kazakları 30 dereceden daha yüksek sıcaklıkta yıkayınız.',
      'Triko kazaklarınızı mümkün olduğunca düşük devirlerde sıkın.',
      'Triko kazaklarınızı kurutma makinesinde kurutmayın. Askıya asarak kurutabilirsiniz.',
    ],
  },
  {
    title: 'PAMUK',
    items: [
      'Pamuk ürünler için hassas yıkama uygulamanız önerilir.',
      'Mümkün olduğunca düşük sıcaklıkta ütülemeniz tavsiye edilir.',
    ],
  },
];

// --- FEEDBACK CATEGORIES ---
const FEEDBACK_CATEGORIES = [
  'Ürünün fiyatı hatalı',
  'Ürün ismi yetersiz',
  'Ürün adı ile ürün özellikleri/açıklamaları uyuşmuyor',
  'Ürün özellikleri eksik ya da hatalı',
  'Ürünün kategorisi hatalı',
  'Görsel uygunsuz (+18 içerik)',
  'Ürün özellikleri ile ürün açıklaması uyuşmuyor',
  'Görsel ile ürün ismi uyuşmuyor',
  'Ürün güvenliği bilgileri eksik/hatalı/yanlış',
  'Ürün güvenliği riski barındıran ürün',
  'Diğer',
];

// --- 1. SIZE CHART MODAL ---
export function SizeChartModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [activeGender, setActiveGender] = useState<SizeChartGender>('kadin');
  const [activeSection, setActiveSection] = useState<SizeChartSection>('giyim');
  const chartImageSource = getSizeChartImageSource(activeGender, activeSection);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPointsMode="percent" snapPoints={[80]} dismissOnSnapToBottom modal unmountChildrenWhenHidden>
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={16} borderTopRightRadius={16} overflow="hidden">
        {/* Header */}
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor="$borderColor">
          <XStack alignItems="center" gap="$2">
            <Table size={18} color="$brand" />
            <Paragraph fontSize={16} fontWeight="700">Beden Tablosu</Paragraph>
          </XStack>
          <Button backgroundColor="transparent" chromeless circular icon={<X size={18} />} onPress={() => onOpenChange(false)} size="$3" />
        </XStack>

        {/* Gender Tabs */}
        <XStack borderBottomWidth={1} borderBottomColor="$borderColor">
          {SIZE_CHART_GENDER_OPTIONS.map(({ label, value }) => (
            <Pressable
              key={value}
              onPress={() => {
                setActiveGender(value);
                setActiveSection('giyim');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeGender === value }}
              accessibilityLabel={`${label} beden tablosu`}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderBottomWidth: activeGender === value ? 2 : 0,
                borderBottomColor: BRAND_COLOR,
              }}
            >
              <Paragraph textAlign="center" fontWeight="700" color={activeGender === value ? '$brand' : '$color10'} fontSize={12}>
                {label}
              </Paragraph>
            </Pressable>
          ))}
        </XStack>

        {/* Category sub-sections for gender */}
        <XStack padding={12} gap="$2" justifyContent="center">
          {getSizeChartSections(activeGender).map(({ label, value }) => (
            <Button
              key={value}
              size="$2.5"
              backgroundColor={activeSection === value ? '$brand' : '$color3'}
              borderRadius={6}
              onPress={() => setActiveSection(value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: activeSection === value }}
              accessibilityLabel={`${label} beden tablosu`}
            >
              <Paragraph color={activeSection === value ? 'white' : '$color11'} fontWeight="700" fontSize={12}>
                {label}
              </Paragraph>
            </Button>
          ))}
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
          <Image
            source={chartImageSource}
            accessibilityLabel="Beden tablosu görseli"
            style={{ width: '100%', aspectRatio: SIZE_CHART_ASPECT_RATIO }}
            contentFit="contain"
          />
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

// --- 2. SIZE CALCULATOR MODAL ---
export function SizeCalculatorModal({
  open,
  onOpenChange,
  onCalculateComplete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculateComplete?: (size: string) => void;
}) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'child'>('female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleCalculate = async () => {
    const h = parseInt(height, 10);
    const w = parseInt(weight, 10);
    if (!height || !weight || isNaN(h) || isNaN(w) || h < 50 || h > 250 || w < 10 || w > 200) {
      setError('Lütfen geçerli boy (50–250 cm) ve kilo (10–200 kg) girin.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await calculateSize(h, w, gender);
      if (res?.status === 'success' && res?.data?.recommended_size) {
        setResult(res.data.recommended_size);
        if (onCalculateComplete) {
          onCalculateComplete(res.data.recommended_size);
        }
      } else {
        setError('Beden hesaplanamadı.');
      }
    } catch {
      setError('Beden hesaplanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPointsMode="percent" snapPoints={[48]} dismissOnSnapToBottom modal unmountChildrenWhenHidden>
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={16} borderTopRightRadius={16} overflow="hidden">
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor="$borderColor">
          <XStack alignItems="center" gap="$2">
            <Calculator size={18} color="$brand" />
            <Paragraph fontSize={16} fontWeight="700">Bedenimi Hesapla</Paragraph>
          </XStack>
          <Button backgroundColor="transparent" chromeless circular icon={<X size={18} />} onPress={() => onOpenChange(false)} size="$3" />
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
          <XStack gap="$3">
            <YStack flex={1} gap="$1.5">
              <Paragraph fontSize={12} color="$color10" fontWeight="600">Boy (cm)</Paragraph>
              <Input
                value={height}
                onChangeText={setHeight}
                placeholder="Örn: 172"
                keyboardType="numeric"
                height={44}
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius={8}
                paddingHorizontal={12}
                color="$color"
                backgroundColor="$background"
              />
            </YStack>
            <YStack flex={1} gap="$1.5">
              <Paragraph fontSize={12} color="$color10" fontWeight="600">Kilo (kg)</Paragraph>
              <Input
                value={weight}
                onChangeText={setWeight}
                placeholder="Örn: 59"
                keyboardType="numeric"
                height={44}
                borderColor="$borderColor"
                borderWidth={1}
                borderRadius={8}
                paddingHorizontal={12}
                color="$color"
                backgroundColor="$background"
              />
            </YStack>
          </XStack>

          <YStack gap="$1.5">
            <Paragraph fontSize={12} color="$color10" fontWeight="600">Cinsiyet</Paragraph>
            <XStack gap="$2">
              {(['female', 'male', 'child'] as const).map((g) => (
                <Button
                  key={g}
                  flex={1}
                  backgroundColor={gender === g ? '$brand' : '$color3'}
                  borderRadius={8}
                  onPress={() => setGender(g)}
                >
                  <Paragraph color={gender === g ? 'white' : '$color11'} fontWeight="700" fontSize={12}>
                    {g === 'female' ? 'Kadın' : g === 'male' ? 'Erkek' : 'Çocuk'}
                  </Paragraph>
                </Button>
              ))}
            </XStack>
          </YStack>

          <Button
            backgroundColor="$brand"
            borderRadius={8}
            onPress={handleCalculate}
            disabled={loading}
            height={46}
            marginTop="$2"
          >
            <Paragraph color="white" fontWeight="800">
              {loading ? 'Hesaplanıyor...' : 'Hesapla'}
            </Paragraph>
          </Button>

          {error && <Paragraph color="$red10" fontSize={13} textAlign="center">{error}</Paragraph>}

          {result && (
            <YStack
              gap="$2.5"
              marginTop="$3"
              padding="$4"
              backgroundColor="$orange3"
              borderRadius={12}
              accessible
              accessibilityRole="text"
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Sizin için önerilen beden: ${result}`}
            >
              <Paragraph color="$color" fontSize={14} fontWeight="600" textAlign="center">Sizin İçin Önerilen Beden:</Paragraph>
              <YStack
                alignSelf="stretch"
                alignItems="center"
                justifyContent="center"
                backgroundColor="$background"
                borderColor="$brand"
                borderWidth={1}
                borderRadius={14}
                paddingVertical="$3"
                paddingHorizontal="$4"
                minHeight={56}
              >
                <Paragraph
                  color="$brand"
                  fontSize={24}
                  fontWeight="900"
                  textAlign="center"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {result}
                </Paragraph>
              </YStack>
            </YStack>
          )}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

// --- 3. WASHING INSTRUCTIONS MODAL ---
export function WashingInstructionsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPointsMode="percent" snapPoints={[80]} dismissOnSnapToBottom modal unmountChildrenWhenHidden>
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={16} borderTopRightRadius={16} overflow="hidden">
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor="$borderColor">
          <XStack alignItems="center" gap="$2">
            <WashingMachine size={18} color="$brand" />
            <Paragraph fontSize={16} fontWeight="700">Yıkama Talimatları</Paragraph>
          </XStack>
          <Button backgroundColor="transparent" chromeless circular icon={<X size={18} />} onPress={() => onOpenChange(false)} size="$3" />
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {WASHING_INSTRUCTIONS.map((sec) => (
            <YStack key={sec.title} gap="$2">
              <Paragraph fontSize={12} fontWeight="800" color="$brand" letterSpacing={0.5}>{sec.title}</Paragraph>
              <YStack gap="$1.5">
                {sec.items.map((item, idx) => (
                  <XStack key={idx} gap="$2" alignItems="flex-start">
                    <Paragraph color="$color5">•</Paragraph>
                    <Paragraph fontSize={12} color="$color11" flex={1} lineHeight={16}>{item}</Paragraph>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          ))}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}

// --- 4. FEEDBACK MODAL ---
export function FeedbackModal({
  open,
  onOpenChange,
  productId,
  productSlug,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productSlug: string;
}) {
  const [category, setCategory] = useState('');
  const [otherText, setOtherText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!category) return;
    if (category === 'Diğer' && !otherText.trim()) return;

    setLoading(true);
    try {
      const feedbackVal = category === 'Diğer' ? otherText.trim() : category;
      await submitProductFeedback(productId, productSlug, feedbackVal);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onOpenChange(false);
        setCategory('');
        setOtherText('');
      }, 1500);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} snapPointsMode="percent" snapPoints={[85]} dismissOnSnapToBottom modal unmountChildrenWhenHidden>
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={16} borderTopRightRadius={16} overflow="hidden">
        <XStack alignItems="center" justifyContent="space-between" paddingHorizontal={16} paddingVertical={12} borderBottomWidth={1} borderBottomColor="$borderColor">
          <XStack alignItems="center" gap="$2">
            <MessageSquare size={18} color="$brand" />
            <Paragraph fontSize={16} fontWeight="700">Geri Bildirim Bildir</Paragraph>
          </XStack>
          <Button backgroundColor="transparent" chromeless circular icon={<X size={18} />} onPress={() => onOpenChange(false)} size="$3" />
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {success ? (
            <YStack gap="$3" alignItems="center" paddingVertical="$10">
              <XStack backgroundColor="#10B981" borderRadius={30} width={60} height={60} alignItems="center" justifyContent="center">
                <Check size={32} color="white" />
              </XStack>
              <Paragraph fontWeight="700" fontSize={16} color="#10B981">Geri bildiriminiz gönderildi!</Paragraph>
            </YStack>
          ) : (
            <>
              <Paragraph fontSize={13} color="$color10" fontWeight="600">Geri bildiriminiz hangi başlıkla ilgili?</Paragraph>
              
              <YStack gap="$2">
                {FEEDBACK_CATEGORIES.map((cat) => {
                  const isChecked = category === cat;
                  return (
                    <Pressable key={cat} onPress={() => setCategory(cat)}>
                      <XStack
                        padding="$3"
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={isChecked ? '$brand' : '$borderColor'}
                        backgroundColor={isChecked ? '$orange3' : '$background'}
                        alignItems="center"
                        gap="$2.5"
                      >
                        <XStack
                          width={18}
                          height={18}
                          borderRadius={9}
                          borderWidth={2}
                          borderColor={isChecked ? '$brand' : '$borderColor'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {isChecked && <YStack width={8} height={8} borderRadius={4} backgroundColor="$brand" />}
                        </XStack>
                        <Paragraph fontSize={12} color="$color" flex={1}>{cat}</Paragraph>
                      </XStack>
                    </Pressable>
                  );
                })}
              </YStack>

              {category === 'Diğer' && (
                <YStack gap="$1.5" marginTop="$1">
                  <Paragraph fontSize={12} color="$color10" fontWeight="600">Geri Bildiriminiz</Paragraph>
                  <Input
                    value={otherText}
                    onChangeText={setOtherText}
                    placeholder="Geri bildiriminizi detaylandırın..."
                    multiline
                    numberOfLines={4}
                    height={100}
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius={8}
                    padding={12}
                    color="$color"
                    backgroundColor="$background"
                    textAlignVertical="top"
                  />
                </YStack>
              )}

              <Button
                backgroundColor={category ? '$brand' : '$color5'}
                borderRadius={8}
                onPress={handleSubmit}
                disabled={!category || loading}
                height={46}
                marginTop="$2"
              >
                <Paragraph color="white" fontWeight="800">
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </Paragraph>
              </Button>
            </>
          )}
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
