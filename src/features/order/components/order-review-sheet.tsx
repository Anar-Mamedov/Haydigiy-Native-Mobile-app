import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ImagePlus, Star, X } from '@tamagui/lucide-icons-2';
import { Button, Input, Paragraph, ScrollView, Sheet, Spinner, TextArea, XStack, YStack } from 'tamagui';
import { AppCheckbox, AppSheetOverlay, KeyboardAwareSheetScrollView } from '@/components/ui';
import { WARNING_COLOR } from '@/lib/theme/colors';
import { ReviewTarget } from '@/types/review.types';
import { resolveReviewVariantId, ReviewPhoto } from '@/services/review.service';
import { useSubmitReviewMutation } from '../api/review.mutations';
import { toPlainText } from '@/utils/normalize-text';

const MAX_COMMENT = 2000;

const CRITERIA = [
  'Hukuka, genel ahlaka ve kamu düzenine uygun olmalı',
  'Kişisel verileri ve özel hayatın gizliliğini ihlal etmemeli',
  'Hakaret, küfür, tehdit, taciz veya müstehcenlik barındırmamalı',
  'Satın alınan ürünle doğrudan ilgili olmalı',
  'Yanıltıcı bilgi içermemeli',
  'Sağlık beyanı içermemeli',
];

type OrderReviewSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewTarget | null;
  orderId: string;
  onSubmitted?: () => void;
};

