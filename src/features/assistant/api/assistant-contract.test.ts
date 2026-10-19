import { ASSISTANT_FIXTURE_FLOWS, ASSISTANT_URL_CONTRACT } from '../__fixtures__';
import { isSafeImageUrl, isSafeRelativeHref, isSafeVideoUrl } from '../utils/assistant-links';
import { normalizeBlocks, normalizeBreadcrumb, normalizeInput } from './assistant-blocks.mapper';
import { parseAssistantConfig } from './assistant-config.mapper';

/**
 * Haydi Asistan sözleşme testleri (teslim paketi 1.1, README §12). `__fixtures__` backend'in GERÇEK
 * API cevaplarından ürettiği dosyalardır (connect PHPUnit'i de aynılarına karşı çalışır); web
 * (frontend/tests/assistant-contract.test.mjs) ile aynı kurallar uygulanır.
 */
const flowNames = Object.keys(ASSISTANT_FIXTURE_FLOWS);

const CTX = {
  imageHosts: ['cdn.haydigiy.com', 'cdn.haydigiytr.com'],
  videoHosts: ['cdn.haydigiy.com', 'cdn.haydigiytr.com'],
  fallbackWhatsappHref: 'https://wa.me/905327805100',
};

type Pair = { desktop: string; mobile: string };

describe('Haydi Asistan sözleşmesi', () => {
  it('url-contract.json: geçerli adresler geçer, ret örnekleri reddedilir', () => {
    const contract = ASSISTANT_URL_CONTRACT;
    const valid = [...Object.values(contract.links), ...Object.values(contract.parameterized)] as Pair[];
    valid.forEach((pair) => {
      expect(isSafeRelativeHref(pair.desktop)).toBe(true);
      expect(isSafeRelativeHref(pair.mobile)).toBe(true);
    });
    (contract.rejected as string[]).forEach((href) => expect(isSafeRelativeHref(href)).toBe(false));
  });

  it.each(flowNames)('%s: her adım çökmeden eşlenir, bilinen blok kaybolmaz', (name: string) => {
    const flow = ASSISTANT_FIXTURE_FLOWS[name];
    flow.steps.forEach((step: { response: { body?: Record<string, any> | null } }) => {
      const body = step.response.body ?? {};
      const groups = [
        body.blocks,
        body.resume?.blocks,
        ...(body.messages ?? []).map((m: any) => m.blocks),
      ].filter(Array.isArray);
      groups.forEach((raw: unknown[]) => {
        const result = normalizeBlocks(raw, CTX);
        expect(result.issues).toEqual([]);
        expect(result.blocks).toHaveLength(raw.length);
      });
    });
  });

  it('bilinmeyen blok atlanır, metin HTML olarak yorumlanmaz, sınır aşımı kırpılır', () => {
    const xss = '<img src=x onerror=alert(1)><script>alert(1)</script>';
    const items = Array.from({ length: 20 }, (_, index) => ({
      id: `i${index}`,
      label: xss,
      payload: `p${index}`,
      style: 'x',
    }));
    const result = normalizeBlocks(
      [
        { type: 'product_card', id: 'b1' },
        { type: 'text', id: 'b2', text: xss, extra: true },
        { type: 'buttons', id: 'b3', layout: 'grid', items },
      ],
      CTX,
    );
    expect(result.issues).toEqual([{ code: 'unknown_block', blockId: 'b1' }]);
    expect(result.blocks[0]).toMatchObject({ type: 'text', text: xss });
    expect(result.blocks[1]).toMatchObject({ type: 'buttons', layout: 'list' });
    expect(result.blocks[1].type === 'buttons' && result.blocks[1].items).toHaveLength(12);
  });

  it('desen dışı bağlantı/görsel/video çizilmez ve client_error kodu üretir', () => {
    const result = normalizeBlocks(
      [
        {
          type: 'link_button',
          id: 'l1',
          label: 'Git',
          kind: 'giris',
          open: 'same',
          href: { desktop: '/a', mobile: '//evil.com' },
        },
        { type: 'image', id: 'i1', url: 'https://evil.com/a.png', alt: '' },
        { type: 'video', id: 'v1', url: 'https://cdn.haydigiy.com/v.mp4?x=1' },
      ],
      CTX,
    );
    expect(result.blocks).toEqual([]);
    expect(result.issues.map((issue) => issue.code)).toEqual(['bad_href', 'bad_image', 'bad_video']);
    expect(isSafeImageUrl('https://cdn.haydigiytr.com/x/a.WEBP', CTX.imageHosts)).toBe(true);
    expect(isSafeVideoUrl('https://cdn.haydigiy.com/x/a.webm', CTX.videoHosts)).toBe(true);
  });

  it('wa.me deseni bozuksa yedek Canlı Destek adresi kullanılır', () => {
    const [block] = normalizeBlocks(
      [
        {
          type: 'live_support',
          id: 'l',
          hint: '',
          label: 'Canlı',
          href: 'javascript:x',
          number: '1',
          number_label: '',
          copy_text: '',
        },
      ],
      CTX,
    ).blocks;
    expect(block).toMatchObject({ href: CTX.fallbackWhatsappHref });
  });

  it('konum yolu ve giriş kutusu modu', () => {
    const crumbs = normalizeBreadcrumb([
      { label: 'Ana menü', current: false, id: 'nav.home', payload: 'p1' },
      { label: 'Konu', current: true, id: 'x', payload: 'y' },
    ]);
    expect(crumbs[1]).toEqual({ label: 'Konu', current: true });
    expect(normalizeInput({ mode: 'voice', placeholder: '', maxlength: 500 }, 500).mode).toBe('text');
    expect(normalizeInput({ mode: 'none', placeholder: '', maxlength: 500 }, 500).mode).toBe('none');
  });

  it('/config: kapalı, desteklenmeyen şema ve eski istemci gizlenir; eksik yazı yedeğe düşer', () => {
    const [enabled, disabled] = ASSISTANT_FIXTURE_FLOWS.config.steps.map((step) => step.response.body);
    expect(parseAssistantConfig(enabled).enabled).toBe(true);
    expect(parseAssistantConfig(disabled).enabled).toBe(false);
    expect(parseAssistantConfig({ ...enabled, schema_version: 2 }).enabled).toBe(false);
    expect(parseAssistantConfig({ ...enabled, widget_min_version: '9.0.0' }).enabled).toBe(false);
    const parsed = parseAssistantConfig({ ...enabled, texts: { title: 'Özel' } });
    expect(parsed.texts.title).toBe('Özel');
    expect(parsed.texts.retry).toBe('Tekrar dene');
  });
});
