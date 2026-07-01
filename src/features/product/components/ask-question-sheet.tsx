import { useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from '@tamagui/lucide-icons-2';
import { Paragraph, ScrollView, Sheet, Spinner, TextArea, XStack, YStack } from 'tamagui';
import { AppButton, AppCheckbox, AppSheetOverlay, KeyboardAwareSheetScrollView } from '@/components/ui';
import { useAuthStatus } from '@/features/auth/hooks/use-auth-status';
import { useAskProductQuestionMutation } from '../api/product-questions.queries';

type AskQuestionSheetProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  productId: number | null;
};

const MAX_LENGTH = 2000;
const MIN_LENGTH = 10;

const CRITERIA_BULLETS = [
  'Ürün ile doğrudan ilgili olmalı',
  'Reklam, kampanya veya başka bir markanın tanıtımını içermemeli',
  'Kişisel haklara saldırı, hakaret, küfür, aşağılama içermemeli',
  'Genel ahlak kurallarına, hukuka ve kamu düzenine aykırı ifadeler barındırmamalı',
  'Müstehcen, siyasi veya yasa dışı içerik içermemeli',
];

const ANSWER_BULLETS = [
  'İlgili ürün sayfasında, soru ve yanıt birlikte yayımlanır',
  'Ayrıca yanıtlandığında e-posta ile bilgilendirme yapılır',
];

