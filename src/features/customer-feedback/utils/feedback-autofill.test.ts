import fixture from '../__fixtures__/forms-general.json';
import { findFeedbackCategory, mapFeedbackForm } from '../api/customer-feedback.mapper';
import { hasKnownProduct, visibleFeedbackCategory } from './feedback-autofill';

const form = mapFeedbackForm(fixture.data);
const productIssues = findFeedbackCategory(form, 'product_issues');
const site = findFeedbackCategory(form, 'site_issues');

describe('visibleFeedbackCategory (sözleşme v1.1 §1)', () => {
  it('drops the product question when the product is known (product screen)', () => {
    expect(visibleFeedbackCategory(productIssues, 42)?.fields.map((field) => field.key)).toEqual(['issue_type', 'attachments']);
  });

  it('asks the product question everywhere else', () => {
    expect(visibleFeedbackCategory(productIssues, null)?.fields.map((field) => field.key)).toEqual(['issue_type', 'product_ref', 'attachments']);
    expect(visibleFeedbackCategory(productIssues, undefined)).toBe(productIssues);
    expect(visibleFeedbackCategory(productIssues, 0)).toBe(productIssues);
  });

  it('leaves categories without a product question untouched (the page field stays)', () => {
    expect(visibleFeedbackCategory(site, 42)).toBe(site);
    expect(visibleFeedbackCategory(null, 42)).toBeNull();
  });

  it('treats only positive safe integers as a known product', () => {
    expect(hasKnownProduct(7)).toBe(true);
    expect(hasKnownProduct(-1)).toBe(false);
    expect(hasKnownProduct(1.5)).toBe(false);
    expect(hasKnownProduct(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(hasKnownProduct(null)).toBe(false);
  });
});
