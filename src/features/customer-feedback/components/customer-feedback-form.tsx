import { useEffect, useRef } from 'react';
import { Spinner, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { AppButton } from '@/components/ui/app-button';
import { AppRadioGroup } from '@/components/ui/app-radio-group';
import type { FeedbackSubmitResult } from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { useCustomerFeedbackForm } from '../hooks/use-customer-feedback-form';
import { FeedbackCategoryBody } from './feedback-category-body';
import { FeedbackContactFields } from './feedback-contact-fields';
import { FeedbackSubmitArea } from './feedback-submit-area';
import { FeedbackSuccessView } from './feedback-success-view';

/** Asistanın bloktaki `texts`'i (Dash'ten düzenlenir); verilmeyen anahtar uygulama metnine düşer. */
export type CustomerFeedbackFormTexts = {
  submit?: string;
  sending?: string;
  success?: string;
  reference?: string;
  error?: string;
  cancel?: string;
};

export type CustomerFeedbackFormProps = {
  /** Haydi Asistan: başlık seçili gelir, başlık listesi çizilmez. */
  fixedCategoryKey?: string;
  productId?: number | null;
  texts?: CustomerFeedbackFormTexts;
  onSubmitted?: (result: FeedbackSubmitResult) => void;
  /** Verilirse form altında "Vazgeç" çizilir (asistan kartı). */
  onCancel?: () => void;
  /** Başarı ekranının "Kapat" düğmesi (sheet). */
  onClose?: () => void;
  /** Başarı ekranında "Başka bir konu bildir" (asistan kartında salt okunur olduğu için yok). */
  allowAnother?: boolean;
};

function StateMessage({ text, onRetry, busy }: { text: string; onRetry?: () => void; busy?: boolean }) {
  return (
    <YStack alignItems="center" gap="$3" paddingVertical="$4" testID="feedback-form-state">
      <Paragraph color="$color10" fontSize={14} textAlign="center">
        {text}
      </Paragraph>
      {onRetry ? (
        <AppButton backgroundColor="$background" borderColor="$borderColor" borderWidth={1} color="$color" disabled={busy} onPress={onRetry}>
          {T.retry}
        </AppButton>
      ) : null}
    </YStack>
  );
}

/**
 * Site geneli geri bildirim formu (sözleşme v1.0). Ürün sheet'i, Hesabım ekranı ve asistan kartı bu
 * gövdeyi barındırır; durum ve istekler `useCustomerFeedbackForm` içindedir.
 */
export function CustomerFeedbackForm({
  fixedCategoryKey,
  productId,
  texts,
  onSubmitted,
  onCancel,
  onClose,
  allowAnother = true,
}: CustomerFeedbackFormProps) {
  const ctrl = useCustomerFeedbackForm({ fixedCategoryKey, productId, onSubmitted });
  const missingCategory = ctrl.status === 'ready' && Boolean(fixedCategoryKey) && !ctrl.category;
  const reloadedForMissing = useRef(false);

  // Başlık Form Builder'da kaldırılmış olabilir: kart çizilmez, form bir kez yeniden çekilir.
  useEffect(() => {
    if (!missingCategory || reloadedForMissing.current) return;
    reloadedForMissing.current = true;
    ctrl.reloadForm();
  }, [ctrl, missingCategory]);

  if (ctrl.status === 'loading') {
    return (
      <YStack alignItems="center" gap="$2" paddingVertical="$4" testID="feedback-form-loading">
        <Spinner color="$brand" />
        <Paragraph color="$color10" fontSize={13}>
          {T.loadingForm}
        </Paragraph>
      </YStack>
    );
  }
  if (ctrl.status === 'disabled') return <StateMessage text={T.disabled} />;
  if (ctrl.status === 'error') {
    return <StateMessage busy={ctrl.isReloading} onRetry={ctrl.reloadForm} text={texts?.error ?? T.formUnavailable} />;
  }
  if (missingCategory) return <StateMessage text={texts?.error ?? T.formUnavailable} />;

  if (ctrl.result) {
    return (
      <FeedbackSuccessView
        onAnother={allowAnother ? ctrl.startOver : undefined}
        onClose={onClose}
        reference={ctrl.result.reference}
        referenceLabel={texts?.reference ?? T.referenceLabel}
        title={texts?.success ?? T.successTitle}
        withVideoNote={ctrl.uploads.rows.some((row) => row.kind === 'video' && row.status === 'done')}
      />
    );
  }

  const busy = ctrl.submitting;
  const body = (key: string) =>
    ctrl.category && ctrl.category.key === key ? (
      <FeedbackCategoryBody category={ctrl.category} control={ctrl.control} disabled={busy} showDescription={Boolean(fixedCategoryKey)} uploads={ctrl.uploads} />
    ) : null;

  return (
    <YStack gap="$4" testID="customer-feedback-form">
      {ctrl.notice ? (
        <Paragraph accessibilityLiveRegion="polite" color="$color11" fontSize={13} testID="feedback-form-notice">
          {ctrl.notice}
        </Paragraph>
      ) : null}
      {fixedCategoryKey ? (
        body(fixedCategoryKey)
      ) : (
        <YStack gap="$3">
          <Paragraph accessibilityRole="header" color="$color" fontSize={15} fontWeight="700">
            {ctrl.form?.title || T.defaultFormTitle}
          </Paragraph>
          <AppRadioGroup
            accessibilityLabel={ctrl.form?.title || T.defaultFormTitle}
            disabled={busy}
            onChange={ctrl.selectCategory}
            options={(ctrl.form?.categories ?? []).map((category) => ({
              value: category.key,
              label: category.title,
              description: category.description,
            }))}
            renderSelectedContent={(option) => body(option.value)}
            testID="feedback-categories"
            value={ctrl.category?.key ?? null}
          />
        </YStack>
      )}
      {ctrl.category ? (
        <>
          <FeedbackContactFields
            control={ctrl.control}
            disabled={busy}
            onShowInputs={() => ctrl.setShowContactInputs(true)}
            setValue={ctrl.setValue}
            showInputs={ctrl.showContactInputs}
            viewer={ctrl.viewer}
          />
          <FeedbackSubmitArea
            blockedSeconds={ctrl.blockedSeconds}
            canSubmit={ctrl.canSubmit}
            cancelLabel={texts?.cancel}
            disabledReason={ctrl.disabledReason}
            generalError={ctrl.generalError}
            onCancel={onCancel}
            onSubmit={() => void ctrl.submit()}
            sendingLabel={texts?.sending ?? T.sending}
            submitLabel={texts?.submit ?? T.submit}
            submitting={busy}
          />
        </>
      ) : null}
    </YStack>
  );
}
