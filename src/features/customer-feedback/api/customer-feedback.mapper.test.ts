import fixture from '../__fixtures__/forms-general.json';
import { findFeedbackCategory, mapFeedbackForm } from './customer-feedback.mapper';

describe('mapFeedbackForm', () => {
  it('maps the real forms?context=general response (8 categories, server order)', () => {
    const form = mapFeedbackForm(fixture.data);

    expect(form?.version).toBe(3);
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
      'attachments:file:false',
    ]);
    const attachments = site?.fields[3];
    expect(attachments?.max).toBe(5);
    expect(attachments?.config.accept).toEqual(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime']);
    expect(attachments?.config.maxSizeKb).toBe(5120);
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
