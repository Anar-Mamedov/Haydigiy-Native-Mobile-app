import fixture from '../__fixtures__/forms-general.json';
import { findFeedbackCategory, mapFeedbackForm } from '../api/customer-feedback.mapper';
import { buildFeedbackPayload, pruneValuesToCategory } from './feedback-payload';

const form = mapFeedbackForm(fixture.data);
const site = findFeedbackCategory(form, 'site_issues')!;

describe('buildFeedbackPayload (sözleşme v1.0 §5.3, §6.3)', () => {
  it('builds the documented body: answers in field order, tokens separate, honeypot empty', () => {
    const payload = buildFeedbackPayload({
      category: site,
      values: {
        answers: { issue_type: 'button_broken', device: 'phone', recurring: 'yes', unknown: 'x' },
        message: '  Sepete ekle butonu donuyor.  ',
        full_name: ' Ayşe Yılmaz ',
        email: '',
        phone: '0532 123 45 67',
      },
      attachments: [
        { fieldKey: 'attachments', token: 't1' },
        { fieldKey: 'attachments', token: 't2' },
      ],
      platform: 'ios',
      productId: 42,
    });

    expect(payload).toEqual({
      context: 'general',
      category_key: 'site_issues',
      message: 'Sepete ekle butonu donuyor.',
      answers: [
        { field_key: 'issue_type', instance_index: 0, value: 'button_broken' },
        { field_key: 'device', instance_index: 0, value: 'phone' },
        { field_key: 'recurring', instance_index: 0, value: 'yes' },
      ],
      attachment_tokens: [
        { field_key: 'attachments', instance_index: 0, token: 't1' },
        { field_key: 'attachments', instance_index: 1, token: 't2' },
      ],
      platform: 'ios',
      product_id: 42,
      full_name: 'Ayşe Yılmaz',
      phone: '0532 123 45 67',
      website: '',
    });
  });

  it('sends checkbox choices as consecutive rows, numbers as numbers and drops a hidden message', () => {
    const payload = buildFeedbackPayload({
      category: {
        key: 'c',
        title: 'C',
        description: null,
        message: { mode: 'hidden', label: '', placeholder: '' },
        fields: [
          { key: 'tags', type: 'checkbox', label: 'T', required: false, multiple: true, min: null, max: null, config: { options: [], accept: [] } },
          { key: 'n', type: 'number', label: 'N', required: false, multiple: false, min: null, max: null, config: { options: [], accept: [] } },
          { key: 'r', type: 'rating', label: 'R', required: false, multiple: false, min: null, max: null, config: { options: [], accept: [] } },
          { key: 'empty', type: 'text', label: 'E', required: false, multiple: false, min: null, max: null, config: { options: [], accept: [] } },
        ],
      },
      values: { answers: { tags: ['x', 'y'], n: '2,5', r: '4', empty: ' ' }, message: 'gizli', full_name: '', email: '', phone: '' },
      attachments: [],
      platform: 'android',
      productId: null,
    });

    expect(payload.answers).toEqual([
      { field_key: 'tags', instance_index: 0, value: 'x' },
      { field_key: 'tags', instance_index: 1, value: 'y' },
      { field_key: 'n', instance_index: 0, value: 2.5 },
      { field_key: 'r', instance_index: 0, value: 4 },
    ]);
    expect(payload).not.toHaveProperty('message');
    expect(payload).not.toHaveProperty('product_id');
  });

  it('keeps only answers whose fields still exist after the form was updated', () => {
    const pruned = pruneValuesToCategory(
      { answers: { device: 'phone', removed: 'x' }, message: 'm', full_name: '', email: '', phone: '' },
      site,
    );
    expect(pruned.answers).toEqual({ device: 'phone' });
    expect(pruned.message).toBe('m');
  });
});
