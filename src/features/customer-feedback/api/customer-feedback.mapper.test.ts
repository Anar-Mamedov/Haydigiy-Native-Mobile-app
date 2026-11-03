import fixture from '../__fixtures__/forms-general.json';
import { findFeedbackCategory, mapFeedbackForm } from './customer-feedback.mapper';

describe('mapFeedbackForm', () => {
  it('maps the real forms?context=general response (8 categories, server order)', () => {
    const form = mapFeedbackForm(fixture.data);

    expect(form?.version).toBe(5);
    expect(form?.categories.map((category) => category.key)).toEqual([
      'product_issues',
      'site_issues',
      'order_payment',
      'security_privacy',
      'shipping_delivery',
      'account_membership',
      'suggestion',
      'general_other',
    ]);
    expect(form?.viewer).toBeNull();

    const site = findFeedbackCategory(form, 'site_issues');
    expect(site?.message).toEqual({ mode: 'required', label: 'Sorunun açıklaması', placeholder: 'Ne yapmaya çalışırken ne oldu?' });
    expect(site?.fields.map((field) => `${field.key}:${field.type}:${field.required}`)).toEqual([
      'issue_type:select:true',
      'device:radio:true',
      'recurring:radio:true',
      'page:url:false',
      'attachments:file:false',
    ]);
    const attachments = site?.fields[4];
    expect(attachments?.max).toBe(5);
    expect(attachments?.config.accept).toEqual(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']);
    expect(attachments?.config.maxSizeKb).toBe(5120);
  });

  it('keeps config.autofill only for its own field type (sözleşme v1.1 §1)', () => {
    const form = mapFeedbackForm(fixture.data);
    const autofill = (categoryKey: string, fieldKey: string) =>
      findFeedbackCategory(form, categoryKey)?.fields.find((field) => field.key === fieldKey)?.config.autofill;

    expect(autofill('site_issues', 'page')).toBe('page_url');
    expect(autofill('security_privacy', 'related_link')).toBe('page_url');
    expect(autofill('product_issues', 'product_ref')).toBe('product');
    expect(autofill('order_payment', 'order_no')).toBeUndefined();

    const odd = mapFeedbackForm({
      categories: [
        {
          key: 'a',
          title: 'A',
          fields: [
            { key: 'unknown', type: 'url', config: { autofill: 'referrer' } },
            { key: 'wrong_type', type: 'text', config: { autofill: 'page_url' } },
            { key: 'wrong_type_2', type: 'url', config: { autofill: 'product' } },
          ],
        },
      ],
    });
    // Bilinmeyen ya da tipine uymayan değer yok sayılır, alan normal çizilir (K11).
    expect(odd?.categories[0].fields.map((field) => [field.key, field.config.autofill])).toEqual([
      ['unknown', undefined],
      ['wrong_type', undefined],
      ['wrong_type_2', undefined],
    ]);
  });

  it('skips unknown field types and keyless entries without crashing', () => {
    const form = mapFeedbackForm({
      version: 9,
      categories: [
        { key: 'a', title: 'A', message: { mode: 'weird' }, fields: [{ key: 'x', type: 'signature' }, { type: 'text' }, { key: 'ok', type: 'text' }] },
        { title: 'no key' },
        null,
      ],
      viewer: { full_name: 'Ayşe', phone: '0532', email: 'a@b.co' },
    });

    expect(form?.categories).toHaveLength(1);
    expect(form?.categories[0].fields.map((field) => field.key)).toEqual(['ok']);
    expect(form?.categories[0].message.mode).toBe('optional');
    expect(form?.viewer).toEqual({ fullName: 'Ayşe', phone: '0532', email: 'a@b.co' });
    expect(mapFeedbackForm(null)).toBeNull();
    expect(findFeedbackCategory(form, 'missing')).toBeNull();
  });
});
