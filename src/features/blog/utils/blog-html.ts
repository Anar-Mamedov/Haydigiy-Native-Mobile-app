import { BlogContentBlock, BlogHeadingLevel, BlogInline } from '../types/blog.types';

/**
 * Blog yazısının HTML içeriğini yerel olarak çizilebilecek bloklara çevirir.
 *
 * Web içeriği `dangerouslySetInnerHTML` ile basıyor; uygulamada WebView yerine
 * metin, başlık, liste, alıntı ve görsel bloklarına indirgenir. Betik/stil/iframe
 * gibi etiketlerin içeriği tamamen atılır, bağlantılar ve görseller yalnızca güvenli
 * şemalarla (`http(s)`, uygulama içi `/yol`, `mailto:`, `tel:`) geçer. Böylece
 * backend'den ne gelirse gelsin çalıştırılabilir içerik ekrana ulaşmaz.
 */

const TOKEN_PATTERN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|[^<]+|</g;
const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
const HTML_TAG_PATTERN = /<([a-z][\w-]*)(?:\s[^>]*)?>/i;

/** İçeriği hiç gösterilmeyecek etiketler. */
const SKIPPED_TAGS = new Set([
  'audio',
  'button',
  'canvas',
  'embed',
  'form',
  'head',
  'iframe',
  'noscript',
  'object',
  'script',
  'select',
  'style',
  'svg',
  'template',
  'textarea',
  'video',
]);

/** Yeni paragraf başlatan kapsayıcılar. */
const BLOCK_TAGS = new Set([
  'article',
  'aside',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'header',
  'main',
  'p',
  'pre',
  'section',
  'table',
  'tbody',
  'tfoot',
  'thead',
  'tr',
]);

const HEADING_LEVELS: Record<string, BlogHeadingLevel> = {
  h1: 2,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 4,
  h6: 4,
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  bull: '•',
  copy: '©',
  deg: '°',
  euro: '€',
  gt: '>',
  hellip: '…',
  laquo: '«',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  middot: '·',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  raquo: '»',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  times: '×',
  trade: '™',
};

/** `&amp;`, `&#39;`, `&#x27;` gibi karakter referanslarını çözer; bilinmeyenleri olduğu gibi bırakır. */
export function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const code = isHex ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      const valid = Number.isInteger(code) && code > 0 && code <= 0x10ffff && (code < 0xd800 || code > 0xdfff);
      return valid ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function readAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  for (const match of raw.matchAll(ATTRIBUTE_PATTERN)) {
    attributes[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
  }
  return attributes;
}

/** Bağlantı hedefini yalnızca güvenli şemalarla kabul eder; `javascript:` vb. düşer. */
export function sanitizeBlogHref(raw: string | undefined): string | undefined {
  const value = decodeHtmlEntities(raw ?? '').trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  if (/^(mailto|tel):/i.test(value)) return value;
  return undefined;
}

function sanitizeImageSource(raw: string | undefined): string | null {
  const value = decodeHtmlEntities(raw ?? '').trim();
  return /^https?:\/\//i.test(value) ? value : null;
}

function sameMarks(a: BlogInline, b: BlogInline): boolean {
  return a.bold === b.bold && a.italic === b.italic && a.href === b.href;
}

/**
 * Parçaları birleştirir ve HTML'in boşluk kurallarını uygular: ardışık boşluklar
 * tek boşluğa iner, satır sonu çevresindeki boşluklar ve uçlardaki boşluklar atılır.
 */
function normalizeRuns(runs: BlogInline[]): BlogInline[] {
  const merged: BlogInline[] = [];

  for (const run of runs) {
    const previous = merged[merged.length - 1];
    let text = run.text;
    if (!previous || /[ \n]$/.test(previous.text)) text = text.replace(/^ +/, '');
    if (!text) continue;

    if (previous && sameMarks(previous, run)) {
      previous.text += text;
    } else {
      merged.push({ ...run, text });
    }
  }

  const cleaned = merged
    .map((run) => ({ ...run, text: run.text.replace(/ *\n */g, '\n') }))
    .filter((run) => run.text.length > 0);

  while (cleaned.length > 0) {
    cleaned[0].text = cleaned[0].text.replace(/^\s+/, '');
    if (cleaned[0].text) break;
    cleaned.shift();
  }
  while (cleaned.length > 0) {
    const last = cleaned[cleaned.length - 1];
    last.text = last.text.replace(/\s+$/, '');
    if (last.text) break;
    cleaned.pop();
  }

  return cleaned;
}

type OpenList = { ordered: boolean; items: BlogInline[][] };