/** Bottom sheet to ask a product question (`POST /question`), mirroring the web modal. */
export function AskQuestionSheet({ open, onClose, slug, productId }: AskQuestionSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuthStatus();
  const askQuestion = useAskProductQuestionMutation(slug);

  const [question, setQuestion] = useState('');
  const [showNameConsent, setShowNameConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showCriteria, setShowCriteria] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const length = question.length;
  const canSubmit = question.trim().length >= MIN_LENGTH && agreedToTerms && !askQuestion.isPending;
  const counterText =
    length < MIN_LENGTH
      ? `En az ${MIN_LENGTH} karakter yazmalısınız. (${MIN_LENGTH - length} karakter kaldı)`
      : `Yazılan: ${length} | Kalan: ${MAX_LENGTH - length}`;

  const reset = () => {
    setQuestion('');
    setShowNameConsent(false);
    setAgreedToTerms(true);
    setShowCriteria(false);
    setError(null);
  };

  const handleClose = () => {
    if (askQuestion.isPending) return;
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (question.trim().length < MIN_LENGTH) {
      setError(`En az ${MIN_LENGTH} karakter yazmalısınız.`);
      return;
    }
    if (!agreedToTerms) {
      setError('Devam etmek için Kullanıcı Sözleşmesi’ni kabul etmelisiniz.');
      return;
    }
    if (productId == null) {
      setError('Ürün bilgisi yüklenemedi, lütfen tekrar deneyin.');
      return;
    }
    setError(null);
    try {
      await askQuestion.mutateAsync({ productId, question: question.trim() });
      reset();
      onClose();
      Alert.alert('Teşekkürler', 'Sorunuz alındı, en kısa sürede yanıtlanacaktır.');
    } catch (submitError) {
      const message =
        (submitError as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Soru gönderilirken bir hata oluştu.';
      setError(message);
    }
  };

  const title = showCriteria ? 'Soru Yayınlama Kriterleri' : 'Soru Sor';

  return (
    <Sheet
      disableDrag
      modal
      moveOnKeyboardChange
      onOpenChange={(next: boolean) => !next && handleClose()}
      open={open}
      snapPointsMode="fit"
    >
      <AppSheetOverlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6" maxHeight="92%">
        <XStack
          alignItems="center"
          borderBottomColor="$borderColor"
          borderBottomWidth={1}
          justifyContent="space-between"
          paddingBottom="$3"
          paddingHorizontal="$4"
          paddingTop="$4"
        >
          <Paragraph color="$color" fontSize={15} fontWeight="800">
            {title}
          </Paragraph>
          <Pressable accessibilityLabel="Kapat" accessibilityRole="button" hitSlop={8} onPress={handleClose}>
            <X color="$color" size={22} />
          </Pressable>
        </XStack>

        {!isAuthenticated ? (
          <YStack gap="$3" padding="$4" paddingBottom={Math.max(insets.bottom, 16)}>
            <Paragraph color="$color10" fontSize={14} textAlign="center">
              Soru sormak için hesabınıza giriş yapın.
            </Paragraph>
            <AppButton
              backgroundColor="$brand"
              borderColor="transparent"
              color="white"
              onPress={() => {
                onClose();
                router.push('/(tabs)/profile');
              }}
            >
              Giriş Yap
            </AppButton>
          </YStack>
        ) : showCriteria ? (
          <YStack paddingBottom={Math.max(insets.bottom, 16)}>
            <ScrollView contentContainerStyle={{ gap: 12, padding: 16 }} style={{ maxHeight: 380 }}>
              <Paragraph color="$color" fontSize={13} fontWeight="600" lineHeight={19}>
                HaydiGiy üzerinden ürünler hakkında soru sorduğunuzda, bu sorular belirli kriterler
                dahilinde değerlendirilerek en kısa sürede tarafımızca yanıtlanır.
              </Paragraph>
              <Paragraph color="$color" fontSize={13} fontWeight="700">
                Sorduğunuz soruların yayımlanabilmesi için aşağıdaki şartları sağlaması gerekir:
              </Paragraph>
              {CRITERIA_BULLETS.map((item) => (
                <Paragraph color="$color11" fontSize={13} key={item} lineHeight={18}>
                  • {item}
                </Paragraph>
              ))}
              <Paragraph color="$color" fontSize={13} fontWeight="700">
                Soru Yanıt Süresi ve Yayınlanma
              </Paragraph>
              <Paragraph color="$color11" fontSize={13} lineHeight={18}>
                Sorunuz yukarıdaki kriterlere uygunsa, en geç 48 saat içinde ekibimiz tarafından yanıtlanır.
              </Paragraph>
              {ANSWER_BULLETS.map((item) => (
                <Paragraph color="$color11" fontSize={13} key={item} lineHeight={18}>
                  • {item}
                </Paragraph>
              ))}
              <Paragraph color="$color11" fontSize={13} lineHeight={18}>
                Sorularınızı gönderirken “Sorularımda adımın görünmesine izin veriyorum” seçeneğini
                işaretlememeniz durumunda, isminiz yayımlanmaz.
              </Paragraph>
            </ScrollView>
            <YStack borderTopColor="$borderColor" borderTopWidth={1} padding="$4">
              <AppButton backgroundColor="$brand" borderColor="transparent" color="white" onPress={() => setShowCriteria(false)}>
                Geri
              </AppButton>
            </YStack>
          </YStack>
        ) : (
          <KeyboardAwareSheetScrollView testID="ask-question-keyboard-aware-scroll">
            <YStack gap="$2.5" padding="$4">
              <Paragraph color="$brand" fontSize={13} fontWeight="700">
                Ürün özellikleriyle ilgili sorularınızı buradan sorabilirsiniz.
              </Paragraph>

              <XStack alignItems="center" justifyContent="space-between">
                <Paragraph color="$color" fontSize={13}>
                  Sorunuz
                </Paragraph>
                <Paragraph
                  accessibilityRole="button"
                  color="$color"
                  fontSize={13}
                  onPress={() => setShowCriteria(true)}
                  pressStyle={{ opacity: 0.6 }}
                  textDecorationLine="underline"
                >
                  Soru Yayınlama Kriterlerimiz
                </Paragraph>
              </XStack>

              <TextArea
                backgroundColor="$background"
                borderColor="$borderColor"
                focusStyle={{ borderColor: '$brand' }}
                fontSize={15}
                height={96}
                maxLength={MAX_LENGTH}
                onChangeText={(text) => {
                  setQuestion(text);
                  setError(null);
                }}
                placeholder="Sorunuzu yazın..."
                placeholderTextColor="$color9"
                value={question}
              />
              <Paragraph color={length < MIN_LENGTH ? '$red10' : '$color10'} fontSize={11} textAlign="right">
                {counterText}
              </Paragraph>

              {error ? (
                <Paragraph color="$red10" fontSize={12}>
                  {error}
                </Paragraph>
              ) : null}

              <AppCheckbox
                accessibilityLabel="Ad soyad bilgimin görünmesine izin veriyorum"
                checked={showNameConsent}
                onChange={() => setShowNameConsent((prev) => !prev)}
              >
                <Paragraph color="$color11" fontSize={12} flex={1}>
                  Sorularımda Ad Soyad bilgimin gözükmesine izin veriyorum.
                </Paragraph>
              </AppCheckbox>

              <AppCheckbox
                accessibilityLabel="Kullanıcı Sözleşmesi’ni kabul ediyorum"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms((prev) => !prev)}
              >
                <Paragraph color="$color11" fontSize={12} flex={1}>
                  Soru sormak için{' '}
                  <Paragraph
                    accessibilityRole="button"
                    color="$brand"
                    fontSize={12}
                    fontWeight="600"
                    onPress={() => {
                      onClose();
                      router.push('/(tabs)/agreements');
                    }}
                    textDecorationLine="underline"
                  >
                    Kullanıcı Sözleşmesi
                  </Paragraph>{' '}
                  kabul ediyorum.
                </Paragraph>
              </AppCheckbox>

              <AppButton
                backgroundColor="$brand"
                borderColor="transparent"
                color="white"
                disabled={!canSubmit}
                opacity={canSubmit ? 1 : 0.5}
                onPress={handleSubmit}
                pressStyle={{ opacity: 0.85 }}
              >
                {askQuestion.isPending ? <Spinner color="white" /> : 'Gönder'}
              </AppButton>
            </YStack>
          </KeyboardAwareSheetScrollView>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
