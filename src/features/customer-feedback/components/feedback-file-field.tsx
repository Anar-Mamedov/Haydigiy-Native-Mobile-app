import { useState } from 'react';
import { YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { ImagePlus } from '@/components/ui/icons';
import type { FeedbackField } from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { FEEDBACK_MEDIA_LIMITS } from '../constants/feedback-media-limits';
import { useFeedbackMediaPicker } from '../hooks/use-feedback-media-picker';
import type { useFeedbackUploads } from '../hooks/use-feedback-uploads';
import { checkVideo, planMediaSelection } from '../utils/feedback-files';
import { FeedbackFieldShell, requiredLabel } from './feedback-field-shell';
import { FeedbackFileRow } from './feedback-file-row';

type FeedbackFileFieldProps = {
  field: FeedbackField;
  uploads: ReturnType<typeof useFeedbackUploads>;
  disabled?: boolean;
};

/**
 * Görsel + video alanı (sözleşme v1.0 §7). Kabul listesi alanın `config.accept`'inden gelir; en çok
 * `field.max` dosya, başvuruda en çok 1 video. Sınır aşımı sessizce kesilmez, alanın altında söylenir.
 */
export function FeedbackFileField({ field, uploads, disabled }: FeedbackFileFieldProps) {
  const pickMedia = useFeedbackMediaPicker();
  const [warnings, setWarnings] = useState<string[]>([]);
  const rows = uploads.rows.filter((row) => row.fieldKey === field.key);
  const maxFiles = field.max ?? FEEDBACK_MEDIA_LIMITS.defaultMaxFiles;
  const accept = field.config.accept.length ? field.config.accept : FEEDBACK_MEDIA_LIMITS.defaultAccept;
  const remaining = Math.max(0, maxFiles - rows.length);

  const handleAdd = async () => {
    if (remaining === 0) {
      setWarnings([T.tooManyFiles(maxFiles)]);
      return;
    }
    const picked = await pickMedia(remaining);
    if (picked.status === 'denied') setWarnings([T.photoPermission]);
    if (picked.status !== 'picked') return;

    const plan = planMediaSelection({
      assets: picked.assets,
      currentCount: rows.length,
      currentVideoCount: uploads.rows.filter((row) => row.kind === 'video').length,
      maxFiles,
    });
    const nextWarnings = [...plan.warnings];
    const ready = plan.accepted.filter(({ asset, kind }) => {
      const issue = kind === 'video' ? checkVideo(asset, accept) : null;
      if (issue) uploads.addRejected(field.key, asset, kind, issue);
      return !issue;
    });
    if (ready.length) uploads.addMedia(field.key, ready);
    setWarnings(nextWarnings);
  };

  return (
    <FeedbackFieldShell label={requiredLabel(field.label, field.required)} testID={`feedback-file-field-${field.key}`}>
      <YStack gap="$2">
        {rows.map((row) => (
          <FeedbackFileRow disabled={disabled} key={row.id} onRemove={uploads.remove} onRetry={uploads.retry} row={row} />
        ))}
        {warnings.map((warning) => (
          <Paragraph accessibilityLiveRegion="polite" color="$red10" fontSize={12} key={warning}>
            {warning}
          </Paragraph>
        ))}
        <AppButton
          accessibilityHint={`${rows.length}/${maxFiles}`}
          backgroundColor="$background"
          borderColor="$borderColor"
          borderStyle="dashed"
          borderWidth={1}
          color="$color"
          disabled={disabled || remaining === 0}
          icon={ImagePlus}
          onPress={() => void handleAdd()}
          opacity={disabled || remaining === 0 ? 0.6 : 1}
        >
          {`${T.addFiles} (${rows.length}/${maxFiles})`}
        </AppButton>
      </YStack>
    </FeedbackFieldShell>
  );
}
