import { parseRolloutPercent } from '@/lib/env';
import { createBucket, isInRollout, parseBucket } from './customer-feedback-rollout';

describe('customer_feedback_v2 rollout', () => {
  it('validates the env percent (bad values fall back to 0 = off)', () => {
    expect(parseRolloutPercent('25')).toBe(25);
    expect(parseRolloutPercent('100')).toBe(100);
    for (const raw of [undefined, '', '-5', '101', '5.5', 'abc']) expect(parseRolloutPercent(raw)).toBe(0);
  });

  it('puts each install in a stable 0–99 bucket', () => {
    expect(createBucket(() => 0)).toBe(0);
    expect(createBucket(() => 0.999999)).toBe(99);
    expect(parseBucket('42')).toBe(42);
    expect(parseBucket('100')).toBeNull();
    expect(parseBucket(null)).toBeNull();
  });

  it('opens the new form only below the percentage', () => {
    expect(isInRollout(null, 0)).toBe(false);
    expect(isInRollout(null, 100)).toBe(true);
    expect(isInRollout(4, 5)).toBe(true);
    expect(isInRollout(5, 5)).toBe(false);
    expect(isInRollout(null, 25)).toBe(false);
  });
});
