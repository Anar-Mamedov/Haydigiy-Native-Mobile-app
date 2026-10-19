import {
  isSafeImageUrl,
  isSafeRelativeHref,
  isSafeVideoUrl,
  isSafeWhatsappHref,
} from '../utils/assistant-links';
import type {
  AssistantBlock,
  AssistantBreadcrumbItem,
  AssistantButtonItem,
  AssistantInputState,
  AssistantOrderListItem,
  AssistantTone,
} from '@/types/assistant.types';

/**
 * Sunucu cevabını çizilebilir bloklara çevirir (README §2 kural 3, §6).
 * - Bilinmeyen blok türü ATLANIR (`unknown_block`), bilinmeyen alan yok sayılır.
 * - Adresi desen dışı link/görsel/video çizilmez ve `client_error` kodu üretilir.
 * - Sınır aşımı çökmeden kırpılır. Metinler DEĞİŞTİRİLMEZ (biçimlendirme/hesaplama yok).
 */

export interface BlockContext {
  imageHosts: readonly string[];
  videoHosts: readonly string[];
  /** wa.me deseni bozuksa kullanılacak `config.fallback.live_support.href`. */
  fallbackWhatsappHref: string;
}

export interface BlockIssue {
  code: 'bad_href' | 'bad_image' | 'bad_video' | 'unknown_block';
  blockId?: string;
}

const MAX_BLOCKS = 24;
const TONES: AssistantTone[] = ['info', 'success', 'warning', 'danger', 'neutral'];

type Raw = Record<string, unknown>;

const asRecord = (value: unknown): Raw | null => (value && typeof value === 'object' ? (value as Raw) : null);
const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const optStr = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const tone = (value: unknown): AssistantTone =>
  TONES.includes(value as AssistantTone) ? (value as AssistantTone) : 'neutral';

const toButtonItem = (value: unknown): AssistantButtonItem | null => {
  const raw = asRecord(value);
  if (!raw || !str(raw.id) || !str(raw.label) || !str(raw.payload)) return null;
  return {
    id: str(raw.id),
    label: str(raw.label),
    payload: str(raw.payload),
    disabled: raw.disabled === true,
  };
};

const toOrderItem = (value: unknown): AssistantOrderListItem | null => {
  const raw = asRecord(value);
  if (!raw || !str(raw.select_id) || !str(raw.payload)) return null;
  return {
    select_id: str(raw.select_id),
    payload: str(raw.payload),
    order_no: str(raw.order_no),
    date_label: str(raw.date_label),
    total_label: str(raw.total_label),
    status_text: str(raw.status_text),
    tone: tone(raw.tone),
    summary: optStr(raw.summary),
    note: optStr(raw.note),
  };
};

const toOrderCard = (raw: Raw, id: string): AssistantBlock => ({
  type: 'order_card',
  id,
  order_no: str(raw.order_no),
  date_label: str(raw.date_label),
  total_label: str(raw.total_label),
  status_text: str(raw.status_text),
  tone: tone(raw.tone),
  lines: list(raw.lines)
    .map(asRecord)
    .filter((line): line is Raw => !!line && !!str(line.label))
    .map((line) => ({ label: str(line.label), value: str(line.value) })),
  items: list(raw.items)
    .map(asRecord)
    .filter((item): item is Raw => !!item && !!str(item.name))
    .slice(0, 10)
    .map((item) => ({
      name: str(item.name),
      qty: Math.max(1, Number(item.qty) || 1),
      variant: optStr(item.variant),
    })),
  more_count: typeof raw.more_count === 'number' && raw.more_count > 0 ? raw.more_count : undefined,
});

const toTimeline = (raw: Raw, id: string): AssistantBlock => ({
  type: 'timeline',
  id,
  title: optStr(raw.title),
  carrier: optStr(raw.carrier),
  tracking_no: optStr(raw.tracking_no),
  note: optStr(raw.note),
  events: list(raw.events)
    .map(asRecord)
    .filter((event): event is Raw => !!event && !!str(event.text))
    .slice(0, 30)
    .map((event) => ({
      at_label: str(event.at_label),
      text: str(event.text),
      state: event.state === 'current' ? 'current' : 'done',
    })),
});

