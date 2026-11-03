import type {
  FeedbackAnswerValue,
  FeedbackCategory,
  FeedbackField,
  FeedbackFormValues,
  FeedbackMessageMode,
} from '@/types/customer-feedback.types';
import { CUSTOMER_FEEDBACK_TEXTS as T } from '../constants/customer-feedback-texts';

/**
 * İstemci doğrulaması YALNIZ kolaylık içindir (sözleşme v1.0 §6.4, §9, v1.1 §1.2): son sözü sunucu söyler.
 * Hata anahtarları sunucunun `errors` anahtarlarıyla aynıdır (`answers.<alan>`, `message`, `email`…).
 */

export const MESSAGE_MAX_LENGTH = 5000;
const TEXT_DEFAULT_MAX = 255;
const EMAIL_MAX = 190;
const URL_MAX = 2048;
const FULL_NAME_MAX = 120;
const CONTACT_PHONE_MAX = 32;
const MIN_PHONE_DIGITS = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^[0-9+\-() ]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
/** `şema://yetki` kısmı; yetkide `kullanıcı:parola@` varsa adres reddedilir. */
const URL_AUTHORITY = /^https?:\/\/([^/?#\s]+)/i;
const HOST_WITH_PORT = /^([^:]+)(?::\d{1,5})?$/;

/** Sayfa alanında kabul edilen alan adları; connect `customer_feedback.page_url_hosts` ile aynı liste. */
export const SITE_URL_HOSTS: readonly string[] = [
  'haydigiy.com',
  'www.haydigiy.com',
  't.haydigiy.com',
  'haydigiytr.com',
  'www.haydigiytr.com',
  't.haydigiytr.com',
  'localhost',
];

export const isEmptyAnswer = (value: FeedbackAnswerValue | undefined): boolean =>
  Array.isArray(value) ? value.length === 0 : (value ?? '').trim().length === 0;

export const isValidEmail = (value: string) => value.length <= EMAIL_MAX && EMAIL_PATTERN.test(value);

export function isValidPhone(value: string, maxLength: number): boolean {
  const digits = value.replace(/\D/g, '').length;
  return value.length <= maxLength && PHONE_CHARS.test(value) && digits >= MIN_PHONE_DIGITS;
}

const isValidUrl = (value: string) => value.length <= URL_MAX && URL_PATTERN.test(value);

/** http(s), kimlik bilgisi yok ve alan adı site listesinde (oltalama/yönlendirme adresi kabul edilmez). */
export function isSiteUrl(value: string): boolean {
  const authority = URL_AUTHORITY.exec(value)?.[1];
  if (!isValidUrl(value) || !authority || authority.includes('@')) return false;
  const host = HOST_WITH_PORT.exec(authority)?.[1]?.toLowerCase();
  return Boolean(host) && SITE_URL_HOSTS.includes(host as string);
}

function validateUrl(field: FeedbackField, value: string): string | null {
  if (!isValidUrl(value)) return T.invalidUrl;
  return field.config.autofill === 'page_url' && !isSiteUrl(value) ? T.siteUrlOnly : null;
}

export function isValidDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function validateNumber(field: FeedbackField, value: string): string | null {
  const number = Number(value.replace(',', '.'));
  if (!Number.isFinite(number)) return T.invalidNumber;
  if (field.config.min !== undefined && number < field.config.min) return T.numberMin(field.config.min);
  if (field.config.max !== undefined && number > field.config.max) return T.numberMax(field.config.max);
  return null;
}

function validateChoices(field: FeedbackField, values: string[]): string | null {
  const allowed = new Set(field.config.options.map((option) => option.value));
  if (values.some((value) => !allowed.has(value))) return T.required;
  if (field.min !== null && values.length < field.min) return T.choiceMin(field.min);
  if (field.max !== null && values.length > field.max) return T.choiceMax(field.max);
  return null;
}

function validateText(field: FeedbackField, value: string): string | null {
  const max = field.config.maxLength ?? (field.type === 'textarea' ? MESSAGE_MAX_LENGTH : TEXT_DEFAULT_MAX);
  return value.length > max ? T.tooLong(max) : null;
}

function validateFilled(field: FeedbackField, value: FeedbackAnswerValue): string | null {
  const text = Array.isArray(value) ? '' : value.trim();
  switch (field.type) {
    case 'text':
    case 'textarea':
      return validateText(field, text);
    case 'email':
      return isValidEmail(text) ? null : T.invalidEmail;
    case 'tel':
      return isValidPhone(text, 20) ? null : T.invalidPhone;
    case 'url':
      return validateUrl(field, text);
    case 'number':
      return validateNumber(field, text);
    case 'date':
      return isValidDate(text) ? null : T.invalidDate;
    case 'select':
    case 'radio':
      return validateChoices(field, [text]);
    case 'checkbox':
      return validateChoices(field, Array.isArray(value) ? value : [text]);
    case 'rating': {
      const rating = Number(text);
      const max = field.config.max ?? 5;
      return Number.isInteger(rating) && rating >= 1 && rating <= max ? null : T.required;
    }
    default:
      return null;
  }
}

/** Tek alanın hatası; dosya alanları yükleme durumuyla ayrıca denetlenir. */
export function validateFieldValue(field: FeedbackField, value: FeedbackAnswerValue | undefined): string | null {
  if (field.type === 'file') return null;
  if (value === undefined || isEmptyAnswer(value)) return field.required ? T.required : null;
  return validateFilled(field, value);
}

export function validateMessage(message: string, mode: FeedbackMessageMode): string | null {
  if (mode === 'hidden') return null;
  const text = message.trim();
  if (!text) return mode === 'required' ? T.required : null;
  return text.length > MESSAGE_MAX_LENGTH ? T.tooLong(MESSAGE_MAX_LENGTH) : null;
}

function validateContact(values: FeedbackFormValues): Record<string, string> {
  const issues: Record<string, string> = {};
  const fullName = values.full_name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  if (fullName.length > FULL_NAME_MAX) issues.full_name = T.tooLong(FULL_NAME_MAX);
  if (email && !isValidEmail(email)) issues.email = T.invalidEmail;
  if (phone && !isValidPhone(phone, CONTACT_PHONE_MAX)) issues.phone = T.invalidPhone;
  return issues;
}

/** Kategorinin bütün istemci hataları, ekrandaki sırayla (`answers.*` → `message` → iletişim). */
export function collectFeedbackIssues(category: FeedbackCategory, values: FeedbackFormValues): Record<string, string> {
  const issues: Record<string, string> = {};
  for (const field of category.fields) {
    const issue = validateFieldValue(field, values.answers[field.key]);
    if (issue) issues[`answers.${field.key}`] = issue;
  }
  const messageIssue = validateMessage(values.message, category.message.mode);
  if (messageIssue) issues.message = messageIssue;
  return { ...issues, ...validateContact(values) };
}
