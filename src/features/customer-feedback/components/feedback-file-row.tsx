import { Image } from 'expo-image';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { TextActionButton } from '@/components/ui/text-action-button';
import { Video } from '@/components/ui/icons';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import type { FeedbackUploadRow } from '../hooks/use-feedback-uploads';

type FeedbackFileRowProps = {
  row: FeedbackUploadRow;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
};

const THUMB = 48;

function statusText(row: FeedbackUploadRow): string {
  if (row.status === 'error') return row.error ?? T.fileFailed;
  if (row.status === 'uploading') return T.fileStatus.uploading(row.progress);
  return T.fileStatus[row.status];
}

/** Tek dosya satırı: yerel önizleme · durum (hazırlanıyor → yükleniyor % → yüklendi ✓ / hata) · eylemler. */
export function FeedbackFileRow({ row, onRetry, onRemove, disabled }: FeedbackFileRowProps) {
  const isError = row.status === 'error';

  return (
    <XStack
      accessibilityLabel={`${row.name}: ${statusText(row)}`}
      accessibilityLiveRegion="polite"
      alignItems="center"
      borderColor={isError ? '$red8' : '$borderColor'}
      borderRadius="$4"
      borderWidth={1}
      gap="$3"
      padding="$2"
      testID={`feedback-file-row-${row.status}`}
    >
      {row.kind === 'image' ? (
        <Image
          accessibilityIgnoresInvertColors
          contentFit="cover"
          source={{ uri: row.previewUri }}
          style={{ borderRadius: 6, height: THUMB, width: THUMB }}
        />
      ) : (
        <YStack alignItems="center" backgroundColor="$color3" borderRadius="$2" height={THUMB} justifyContent="center" width={THUMB}>
          <Video color="$color11" size={22} />
        </YStack>
      )}
      <YStack flex={1} gap="$1">
        <Paragraph color="$color" ellipsizeMode="middle" fontSize={13} numberOfLines={1}>
          {row.name}
        </Paragraph>
        <Paragraph color={isError ? '$red10' : row.status === 'done' ? '$green10' : '$color10'} fontSize={12}>
          {statusText(row)}
        </Paragraph>
      </YStack>
      <XStack alignItems="center" gap="$1">
        {isError && row.retryable ? (
          <TextActionButton
            accessibilityLabel={`${row.name}: ${T.retry}`}
            accessibilityState={{ disabled }}
            color="$brand"
            label={T.retry}
            onPress={() => {
              if (!disabled) onRetry(row.id);
            }}
            paddingHorizontal={6}
          />
        ) : null}
        <TextActionButton
          accessibilityLabel={`${row.name}: ${T.remove}`}
          accessibilityState={{ disabled }}
          color="$color11"
          label={T.remove}
          onPress={() => {
            if (!disabled) onRemove(row.id);
          }}
          paddingHorizontal={6}
        />
      </XStack>
    </XStack>
  );
}