export function OrderReviewSheet({
  open,
  onOpenChange,
  item,
  orderId,
  onSubmitted,
}: OrderReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<ReviewPhoto | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  const submit = useSubmitReviewMutation(orderId);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment('');
      setHeight('');
      setWeight('');
      setConsent(false);
      setPhoto(null);
      setShowCriteria(false);
    }
  }, [open]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf eklemek için galeri erişim izni gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset) {
      setPhoto({
        uri: asset.uri,
        name: asset.fileName ?? 'review.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!item || !rating || !consent || submit.isPending) return;

    let productId = item.productId ?? 0;
    let variantId = item.variantId ?? 0;
    if (!variantId && item.slug) {
      const resolved = await resolveReviewVariantId(item.slug, item.variantName);
      if (resolved) {
        productId = resolved.productId || productId;
        variantId = resolved.variantId;
      }
    }

    if (!variantId) {
      Alert.alert('Hata', 'Ürün varyantı bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.');
      return;
    }

    try {
      await submit.mutateAsync({
        productId,
        variantId,
        rating,
        comment,
        height: height || undefined,
        weight: weight || undefined,
        photo,
        orderItemId: item.id,
        orderId,
      });
      onOpenChange(false);
      Alert.alert('Teşekkürler', 'Yorumunuz başarıyla kaydedildi.');
      onSubmitted?.();
    } catch {
      Alert.alert('Hata', 'Yorum gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const canSubmit = Boolean(rating) && consent && !submit.isPending;

  return (
    <Sheet
      disableDrag
      modal
      moveOnKeyboardChange
      onOpenChange={onOpenChange}
      open={open}
      snapPoints={[100]}
      snapPointsMode="percent"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background">
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          gap="$2"
          justifyContent="space-between"
          paddingBottom="$3"
          paddingHorizontal="$4"
          paddingTop={insets.top + 12}
        >
          <Paragraph color="$color" fontSize={16} fontWeight="700">
            {showCriteria ? 'Yorum Yayınlama Kriterleri' : 'Ürünü Değerlendir'}
          </Paragraph>
          <Pressable
            accessibilityLabel="Kapat"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onOpenChange(false)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <X color="$color10" size={22} />
          </Pressable>
        </XStack>

        {showCriteria ? (
          <YStack flex={1} justifyContent="space-between">
            <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
              <Paragraph color="$color" fontSize={13} fontWeight="700">
                Uygunluk Kriterleri
              </Paragraph>
              {CRITERIA.map((line) => (
                <Paragraph color="$color10" fontSize={12} key={line}>
                  • {line}
                </Paragraph>
              ))}
            </ScrollView>
            <YStack
              borderTopColor="$borderColor"
              borderTopWidth={1}
              paddingBottom={Math.max(insets.bottom, 16)}
              paddingHorizontal="$4"
              paddingTop="$4"
            >
              <Button
                backgroundColor="$brand"
                borderRadius="$4"
                height={46}
                onPress={() => setShowCriteria(false)}
                pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
              >
                <Paragraph color="white" fontWeight="700">
                  Geri
                </Paragraph>
              </Button>
            </YStack>
          </YStack>
        ) : (
          <YStack flex={1} justifyContent="space-between">
            <KeyboardAwareSheetScrollView
              contentContainerStyle={{ gap: 16, padding: 16 }}
              testID="order-review-keyboard-aware-scroll"
            >
              {item ? (
                <XStack
                  alignItems="center"
                  borderColor="$borderColor"
                  borderRadius="$4"
                  borderWidth={1}
                  gap="$3"
                  padding="$3"
                >
                  {item.image ? (
                    <Image
                      contentFit="cover"
                      source={{ uri: item.image }}
                      style={{ width: 56, height: 72, borderRadius: 6 }}
                    />
                  ) : null}
                  <YStack flex={1}>
                    <Paragraph color="$color" fontSize={13} fontWeight="700" numberOfLines={2}>
                      {item.name}
                    </Paragraph>
                    <Paragraph color="$color10" fontSize={12}>
                      Beden: {item.variantName || '-'} · Adet: {item.quantity}
                    </Paragraph>
                  </YStack>
                </XStack>
              ) : null}

              <XStack
                alignItems="center"
                borderColor="$borderColor"
                borderRadius="$4"
                borderWidth={1}
                justifyContent="space-between"
                paddingHorizontal="$3"
                paddingVertical="$2.5"
              >
                <Paragraph color="$color" fontSize={13} fontWeight="700">
                  Ürünü Değerlendir
                </Paragraph>
                <XStack gap="$1.5">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Pressable
                      accessibilityLabel={`${value} yıldız`}
                      accessibilityRole="button"
                      key={value}
                      onPress={() => setRating(value)}
                    >
                      <Star
                        color={WARNING_COLOR}
                        fill={value <= rating ? WARNING_COLOR : 'transparent'}
                        size={28}
                      />
                    </Pressable>
                  ))}
                </XStack>
              </XStack>

              <YStack gap="$2">
                <XStack alignItems="center" justifyContent="space-between">
                  <Paragraph color="$color" fontSize={13} fontWeight="700">
                    Yorumunuz
                  </Paragraph>
                  <Paragraph
                    color="$color10"
                    fontSize={11}
                    onPress={() => setShowCriteria(true)}
                    textDecorationLine="underline"
                  >
                    Yorum Yayınlama Kriterleri
                  </Paragraph>
                </XStack>
                <TextArea
                  backgroundColor="$background"
                  borderColor="$borderColor"
                  maxLength={MAX_COMMENT}
                  minHeight={90}
                  onChangeText={(text) => setComment(toPlainText(text))}
                  placeholder="Ürün hakkındaki düşüncelerinizi paylaşın."
                  value={comment}
                />
                <Paragraph color="$color10" fontSize={11} textAlign="right">
                  {comment.length}/{MAX_COMMENT}
                </Paragraph>
              </YStack>

              <YStack gap="$2">
                <Paragraph color="$color" fontSize={13} fontWeight="700">
                  Görsel Ekle (isteğe bağlı)
                </Paragraph>
                <Pressable accessibilityLabel="Görsel ekle" accessibilityRole="button" onPress={pickPhoto}>
                  <YStack
                    alignItems="center"
                    backgroundColor="$backgroundHover"
                    borderColor="$borderColor"
                    borderRadius="$4"
                    borderWidth={1}
                    gap="$1"
                    justifyContent="center"
                    minHeight={photo ? undefined : 88}
                    padding="$3"
                  >
                    {photo ? (
                      <Image
                        contentFit="cover"
                        source={{ uri: photo.uri }}
                        style={{ width: 96, height: 96, borderRadius: 8 }}
                      />
                    ) : (
                      <>
                        <ImagePlus color="$color10" size={24} />
                        <Paragraph color="$color10" fontSize={12}>
                          Görsel seçin
                        </Paragraph>
                      </>
                    )}
                  </YStack>
                </Pressable>
              </YStack>

              <XStack gap="$3">
                <YStack flex={1} gap="$1">
                  <Paragraph color="$color" fontSize={13} fontWeight="700">
                    Boy (cm)
                  </Paragraph>
                  <Input
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    keyboardType="number-pad"
                    onChangeText={setHeight}
                    value={height}
                  />
                </YStack>
                <YStack flex={1} gap="$1">
                  <Paragraph color="$color" fontSize={13} fontWeight="700">
                    Kilo (kg)
                  </Paragraph>
                  <Input
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    keyboardType="number-pad"
                    onChangeText={setWeight}
                    value={weight}
                  />
                </YStack>
              </XStack>

              <AppCheckbox
                accessibilityLabel="Yorum onayı"
                checked={consent}
                onChange={setConsent}
              >
                <Paragraph color="$color10" fontSize={12} flex={1} lineHeight={17}>
                  Yorumlarda ismimin gözükmesine ve yorum detaylarının platform genelinde
                  kullanılmasına izin veriyorum.{' '}
                  <Paragraph color="$blue10" fontSize={12} textDecorationLine="underline">
                    Aydınlatma Metni
                  </Paragraph>
                  &apos;ne ulaşmak için tıklayınız.
                </Paragraph>
              </AppCheckbox>

              <Paragraph color="$color10" fontSize={11} lineHeight={16}>
                Sağlık beyanı veya tıbbi öneri içeren değerlendirmelerinizi ilgili mevzuata aykırı
                olduğundan yayınlamamaktayız.
              </Paragraph>
            </KeyboardAwareSheetScrollView>

            <YStack
              borderTopColor="$borderColor"
              borderTopWidth={1}
              paddingBottom={Math.max(insets.bottom, 16)}
              paddingHorizontal="$4"
              paddingTop="$4"
            >
              <Button
                backgroundColor={canSubmit ? '$brand' : '$backgroundHover'}
                borderRadius="$4"
                disabled={!canSubmit}
                height={46}
                onPress={handleSubmit}
                pressStyle={{ backgroundColor: '$brand', opacity: 0.85 }}
              >
                <XStack alignItems="center" gap="$2">
                  {submit.isPending ? <Spinner color="white" size="small" /> : null}
                  <Paragraph color={canSubmit ? 'white' : '$color10'} fontWeight="700">
                    {submit.isPending ? 'Gönderiliyor...' : 'Yorum Yap'}
                  </Paragraph>
                </XStack>
              </Button>
            </YStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
