import { Image } from 'expo-image';
import { CircleAlert, CircleCheck } from '@tamagui/lucide-icons-2';
import { Button, Paragraph, ScrollView, Sheet, XStack, YStack } from 'tamagui';
import { ReturnMethod } from '@/types/order.types';

const PTT_LOGO_URL = 'https://cdn.haydigiy.com/uploads/cargo-logos/ptt.png';

type Props = {
  successMessage: string | null;
  errorMessage: string | null;
  isStorePickup: boolean;
  returnMethod: ReturnMethod;
  isRecreating: boolean;
  onCloseSuccess: () => void;
  onCloseError: () => void;
  onRecreatePtt: () => void;
};

function SuccessInfo({
  isStorePickup,
  returnMethod,
}: {
  isStorePickup: boolean;
  returnMethod: ReturnMethod;
}) {
  if (isStorePickup) {
    return (
      <YStack gap="$2">
        <Paragraph color="$color" fontSize={15} fontWeight="700" textAlign="center">
          Mağazaya İade Edilecek
        </Paragraph>
        <Paragraph color="$color10" fontSize={13} textAlign="center">
          Mağazadan alınan siparişler mağazaya iade edilmelidir.
        </Paragraph>
      </YStack>
    );
  }
  if (returnMethod === 'hepsijet') {
    return (
      <YStack gap="$2">
        <Paragraph color="$color" fontSize={15} fontWeight="700" textAlign="center">
          Hepsijet ile evden alım
        </Paragraph>
        <Paragraph color="$color10" fontSize={13}>
          Kurye, seçtiğiniz tarihte adresinizden iadenizi teslim alacaktır.
        </Paragraph>
        <Paragraph color="$color10" fontSize={13}>
          Lütfen ürünleri orijinal paketiyle hazır bulundurun.
        </Paragraph>
      </YStack>
    );
  }
  return (
    <YStack alignItems="center" gap="$2">
      <Image
        contentFit="contain"
        source={{ uri: PTT_LOGO_URL }}
        style={{ width: 80, height: 32 }}
      />
      <Paragraph color="$color" fontSize={15} fontWeight="700" textAlign="center">
        PTT Kargo ile gönderilecek
      </Paragraph>
      <Paragraph color="$color10" fontSize={13}>
        PTT Kargo şubelerinden iadenizi ücretsiz olarak gönderebilirsiniz.
      </Paragraph>
      <Paragraph color="$color10" fontSize={13}>
        Kargonuzu şubeye teslim ederken iade kodunu görevliyle paylaşmanız yeterlidir.
      </Paragraph>
    </YStack>
  );
}

/** Success + error result sheets for the return flow (incl. the Hepsijet→PTT retry). */
export function ReturnResultSheets({
  successMessage,
  errorMessage,
  isStorePickup,
  returnMethod,
  isRecreating,
  onCloseSuccess,
  onCloseError,
  onRecreatePtt,
}: Props) {
  const normalizedError = (errorMessage ?? '').toLocaleLowerCase('tr-TR');
  const showRecreate =
    normalizedError.includes('hepsijet') && normalizedError.includes('sistemde kayıtlı');

  return (
    <>
      <Sheet
        dismissOnOverlayPress
        modal
        onOpenChange={(open: boolean) => !open && onCloseSuccess()}
        open={successMessage !== null}
        snapPointsMode="fit"
      >
        <Sheet.Overlay backgroundColor="$shadowColor" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} opacity={0.5} />
        <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} style={{ maxHeight: 480 }}>
            <YStack alignItems="center" gap="$2">
              <XStack
                alignItems="center"
                backgroundColor="$green2"
                borderRadius={100}
                height={56}
                justifyContent="center"
                width={56}
              >
                <CircleCheck color="$green10" size={32} />
              </XStack>
              <Paragraph color="$color" fontSize={18} fontWeight="800">
                Başarılı
              </Paragraph>
            </YStack>
            <YStack backgroundColor="$backgroundHover" borderRadius="$4" padding="$3">
              <Paragraph color="$color" fontSize={13} textAlign="center">
                {successMessage}
              </Paragraph>
            </YStack>
            <YStack backgroundColor="$blue2" borderColor="$blue6" borderRadius="$4" borderWidth={1} gap="$2" padding="$3">
              <SuccessInfo isStorePickup={isStorePickup} returnMethod={returnMethod} />
            </YStack>
            <Button
              accessibilityLabel="Siparişlerime dön"
              backgroundColor="$green10"
              borderRadius="$4"
              height={46}
              onPress={onCloseSuccess}
              pressStyle={{ opacity: 0.85 }}
            >
              <Paragraph color="white" fontWeight="700">
                Siparişlerime dön
              </Paragraph>
            </Button>
          </ScrollView>
        </Sheet.Frame>
      </Sheet>

      <Sheet
        dismissOnOverlayPress
        modal
        onOpenChange={(open: boolean) => !open && onCloseError()}
        open={errorMessage !== null}
        snapPointsMode="fit"
      >
        <Sheet.Overlay backgroundColor="$shadowColor" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} opacity={0.5} />
        <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
          <YStack gap="$3" padding="$5">
            <XStack alignItems="center" gap="$2">
              <CircleAlert color="$red10" size={20} />
              <Paragraph color="$red10" fontSize={16} fontWeight="800">
                İşlem başarısız
              </Paragraph>
            </XStack>
            <Paragraph color="$color" fontSize={14}>
              {errorMessage}
            </Paragraph>

            {showRecreate ? (
              <YStack gap="$3" paddingTop="$1">
                <YStack backgroundColor="$yellow2" borderColor="$yellow6" borderRadius="$4" borderWidth={1} padding="$3">
                  <Paragraph color="$yellow11" fontSize={12} lineHeight={18}>
                    HepsiJet üzerinden iade talebi oluşturulamıyor, iadenizi PTT üzerinden
                    oluşturabilirsiniz.
                  </Paragraph>
                </YStack>
                <Button
                  backgroundColor="$brand"
                  borderRadius="$4"
                  disabled={isRecreating}
                  height={44}
                  onPress={onRecreatePtt}
                  opacity={isRecreating ? 0.7 : 1}
                  pressStyle={{ opacity: 0.85 }}
                >
                  <Paragraph color="white" fontWeight="700">
                    {isRecreating ? 'Oluşturuluyor...' : 'PTT İade Talebi Oluştur'}
                  </Paragraph>
                </Button>
                <Button
                  backgroundColor="$background"
                  borderColor="$borderColor"
                  borderRadius="$4"
                  borderWidth={1}
                  disabled={isRecreating}
                  height={44}
                  onPress={onCloseError}
                  pressStyle={{ backgroundColor: '$backgroundHover' }}
                >
                  <Paragraph color="$color" fontWeight="600">
                    Kapat
                  </Paragraph>
                </Button>
              </YStack>
            ) : (
              <Button
                backgroundColor="$background"
                borderColor="$borderColor"
                borderRadius="$4"
                borderWidth={1}
                height={44}
                onPress={onCloseError}
                pressStyle={{ backgroundColor: '$backgroundHover' }}
              >
                <Paragraph color="$color" fontWeight="600">
                  Kapat
                </Paragraph>
              </Button>
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
