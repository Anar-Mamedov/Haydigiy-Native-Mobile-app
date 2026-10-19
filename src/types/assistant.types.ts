/**
 * Haydi Asistan API sözleşmesi (şema sürümü 1, teslim paketi 1.1).
 * Sunucu ne gönderirse onu çizeriz: bu tipler yalnız BİLİNEN alanları tanımlar,
 * bilinmeyen blok/alan normalize aşamasında atlanır (assistantBlocks.ts).
 */

export type AssistantTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface AssistantTextBlock {
  type: 'text';
  id: string;
  text: string;
}

export interface AssistantButtonItem {
  id: string;
  label: string;
  payload: string;
  disabled: boolean;
}

export interface AssistantButtonsBlock {
  type: 'buttons';
  id: string;
  layout: 'list' | 'chips';
  items: AssistantButtonItem[];
}

export interface AssistantOrderListItem {
  select_id: string;
  payload: string;
  order_no: string;
  date_label: string;
  total_label: string;
  status_text: string;
  tone: AssistantTone;
  summary?: string;
  note?: string;
}

export interface AssistantOrderListBlock {
  type: 'order_list';
  id: string;
  items: AssistantOrderListItem[];
  empty_text?: string;
}

export interface AssistantOrderCardBlock {
  type: 'order_card';
  id: string;
  order_no: string;
  date_label: string;
  total_label: string;
  status_text: string;
  tone: AssistantTone;
  lines: { label: string; value: string }[];
  items: { name: string; qty: number; variant?: string }[];
  more_count?: number;
}

export interface AssistantTimelineBlock {
  type: 'timeline';
  id: string;
  title?: string;
  carrier?: string;
  tracking_no?: string;
  note?: string;
  events: { at_label: string; text: string; state: 'done' | 'current' }[];
}

export interface AssistantLinkButtonBlock {
  type: 'link_button';
  id: string;
  label: string;
  kind: string;
  href: { desktop: string; mobile: string };
}

export interface AssistantLiveSupportBlock {
  type: 'live_support';
  id: string;
  hint: string;
  label: string;
  href: string;
  number_label: string;
  copy_text: string;
}

export interface AssistantImageBlock {
  type: 'image';
  id: string;
  url: string;
  alt: string;
}

export interface AssistantVideoBlock {
  type: 'video';
  id: string;
  url: string;
}

export type AssistantBlock =
  | AssistantTextBlock
  | AssistantButtonsBlock
  | AssistantOrderListBlock
  | AssistantOrderCardBlock
  | AssistantTimelineBlock
  | AssistantLinkButtonBlock
  | AssistantLiveSupportBlock
  | AssistantImageBlock
  | AssistantVideoBlock;

export interface AssistantBreadcrumbItem {
  label: string;
  current: boolean;
  id?: string;
  payload?: string;
}

export type AssistantInputMode = 'text' | 'none';

export interface AssistantInputState {
  mode: AssistantInputMode;
  placeholder: string;
  maxlength: number;
}

export type AssistantAuthLevel = 'guest' | 'site_login';

export interface AssistantFallback {
  error_text: string;
  live_support: { label: string; href: string; number_label: string };
}

export interface AssistantConfig {
  enabled: boolean;
  schemaVersion: number;
  widgetMinVersion: string;
  maxText: number;
  imageHosts: string[];
  videoHosts: string[];
  fallback: AssistantFallback;
  texts: AssistantTexts;
}

export interface AssistantTexts {
  launcher_label: string;
  title: string;
  subtitle: string;
  input_placeholder: string;
  send_label: string;
  close_label: string;
  open_label: string;
  typing: string;
  send_failed: string;
  retry: string;
  copy_number: string;
  copied: string;
  live_copy_hint: string;
  live_copy_button: string;
  live_number_label: string;
  video_label: string;
  breadcrumb_label: string;
  /**
   * Sözleşmenin `texts`'inde HENÜZ olmayan ama arayüzün ihtiyaç duyduğu yazılar (README §6.7a/§6.7b/§10).
   * Sunucu aynı anahtarla gönderirse sunucununki kullanılır; göndermezse belgedeki cümle yedek kalır.
   */
  image_failed: string;
  video_failed: string;
  offline: string;
  new_messages: string;
  more_items: string;
  minimize_label: string;
  tracking_label: string;
}

/** Sunucunun her cevapta yenilediği "sohbetin altı" durumu. */
export interface AssistantTurnState {
  input: AssistantInputState;
  breadcrumb: AssistantBreadcrumbItem[];
  blocks: AssistantBlock[];
}

export interface AssistantSessionResult extends AssistantTurnState {
  sessionId: string;
  token: string;
  expiresAt: string;
  authLevel: AssistantAuthLevel;
}

export interface AssistantHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  blocks?: AssistantBlock[];
}

export interface AssistantHistoryResult {
  expiresAt: string;
  authLevel: AssistantAuthLevel;
  messages: AssistantHistoryMessage[];
  resume: AssistantTurnState;
}

export type AssistantTurnInput =
  | { type: 'select'; id: string; payload: string }
  | { type: 'text'; text: string };

export type AssistantEventType =
  | 'link_click'
  | 'live_support_click'
  | 'live_support_copy'
  | 'widget_open'
  | 'widget_close'
  | 'client_error';

export interface AssistantEvent {
  type: AssistantEventType;
  at: string;
  block_id?: string;
  kind?: string;
  code?: string;
}

/** Sohbet listesindeki tek satır (müşteri balonu ya da asistan turu). */
export type AssistantMessage =
  | {
      key: string;
      role: 'user';
      text: string;
      status: 'sent' | 'pending' | 'failed';
      retry?: { clientMsgId: string; input: AssistantTurnInput };
    }
  | {
      key: string;
      role: 'assistant';
      blocks: AssistantBlock[];
      /** Geri yüklenen geçmiş: buttons/order_list etkisiz çizilir (README §4.5). */
      restored: boolean;
      /**
       * Sunucuya ulaşılamadığında yerel yedek balon: metin + `config.fallback.live_support` (README §10).
       * `retrySession`: oturum açılamadı; "Tekrar dene" oturumu yeniden dener (turn hatasında yeniden
       * deneme müşteri balonunun yanındadır).
       */
      fallback?: { text: string; retrySession?: boolean };
    };
