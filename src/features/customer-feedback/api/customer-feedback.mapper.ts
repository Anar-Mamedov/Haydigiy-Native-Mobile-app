import type {
  FeedbackCategory,
  FeedbackField,
  FeedbackFieldConfig,
  FeedbackFieldType,
  FeedbackForm,
  FeedbackMessageMode,
  FeedbackOption,
  FeedbackViewer,
} from '@/types/customer-feedback.types';

/**
 * `GET /customer-feedback/forms` cevabını çizilebilir modele çevirir. Sunucu ne gönderirse onu çizeriz:
 * bilinmeyen alan tipi ve kimliği olmayan kategori/alan ATLANIR, eksik değer çökmeden varsayılana düşer.
 */

const FIELD_TYPES: readonly FeedbackFieldType[] = [
  'text',
  'textarea',
  'email',
  'tel',
  'url',
  'number',
  'date',
  'select',
  'radio',
  'checkbox',
  'file',
  'rating',
];
const MESSAGE_MODES: readonly FeedbackMessageMode[] = ['hidden', 'optional', 'required'];

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Raw) : null;
const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const optStr = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value : undefined;
const optNum = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const nullableNum = (value: unknown): number | null => optNum(value) ?? null;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

function toOption(value: unknown): FeedbackOption | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const optionValue = str(raw.value);
  return optionValue ? { value: optionValue, label: str(raw.label) || optionValue } : null;
}

function toConfig(value: unknown): FeedbackFieldConfig {
  const raw = asRecord(value) ?? {};
  return {
    placeholder: optStr(raw.placeholder),
    options: list(raw.options)
      .map(toOption)
      .filter((option): option is FeedbackOption => option !== null),
    maxLength: optNum(raw.max_length),
    min: optNum(raw.min),
    max: optNum(raw.max),
    step: optNum(raw.step),
    accept: list(raw.accept).filter((item): item is string => typeof item === 'string'),
    maxSizeKb: optNum(raw.max_size_kb),
  };
}

function toField(value: unknown): FeedbackField | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const key = str(raw.key);
  const type = str(raw.type) as FeedbackFieldType;
  if (!key || !FIELD_TYPES.includes(type)) return null;
  return {
    key,
    type,
    label: str(raw.label) || key,
    required: raw.required === true,
    multiple: raw.multiple === true,
    min: nullableNum(raw.min),
    max: nullableNum(raw.max),
    config: toConfig(raw.config),
  };
}

function toMessage(value: unknown): FeedbackCategory['message'] {
  const raw = asRecord(value) ?? {};
  const mode = str(raw.mode) as FeedbackMessageMode;
  return {
    mode: MESSAGE_MODES.includes(mode) ? mode : 'optional',
    label: str(raw.label) || 'Açıklama',
    placeholder: str(raw.placeholder),
  };
}

function toCategory(value: unknown): FeedbackCategory | null {
  const raw = asRecord(value);
  if (!raw) return null;
  const key = str(raw.key);
  if (!key) return null;
  return {
    key,
    title: str(raw.title) || key,
    description: optStr(raw.description) ?? null,
    message: toMessage(raw.message),
    fields: list(raw.fields)
      .map(toField)
      .filter((field): field is FeedbackField => field !== null),
  };
}

function toViewer(value: unknown): FeedbackViewer | null {
  const raw = asRecord(value);
  if (!raw) return null;
  return { fullName: str(raw.full_name), phone: str(raw.phone), email: str(raw.email) };
}

export function mapFeedbackForm(dto: unknown): FeedbackForm | null {
  const raw = asRecord(dto);
  if (!raw) return null;
  return {
    version: optNum(raw.version) ?? 0,
    title: str(raw.title),
    categories: list(raw.categories)
      .map(toCategory)
      .filter((category): category is FeedbackCategory => category !== null),
    viewer: toViewer(raw.viewer),
  };
}

export function findFeedbackCategory(form: FeedbackForm | null | undefined, key: string | null | undefined) {
  if (!form || !key) return null;
  return form.categories.find((category) => category.key === key) ?? null;
}
