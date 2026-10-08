import { resolveDeepLinkPath } from '@/utils/resolve-deep-link';
import { findInfoDocument, INFO_DOCUMENT_SLUGS } from './info-documents';
import { FOOTER_INFO_LINKS, HELP_INFO_LINKS } from './info-page-links';
import { InfoPageSlug, STORE_PICKUP_SLUG } from './info-page.types';
import { infoPageRoute } from '../routes';

const ALL_PAGE_SLUGS: InfoPageSlug[] = [...INFO_DOCUMENT_SLUGS, STORE_PICKUP_SLUG];

describe('info documents registry', () => {
  it.each(INFO_DOCUMENT_SLUGS)('has a titled, non-empty document for %s', (slug) => {
    const document = findInfoDocument(slug);

    expect(document?.slug).toBe(slug);
    expect(document?.title.length).toBeGreaterThan(0);
    expect(document?.blocks.length).toBeGreaterThan(0);
  });

  it('finds documents regardless of letter case', () => {
    expect(findInfoDocument('HAKKIMIZDA')?.title).toBe('Hakkımızda');
  });

  it('returns null for unknown, empty or prototype slugs', () => {
    expect(findInfoDocument(undefined)).toBeNull();
    expect(findInfoDocument('')).toBeNull();
    expect(findInfoDocument('kariyer')).toBeNull();
    expect(findInfoDocument('constructor')).toBeNull();
    expect(findInfoDocument('__proto__')).toBeNull();
  });

  it.each(ALL_PAGE_SLUGS)(
    'opens the web /%s link on the same app route the in-app links use',
    (slug) => {
      // Derin bağlantı eşlemesi ile uygulama içi bağlantılar aynı rotaya gitmeli.
      expect(resolveDeepLinkPath(`https://haydigiy.com/${slug}`)).toBe(infoPageRoute(slug));
    },
  );

  it('only links to pages that exist', () => {
    const known = new Set<string>(ALL_PAGE_SLUGS);

    [...FOOTER_INFO_LINKS, ...HELP_INFO_LINKS].forEach((link) => {
      expect(known.has(link.slug)).toBe(true);
    });
  });

  it('points every in-text link at a page the app can open', () => {
    INFO_DOCUMENT_SLUGS.forEach((slug) => {
      findInfoDocument(slug)?.blocks.forEach((block) => {
        if (block.type !== 'link') return;
        expect(resolveDeepLinkPath(block.href)).not.toBe('/');
      });
    });
  });
});
