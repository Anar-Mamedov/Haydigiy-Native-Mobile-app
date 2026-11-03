import type {
  FeedbackAnswerDto,
  FeedbackAttachmentTokenDto,
  FeedbackCategory,
  FeedbackField,
  FeedbackFormValues,
  FeedbackPlatform,
  FeedbackSubmitPayload,
} from '@/types/customer-feedback.types';
import { isEmptyAnswer } from './feedback-validation';

/** Yüklenmiş (belirteci alınmış) dosya. */
export type UploadedAttachment = { fieldKey: string; token: string };

type BuildParams = {
  category: FeedbackCategory;
  values: FeedbackFormValues;
  attachments: UploadedAttachment[];
  platform: FeedbackPlatform;
  productId?: number | null;
};

function toAnswerRows(field: FeedbackField, values: FeedbackFormValues): FeedbackAnswerDto[] {
  const value = values.answers[field.key];
  if (field.type === 'file' || value === undefined || isEmptyAnswer(value)) return [];
  if (Array.isArray(value)) {
    return value.map((item, index) => ({ field_key: field.key, instance_index: index, value: item }));
  }
  const text = value.trim();
  const typed = field.type === 'number' ? Number(text.replace(',', '.')) : field.type === 'rating' ? Number(text) : text;
  return [{ field_key: field.key, instance_index: 0, value: typed }];
}

function toAttachmentRows(category: FeedbackCategory, attachments: UploadedAttachment[]): FeedbackAttachmentTokenDto[] {
  return category.fields
    .filter((field) => field.type === 'file')
    .flatMap((field) =>
      attachments
        .filter((attachment) => attachment.fieldKey === field.key)
        .map((attachment, index) => ({ field_key: field.key, instance_index: index, token: attachment.token })),
    );
}

const optionalText = (value: string): string | undefined => value.trim() || undefined;

/**
 * Gönderim gövdesi (sözleşme v1.0 §5.3, §6.3): boş alan gönderilmez, onay kutusunda her seçim ayrı
 * satırdır, dosyalar `answers`'a değil `attachment_tokens`'a girer, gizli mesaj ve boş iletişim gitmez,
 * bal küpü `website` her zaman boştur.
 */
export function buildFeedbackPayload({ category, values, attachments, platform, productId }: BuildParams): FeedbackSubmitPayload {
  const payload: FeedbackSubmitPayload = {
    context: 'general',
    category_key: category.key,
    answers: category.fields.flatMap((field) => toAnswerRows(field, values)),
    attachment_tokens: toAttachmentRows(category, attachments),
    platform,
    website: '',
  };
  const message = category.message.mode === 'hidden' ? undefined : optionalText(values.message);
  if (message) payload.message = message;
  if (productId && Number.isSafeInteger(productId) && productId > 0) payload.product_id = productId;
  const fullName = optionalText(values.full_name);
  const email = optionalText(values.email);
  const phone = optionalText(values.phone);
  if (fullName) payload.full_name = fullName;
  if (email) payload.email = email;
  if (phone) payload.phone = phone;
  return payload;
}

/** Formun güncellenmesinden (form_outdated) sonra yalnız hâlâ var olan alanların cevapları korunur. */
export function pruneValuesToCategory(values: FeedbackFormValues, category: FeedbackCategory): FeedbackFormValues {
  const keys = new Set(category.fields.map((field) => field.key));
  return {
    ...values,
    answers: Object.fromEntries(Object.entries(values.answers).filter(([key]) => keys.has(key))),
    message: category.message.mode === 'hidden' ? '' : values.message,
  };
}