function parseHtml(html: string): BlogContentBlock[] {
  const blocks: BlogContentBlock[] = [];
  const lists: OpenList[] = [];
  const hrefs: (string | undefined)[] = [];
  let runs: BlogInline[] = [];
  let headingLevel: BlogHeadingLevel | null = null;
  let quoteDepth = 0;
  let listItemOpen = false;
  let boldDepth = 0;
  let italicDepth = 0;
  let skippedTag: string | null = null;
  let skippedDepth = 0;

  const pushText = (text: string) => {
    const run: BlogInline = { text };
    if (boldDepth > 0) run.bold = true;
    if (italicDepth > 0) run.italic = true;
    const href = hrefs[hrefs.length - 1];
    if (href) run.href = href;
    runs.push(run);
  };

  const flush = () => {
    const children = normalizeRuns(runs);
    runs = [];
    if (children.length === 0) return;

    const list = lists[lists.length - 1];
    if (headingLevel) {
      blocks.push({ type: 'heading', level: headingLevel, children });
    } else if (listItemOpen && list) {
      list.items.push(children);
    } else if (quoteDepth > 0) {
      blocks.push({ type: 'quote', children });
    } else {
      blocks.push({ type: 'paragraph', children });
    }
  };

  const closeList = () => {
    flush();
    const list = lists.pop();
    listItemOpen = lists.length > 0;
    if (!list || list.items.length === 0) return;

    const parent = lists[lists.length - 1];
    // İç içe listeler tek seviyeye indirilir; maddeler üst listede sırayla kalır.
    if (parent) parent.items.push(...list.items);
    else blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
  };

  for (const match of html.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const tagName = match[2]?.toLowerCase();

    if (token.startsWith('<!--')) continue;

    if (skippedTag) {
      if (tagName === skippedTag) skippedDepth += match[1] ? -1 : 1;
      if (skippedDepth <= 0) skippedTag = null;
      continue;
    }

    if (!tagName) {
      const text = decodeHtmlEntities(token).replace(/\s+/g, ' ');
      if (text) pushText(text);
      continue;
    }

    const isClosing = match[1] === '/';
    const selfClosing = /\/\s*$/.test(match[3] ?? '');

    if (SKIPPED_TAGS.has(tagName)) {
      if (!isClosing && !selfClosing) {
        skippedTag = tagName;
        skippedDepth = 1;
      }
      continue;
    }

    if (HEADING_LEVELS[tagName]) {
      flush();
      headingLevel = isClosing ? null : HEADING_LEVELS[tagName];
      continue;
    }

    switch (tagName) {
      case 'br':
        pushText('\n');
        break;
      case 'hr':
        flush();
        break;
      case 'img': {
        flush();
        const attributes = readAttributes(match[3] ?? '');
        const src = sanitizeImageSource(attributes.src);
        if (src) {
          blocks.push({ type: 'image', src, alt: decodeHtmlEntities(attributes.alt ?? '').trim() });
        }
        break;
      }
      case 'strong':
      case 'b':
        boldDepth = Math.max(0, boldDepth + (isClosing ? -1 : 1));
        break;
      case 'em':
      case 'i':
        italicDepth = Math.max(0, italicDepth + (isClosing ? -1 : 1));
        break;
      case 'a':
        if (isClosing) hrefs.pop();
        else hrefs.push(sanitizeBlogHref(readAttributes(match[3] ?? '').href));
        break;
      case 'blockquote':
        flush();
        quoteDepth = Math.max(0, quoteDepth + (isClosing ? -1 : 1));
        break;
      case 'ul':
      case 'ol':
        if (isClosing) {
          closeList();
        } else {
          flush();
          lists.push({ ordered: tagName === 'ol', items: [] });
          listItemOpen = false;
        }
        break;
      case 'li':
        flush();
        listItemOpen = !isClosing && lists.length > 0;
        break;
      case 'td':
      case 'th':
        // Tablolar satır satır okunur; hücreler arasına ayraç konur.
        if (!isClosing && runs.some((run) => run.text.trim())) pushText(' · ');
        break;
      default:
        if (BLOCK_TAGS.has(tagName)) flush();
        // Diğer satır içi etiketler (span, u, small ...) yalnızca metnini bırakır.
        break;
    }
  }

  flush();
  while (lists.length > 0) closeList();

  return blocks;
}

function parsePlainText(content: string): BlogContentBlock[] {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text): BlogContentBlock => ({ type: 'paragraph', children: [{ text }] }));
}

/** HTML ise etiketleri ayrıştırır, düz metinse web gibi boş satırlardan paragraflara böler. */
export function parseBlogContent(content: string | null | undefined): BlogContentBlock[] {
  if (!content?.trim()) return [];
  return HTML_TAG_PATTERN.test(content) ? parseHtml(content) : parsePlainText(content);
}

/** Bir bloğun düz metni; başlık karşılaştırması ve erişilebilirlik için. */
export function blogInlineText(children: BlogInline[]): string {
  return children.map((child) => child.text).join('');
}
