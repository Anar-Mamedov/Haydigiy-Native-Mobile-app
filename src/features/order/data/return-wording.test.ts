import { AgreementSection, MESAFELI_CLOSING, MESAFELI_INTRO, ONBILGI_SECTIONS } from './agreement-content';
import { CANCELLATION_RETURN } from '@/features/info-pages/data/cancellation-return';
import { RETURN_CONDITION_HIGHLIGHTS } from './return-policy-content';

function textsOf(sections: AgreementSection[]): string[] {
  return sections.flatMap((section) => [
    section.heading ?? '',
    ...(section.paragraphs ?? []),
    ...(section.bullets ?? []),
    ...(section.definitions ?? []).map((definition) => definition.desc),
  ]);
}

const ALL_RETURN_TEXTS = [
  ...textsOf(MESAFELI_INTRO),
  ...textsOf(MESAFELI_CLOSING),
  ...textsOf(ONBILGI_SECTIONS),
  ...CANCELLATION_RETURN.map((block) => ('term' in block ? `${block.term} ${block.text}` : block.text)),
  ...RETURN_CONDITION_HIGHLIGHTS,
];

// Web 18c98462e: iade artık "ücretsiz" değil; her siparişin yalnızca ilk iadesinin
// kargo ücreti satıcıdan, sonrakiler müşteriden.
describe('return wording (web parity)', () => {
  it('no longer promises a free return anywhere', () => {
    ALL_RETURN_TEXTS.forEach((text) => {
      expect(text).not.toMatch(/ücretsiz/i);
    });
  });

  it('states the first-return-only shipping rule in the contract and pre-information form', () => {
    expect(textsOf(MESAFELI_CLOSING)).toContain(
      'İade kargo ücreti alıcıya aittir. Her sipariş için ilk iade talebinde kargo ücreti Satıcı tarafından karşılanır; aynı siparişe ilişkin ikinci ve sonraki iade taleplerinde gönderi karşı ödemeli yapılır ve kargo ücreti iade edilecek tutardan düşülür.',
    );
    expect(textsOf(ONBILGI_SECTIONS)).toContain(
      'Her sipariş için ilk iadenin kargo ücreti Satıcı tarafından karşılanır; ikinci ve sonraki iadelerde kargo ücreti müşteriye aittir.',
    );
  });
});
