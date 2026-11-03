/**
 * Müşteri Geri Bildirim formu (connect `/customer-feedback`, sözleşme v1.0 + v1.1).
 * Form içeriği SUNUCUDAN gelir (Form Builder); bu tipler yalnız çizim için gereken alanları tanımlar.
 */

export type FeedbackFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'rating';

export type FeedbackOption = { value: string; label: string };

/**
 * Otomatik doldurma (sözleşme v1.1 §1): `url` + `page_url` sayfa alanıdır (yalnız site adresi kabul
 * edilir); `text` + `product` ürün sorusudur (ürün biliniyorsa sorulmaz). Başka değer yok sayılır.
 */
export type FeedbackAutofill = 'page_url' | 'product';

export type FeedbackFieldConfig = {
  placeholder?: string;
  options: FeedbackOption[];
  maxLength?: number;
  /** number: alt/üst sınır ve adım; rating: en yüksek puan (3–10). */
  min?: number;
  max?: number;
  step?: number;
  /** file: kabul edilen MIME türleri ve görsel başına üst sınır (KB). */
  accept: string[];
  maxSizeKb?: number;
  autofill?: FeedbackAutofill;
};

export type FeedbackField = {
  key: string;
  type: FeedbackFieldType;
  label: string;
  required: boolean;
  multiple: boolean;
  /** checkbox/file: en az/en çok seçim sayısı. */
  min: number | null;
  max: number | null;
  config: FeedbackFieldConfig;
};

export type FeedbackMessageMode = 'hidden' | 'optional' | 'required';

export type FeedbackCategory = {
  key: string;
  title: string;
  description: string | null;
  message: { mode: FeedbackMessageMode; label: string; placeholder: string };
  fields: FeedbackField[];
};

/** Üye girişliyse sunucunun döndürdüğü iletişim bilgisi (yalnız görüntüleme/ön doldurma). */
export type FeedbackViewer = {
  fullName: string;
  phone: string;
  email: string;
};

export type FeedbackForm = {
  version: number;
  title: string;
  categories: FeedbackCategory[];
  viewer: FeedbackViewer | null;
};

/** Formun cevap değerleri: checkbox çoklu, diğerleri tek metin (sayı/puan da metin olarak tutulur). */
export type FeedbackAnswerValue = string | string[];

export type FeedbackFormValues = {
  answers: Record<string, FeedbackAnswerValue>;
  message: string;
  full_name: string;
  email: string;
  phone: string;
};

export type FeedbackPlatform = 'ios' | 'android';

export type FeedbackAnswerDto = { field_key: string; instance_index: number; value: string | number };
export type FeedbackAttachmentTokenDto = { field_key: string; instance_index: number; token: string };

export type FeedbackSubmitPayload = {
  context: 'general';
  category_key: string;
  message?: string;
  answers: FeedbackAnswerDto[];
  attachment_tokens: FeedbackAttachmentTokenDto[];
  platform: FeedbackPlatform;
  product_id?: number;
  full_name?: string;
  phone?: string;
  email?: string;
  website: '';
};

/** Takip numarası (`data.reference`) müşteriye gösterilmez (sözleşme v1.1 §3), modelde de tutulmaz. */
export type FeedbackSubmitResult = { duplicate: boolean };

export type FeedbackUploadResult = { uploadToken: string; mimeType: string; fileSize: number };
