import { feedbackSchema } from './feedback.schema';

describe('feedbackSchema', () => {
  it('rejects empty or whitespace-only feedback with the web message', () => {
    for (const message of ['', '   \n  ']) {
      const result = feedbackSchema.safeParse({ message });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe('Lütfen geri bildiriminizi yazın.');
    }
  });

  it('trims the submitted feedback', () => {
    expect(feedbackSchema.parse({ message: '  Kargo hızlıydı.  ' })).toEqual({ message: 'Kargo hızlıydı.' });
  });
});
