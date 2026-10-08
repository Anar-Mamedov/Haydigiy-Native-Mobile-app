import { decodeHtmlEntities, parseBlogContent, sanitizeBlogHref } from './blog-html';

describe('parseBlogContent', () => {
  it('turns headings, paragraphs and inline marks into blocks and drops comments', () => {
    const blocks = parseBlogContent(`
      <!-- Title Tag: Kış -->
      <h1>Kış Rehberi</h1>
      <p>Sonbahar ve <strong>kış</strong> aylarında <em>tarzımızı</em> belirleyen parça.</p>
      <h3>Alt başlık</h3>
    `);

    expect(blocks).toEqual([
      { type: 'heading', level: 2, children: [{ text: 'Kış Rehberi' }] },
      {
        type: 'paragraph',
        children: [
          { text: 'Sonbahar ve ' },
          { text: 'kış', bold: true },
          { text: ' aylarında ' },
          { text: 'tarzımızı', italic: true },
          { text: ' belirleyen parça.' },
        ],
      },
      { type: 'heading', level: 3, children: [{ text: 'Alt başlık' }] },
    ]);
  });

  it('collects list items, keeps bold labels and flattens nested lists', () => {
    const blocks = parseBlogContent(`
      <ul>
        <li><strong>Süet Vizon:</strong> Soft bir seçenek.</li>
        <li>Siyah Süet
          <ul><li>Gece şıklığı</li></ul>
        </li>
      </ul>
      <ol><li>Bir</li><li>İki</li></ol>
    `);

    expect(blocks).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [
          [{ text: 'Süet Vizon:', bold: true }, { text: ' Soft bir seçenek.' }],
          [{ text: 'Siyah Süet' }],
          [{ text: 'Gece şıklığı' }],
        ],
      },
      { type: 'list', ordered: true, items: [[{ text: 'Bir' }], [{ text: 'İki' }]] },
    ]);
  });

  it('removes script/style/iframe content and unsafe links but keeps their text', () => {
    const blocks = parseBlogContent(
      '<p>Merhaba<script>alert("x")</script><style>p{}</style><iframe src="https://x"></iframe> ' +
        '<a href="javascript:alert(1)">tıkla</a> ve <a href="https://haydigiy.com/elbise-1">elbise</a></p>',
    );

    expect(blocks).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'Merhaba tıkla ve ' },
          { text: 'elbise', href: 'https://haydigiy.com/elbise-1' },
        ],
      },
    ]);
  });

  it('keeps only http(s) images and decodes entities and line breaks', () => {
    const blocks = parseBlogContent(
      '<p>Fiyat &amp; kalite&nbsp;&#39;bir arada&#x27;<br/>ikinci satır</p>' +
        '<img src="https://cdn.haydigiy.com/a.webp" alt="Kazak &amp; etek">' +
        '<img src="data:image/png;base64,AAA" alt="gizli">' +
        '<blockquote>Stil bir dildir.</blockquote>',
    );

    expect(blocks).toEqual([
      { type: 'paragraph', children: [{ text: "Fiyat & kalite 'bir arada'\nikinci satır" }] },
      { type: 'image', src: 'https://cdn.haydigiy.com/a.webp', alt: 'Kazak & etek' },
      { type: 'quote', children: [{ text: 'Stil bir dildir.' }] },
    ]);
  });

  it('splits plain text content into paragraphs like the web', () => {
    expect(parseBlogContent('İlk paragraf\nsatır devamı\n\n\nİkinci paragraf')).toEqual([
      { type: 'paragraph', children: [{ text: 'İlk paragraf satır devamı' }] },
      { type: 'paragraph', children: [{ text: 'İkinci paragraf' }] },
    ]);
  });

  it('returns no blocks for empty content', () => {
    expect(parseBlogContent('')).toEqual([]);
    expect(parseBlogContent(null)).toEqual([]);
    expect(parseBlogContent('<p>   </p>')).toEqual([]);
  });
});

describe('sanitizeBlogHref', () => {
  it.each([
    ['https://haydigiy.com/x', 'https://haydigiy.com/x'],
    ['/blog/kategori/kombin', '/blog/kategori/kombin'],
    ['mailto:info@haydigiy.com', 'mailto:info@haydigiy.com'],
    ['javascript:alert(1)', undefined],
    ['//evil.example.com', undefined],
    ['#bolum', undefined],
    ['', undefined],
  ])('maps %s to %s', (input, expected) => {
    expect(sanitizeBlogHref(input)).toBe(expected);
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes named and numeric references and leaves unknown ones', () => {
    expect(decodeHtmlEntities('&lt;b&gt; &quot;x&quot; &#8220;y&#8221; &unknown;')).toBe('<b> "x" “y” &unknown;');
  });
});
