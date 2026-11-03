import type { FeedbackCategory, FeedbackField, FeedbackFormValues } from '@/types/customer-feedback.types';
import { collectFeedbackIssues, isValidDate, validateFieldValue, validateMessage } from './feedback-validation';

const field = (overrides: Partial<FeedbackField> & Pick<FeedbackField, 'type'>): FeedbackField => ({
  key: 'f',
  label: 'Alan',
  required: false,
  multiple: false,
  min: null,
  max: null,
  config: { options: [], accept: [] },
  ...overrides,
});

const values = (overrides: Partial<FeedbackFormValues> = {}): FeedbackFormValues => ({
  answers: {},
  message: '',
  full_name: '',
  email: '',
  phone: '',
  ...overrides,
});

describe('feedback validation (yalnız UX, son söz sunucuda)', () => {
  it('flags only required empty fields', () => {
    expect(validateFieldValue(field({ type: 'text', required: true }), '  ')).toBe('Bu alan zorunlu.');
    expect(validateFieldValue(field({ type: 'text' }), '')).toBeNull();
    expect(validateFieldValue(field({ type: 'file', required: true }), undefined)).toBeNull();
  });

  it('checks formats of filled fields', () => {
    expect(validateFieldValue(field({ type: 'email' }), 'a@b')).toBe('Geçerli bir e-posta girin.');
    expect(validateFieldValue(field({ type: 'tel' }), '0532 123 45 67')).toBeNull();
    expect(validateFieldValue(field({ type: 'tel' }), '12-34')).toBe('Geçerli bir telefon numarası girin.');
    expect(validateFieldValue(field({ type: 'url' }), 'javascript:alert(1)')).toBe('Adres https:// ile başlamalı.');
    expect(validateFieldValue(field({ type: 'url' }), 'https://haydigiy.com/x')).toBeNull();
    expect(validateFieldValue(field({ type: 'number', config: { options: [], accept: [], min: 1, max: 3 } }), '4')).toBe('En çok 3 olmalı.');
    expect(validateFieldValue(field({ type: 'text', config: { options: [], accept: [], maxLength: 3 } }), 'abcd')).toBe('En çok 3 karakter yazabilirsiniz.');
    expect(validateFieldValue(field({ type: 'rating', config: { options: [], accept: [], max: 5 } }), '6')).toBe('Bu alan zorunlu.');
  });

  it('validates real calendar dates only', () => {
    expect(isValidDate('2026-02-28')).toBe(true);
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('28.02.2026')).toBe(false);
  });

  it('applies checkbox min/max and rejects unknown options', () => {
    const options = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];
    const checkbox = field({ type: 'checkbox', min: 1, max: 1, config: { options, accept: [] } });
    expect(validateFieldValue(checkbox, ['a', 'b'])).toBe('En çok 1 seçim yapabilirsiniz.');
    expect(validateFieldValue(checkbox, ['a'])).toBeNull();
    expect(validateFieldValue(field({ type: 'select', config: { options, accept: [] } }), 'zzz')).toBe('Bu alan zorunlu.');
  });

  it('follows the three message modes', () => {
    expect(validateMessage('', 'required')).toBe('Bu alan zorunlu.');
    expect(validateMessage('', 'optional')).toBeNull();
    expect(validateMessage('x'.repeat(6000), 'hidden')).toBeNull();
    expect(validateMessage('x'.repeat(5001), 'optional')).toBe('En çok 5000 karakter yazabilirsiniz.');
  });

  it('collects issues with the server error keys', () => {
    const category: FeedbackCategory = {
      key: 'site_issues',
      title: 'Site',
      description: null,
      message: { mode: 'required', label: 'Açıklama', placeholder: '' },
      fields: [field({ key: 'device', type: 'radio', required: true, config: { options: [{ value: 'phone', label: 'Telefon' }], accept: [] } })],
    };

    expect(collectFeedbackIssues(category, values({ email: 'x' }))).toEqual({
      'answers.device': 'Bu alan zorunlu.',
      message: 'Bu alan zorunlu.',
      email: 'Geçerli bir e-posta girin.',
    });
    expect(collectFeedbackIssues(category, values({ answers: { device: 'phone' }, message: 'Bozuk' }))).toEqual({});
  });
});