type Converter = (raw: Raw, id: string, ctx: BlockContext, issues: BlockIssue[]) => AssistantBlock | null;

const CONVERTERS: Record<string, Converter> = {
  text: (raw, id) => (str(raw.text) ? { type: 'text', id, text: str(raw.text).slice(0, 2000) } : null),
  buttons: (raw, id) => {
    const items = list(raw.items)
      .map(toButtonItem)
      .filter((item): item is AssistantButtonItem => !!item);
    if (items.length === 0) return null;
    return {
      type: 'buttons',
      id,
      layout: raw.layout === 'chips' ? 'chips' : 'list',
      items: items.slice(0, 12),
    };
  },
  order_list: (raw, id) => ({
    type: 'order_list',
    id,
    items: list(raw.items)
      .map(toOrderItem)
      .filter((item): item is AssistantOrderListItem => !!item)
      .slice(0, 10),
    empty_text: optStr(raw.empty_text),
  }),
  order_card: (raw, id) => toOrderCard(raw, id),
  timeline: (raw, id) => toTimeline(raw, id),
  link_button: (raw, id, _ctx, issues) => {
    const href = asRecord(raw.href);
    if (!str(raw.label) || !href || !isSafeRelativeHref(href.desktop) || !isSafeRelativeHref(href.mobile)) {
      issues.push({ code: 'bad_href', blockId: id });
      return null;
    }
    return {
      type: 'link_button',
      id,
      label: str(raw.label),
      kind: str(raw.kind),
      href: { desktop: href.desktop, mobile: href.mobile },
    };
  },
  live_support: (raw, id, ctx) => ({
    type: 'live_support',
    id,
    hint: str(raw.hint),
    label: str(raw.label),
    href: isSafeWhatsappHref(raw.href) ? raw.href : ctx.fallbackWhatsappHref,
    number_label: str(raw.number_label),
    copy_text: str(raw.copy_text),
  }),
  image: (raw, id, ctx, issues) => {
    if (isSafeImageUrl(raw.url, ctx.imageHosts))
      return { type: 'image', id, url: raw.url, alt: str(raw.alt) };
    issues.push({ code: 'bad_image', blockId: id });
    return null;
  },
  video: (raw, id, ctx, issues) => {
    if (isSafeVideoUrl(raw.url, ctx.videoHosts)) return { type: 'video', id, url: raw.url };
    issues.push({ code: 'bad_video', blockId: id });
    return null;
  },
};

export const normalizeBlocks = (
  value: unknown,
  ctx: BlockContext,
): { blocks: AssistantBlock[]; issues: BlockIssue[] } => {
  const issues: BlockIssue[] = [];
  const blocks: AssistantBlock[] = [];
  for (const entry of list(value).slice(0, MAX_BLOCKS)) {
    const raw = asRecord(entry);
    const id = raw ? str(raw.id) : '';
    const convert = raw ? CONVERTERS[str(raw.type)] : undefined;
    if (!raw || !id || !convert) {
      issues.push({ code: 'unknown_block', blockId: id || undefined });
      continue;
    }
    const block = convert(raw, id, ctx, issues);
    if (block) blocks.push(block);
  }
  return { blocks, issues };
};

export const normalizeBreadcrumb = (value: unknown): AssistantBreadcrumbItem[] =>
  list(value)
    .map(asRecord)
    .filter((item): item is Raw => !!item && !!str(item.label))
    .slice(0, 6)
    .map((item) => {
      const clickable = item.current !== true && !!str(item.id) && !!str(item.payload);
      return clickable
        ? { label: str(item.label), current: false, id: str(item.id), payload: str(item.payload) }
        : { label: str(item.label), current: item.current === true };
    });

/** Bilinmeyen `mode` → `text` (README §4.2). */
export const normalizeInput = (value: unknown, fallbackMaxLength: number): AssistantInputState => {
  const raw = asRecord(value);
  const maxlength =
    raw && typeof raw.maxlength === 'number' && raw.maxlength > 0 ? raw.maxlength : fallbackMaxLength;
  return { mode: raw?.mode === 'none' ? 'none' : 'text', placeholder: str(raw?.placeholder), maxlength };
};
