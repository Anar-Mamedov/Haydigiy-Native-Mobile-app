import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FeedbackFormValues, FeedbackSubmitResult } from '@/types/customer-feedback.types';
import { useFeedbackFormQuery } from '../api/customer-feedback.queries';
import { findFeedbackCategory } from '../api/customer-feedback.mapper';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';
import { buildCustomerFeedbackSchema, EMPTY_FEEDBACK_VALUES } from '../schemas/customer-feedback.schema';
import { toFeedbackApiError } from '../utils/feedback-api-error';
import { buildFeedbackPayload, pruneValuesToCategory } from '../utils/feedback-payload';
import { collectFeedbackIssues } from '../utils/feedback-validation';
import { useFeedbackSubmit } from './use-feedback-submit';
import { useFeedbackUploads } from './use-feedback-uploads';

export type CustomerFeedbackFormOptions = {
  /** Haydi Asistan: başlık önceden seçili, kategori listesi çizilmez. */
  fixedCategoryKey?: string;
  productId?: number | null;
  onSubmitted?: (result: FeedbackSubmitResult) => void;
};

const FORM_FIELD_KEYS = new Set(['message', 'full_name', 'email', 'phone']);

const contactOf = (values: FeedbackFormValues): FeedbackFormValues => ({
  ...EMPTY_FEEDBACK_VALUES,
  full_name: values.full_name,
  email: values.email,
  phone: values.phone,
});

/**
 * Geri bildirim formunun bütün durumu: form tanımı, seçili başlık, cevaplar (RHF + Zod), dosyalar ve
 * gönderim. Ürün sheet'i, Hesabım ekranı ve asistan kartı bu kancayı aynı gövdeyle kullanır.
 */
export function useCustomerFeedbackForm({ fixedCategoryKey, productId, onSubmitted }: CustomerFeedbackFormOptions) {
  const formQuery = useFeedbackFormQuery();
  const feedbackForm = formQuery.data ?? null;
  const [selectedKey, setSelectedKey] = useState<string | null>(fixedCategoryKey ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showContactInputs, setShowContactInputs] = useState(false);
  const category = findFeedbackCategory(feedbackForm, selectedKey);

  const resolver = useMemo(() => zodResolver(buildCustomerFeedbackSchema(category)), [category]);
  const rhf = useForm<FeedbackFormValues>({ defaultValues: EMPTY_FEEDBACK_VALUES, mode: 'onTouched', resolver });
  const values = useWatch({ control: rhf.control }) as FeedbackFormValues;

  // form_outdated (sözleşme v1.0 §8.4): form yeniden çekilir; başlık hâlâ varsa korunur, yalnız hâlâ var
  // olan alanların cevapları kalır ve müşteriye "Form güncellendi" denir.
  const refreshForm = useCallback(async () => {
    const refreshed = (await formQuery.refetch()).data;
    if (!refreshed) return;
    setNotice(T.formUpdated);
    const current = findFeedbackCategory(refreshed, selectedKey);
    if (current) rhf.reset(pruneValuesToCategory(rhf.getValues(), current));
    else if (!fixedCategoryKey) setSelectedKey(null);
  }, [fixedCategoryKey, formQuery, rhf, selectedKey]);

  const uploads = useFeedbackUploads(category?.key ?? null, () => void refreshForm());
  const submission = useFeedbackSubmit();

  const selectCategory = useCallback(
    (key: string) => {
      if (key === selectedKey) return;
      setSelectedKey(key);
      setNotice(null);
      submission.setGeneralError(null);
      uploads.clear();
      rhf.reset(contactOf(rhf.getValues()));
    },
    [rhf, selectedKey, submission, uploads],
  );

  const issues = useMemo(
    () => (category ? collectFeedbackIssues(category, { ...EMPTY_FEEDBACK_VALUES, ...values }) : {}),
    [category, values],
  );
  const missingRequiredFile = category?.fields.some(
    (field) => field.type === 'file' && field.required && !uploads.attachments.some((item) => item.fieldKey === field.key),
  );

  const disabledReason = !category
    ? null
    : Object.keys(issues).length > 0 || missingRequiredFile
      ? T.submitHelp
      : uploads.hasPending
        ? T.uploadsPending
        : uploads.hasErrors
          ? T.uploadsFailed
          : null;
  const canSubmit = Boolean(category) && !disabledReason && !submission.submitting && submission.blockedSeconds === 0;

  const applyServerErrors = useCallback(
    (errors: Record<string, string>) => {
      let general: string | null = null;
      const attachmentFields: string[] = [];
      for (const [key, message] of Object.entries(errors)) {
        if (key.startsWith('answers.') || FORM_FIELD_KEYS.has(key)) {
          rhf.setError(key as keyof FeedbackFormValues, { type: 'server', message });
        } else if (key.startsWith('attachment_tokens')) {
          attachmentFields.push(key.split('.')[1] ?? '');
          uploads.markInvalid(key.includes('.') ? [key.split('.')[1]] : 'all', message);
        } else {
          general = general ?? message;
        }
      }
      submission.setGeneralError(general ?? (attachmentFields.length ? null : T.errorSummary(Object.keys(errors).length)));
      const firstField = Object.keys(errors).find((key) => key.startsWith('answers.') || FORM_FIELD_KEYS.has(key));
      if (firstField) rhf.setFocus(firstField as keyof FeedbackFormValues);
    },
    [rhf, submission, uploads],
  );

  const onValid = async (formValues: FeedbackFormValues) => {
    if (!category) return;
    setNotice(null);
    const payload = buildFeedbackPayload({
      category,
      values: formValues,
      attachments: uploads.attachments,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      productId,
    });
    const outcome = await submission.submit(payload);
    if (outcome.type === 'success') onSubmitted?.(outcome.result);
    else if (outcome.type === 'field_errors' || outcome.type === 'attachment_errors') applyServerErrors(outcome.errors);
    else if (outcome.type === 'form_outdated') await refreshForm();
  };
  const submit = () => rhf.handleSubmit(onValid)();

  const startOver = useCallback(() => {
    submission.reset();
    uploads.clear();
    setNotice(null);
    setSelectedKey(fixedCategoryKey ?? null);
    rhf.reset(contactOf(rhf.getValues()));
  }, [fixedCategoryKey, rhf, submission, uploads]);

  const formError = formQuery.isError ? toFeedbackApiError(formQuery.error) : null;

  return {
    status: feedbackForm ? 'ready' : formError?.kind === 'disabled' ? 'disabled' : formQuery.isError ? 'error' : 'loading',
    form: feedbackForm,
    reloadForm: () => void formQuery.refetch(),
    isReloading: formQuery.isFetching,
    category,
    selectCategory,
    control: rhf.control,
    setValue: rhf.setValue,
    errors: rhf.formState.errors,
    uploads,
    viewer: feedbackForm?.viewer ?? null,
    showContactInputs,
    setShowContactInputs,
    notice,
    canSubmit,
    disabledReason,
    submit,
    submitting: submission.submitting,
    blockedSeconds: submission.blockedSeconds,
    generalError: submission.generalError,
    result: submission.result,
    startOver,
  } as const;
}

export type CustomerFeedbackFormController = ReturnType<typeof useCustomerFeedbackForm>;
