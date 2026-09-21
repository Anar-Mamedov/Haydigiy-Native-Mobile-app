import {
  isAccountDeletionCodeSent,
  isAccountDeletionCompleted,
} from './account-deletion-result';

describe('account deletion result', () => {
  it('treats a v2 code-sent response as not completed', () => {
    const result = { code_sent: true, verification_required: true };

    expect(isAccountDeletionCodeSent(result)).toBe(true);
    expect(isAccountDeletionCompleted(result)).toBe(false);
  });

  it('treats a v1 / legacy response as completed', () => {
    expect(isAccountDeletionCompleted({ success: true, user_id: 1 })).toBe(true);
    expect(isAccountDeletionCompleted({})).toBe(true);
    expect(isAccountDeletionCompleted(undefined)).toBe(true);
  });

  it('does not sign the user out when the backend reports a failure', () => {
    const result = { message: 'Hesap silinemedi.', success: false };

    expect(isAccountDeletionCompleted(result)).toBe(false);
    expect(isAccountDeletionCodeSent(result)).toBe(false);
  });

  it('never reads a verified v2 response as still pending', () => {
    const result = { message: 'Hesabınız silindi.', success: true, verification_required: false };

    expect(isAccountDeletionCodeSent(result)).toBe(false);
    expect(isAccountDeletionCompleted(result)).toBe(true);
  });
});
