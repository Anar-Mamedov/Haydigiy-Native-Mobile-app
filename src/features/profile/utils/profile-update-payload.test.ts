import type { UserInfoFormData } from '../schemas/user-info.schema';
import {
  buildProfileUpdatePayload,
  isProfilePhoneRequired,
  isSameProfilePhone,
} from './profile-update-payload';

const formData: UserInfoFormData = {
  name: ' Anar ',
  surname: ' Mamedov ',
  email: ' anar@example.com ',
  phone: '',
  gender: 'male',
  day: '8',
  month: '5',
  year: '1990',
};

describe('isProfilePhoneRequired', () => {
  it('keeps a number that is already on the account from being cleared', () => {
    expect(isProfilePhoneRequired({ phone: '5551234567' })).toBe(true);
  });

  it('leaves an account without a number free to keep it empty', () => {
    expect(isProfilePhoneRequired({ phone: null })).toBe(false);
    expect(isProfilePhoneRequired({ phone: '' })).toBe(false);
    expect(isProfilePhoneRequired({ phone: '   ' })).toBe(false);
  });
});

describe('isSameProfilePhone', () => {
  it('ignores the formatting differences the backend ignores', () => {
    expect(isSameProfilePhone('+90 555 123 45 67', '5551234567')).toBe(true);
    expect(isSameProfilePhone('05551234567', '555 123 45 67')).toBe(true);
  });

  it('detects a different number', () => {
    expect(isSameProfilePhone('5551234567', '5321234567')).toBe(false);
    expect(isSameProfilePhone(null, '5321234567')).toBe(false);
  });
});

describe('buildProfileUpdatePayload', () => {
  it('asks for the v2 contract and trims the text fields', () => {
    expect(buildProfileUpdatePayload(formData, { email: null, phone: null })).toEqual({
      version: 'v2',
      name: 'Anar',
      surname: 'Mamedov',
      email: 'anar@example.com',
      phone: null,
      birth_date: '1990-05-08',
      gender: 'male',
    });
  });

  it('sends an unchanged saved number back exactly as the API returned it', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, phone: '5551234567' },
      { email: null, phone: '+90 555 123 45 67' },
    );

    expect(payload.phone).toBe('+90 555 123 45 67');
  });

  it('sends the digits of a changed number so the backend asks for a code', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, phone: '532 123 45 67' },
      { email: null, phone: '05551234567' },
    );

    expect(payload.phone).toBe('5321234567');
  });

  it('sends the digits of a number added to an account without one', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, phone: '532 123 45 67' },
      { email: null, phone: null },
    );

    expect(payload.phone).toBe('5321234567');
  });

  it('sends null for the optional fields left empty', () => {
    const payload = buildProfileUpdatePayload(
      { ...formData, day: '', gender: '' },
      { email: null, phone: null },
    );

    expect(payload.birth_date).toBeNull();
    expect(payload.gender).toBeNull();
  });

  describe('e-mail (optional like on the web)', () => {
    it('leaves the key out for an account without an e-mail', () => {
      // Regression: the API turns "" into null and its e-mail rule rejects null, so
      // sending an empty e-mail made the whole save fail for phone accounts.
      const payload = buildProfileUpdatePayload(
        { ...formData, email: '  ' },
        { email: null, phone: '5551234567' },
      );

      expect(payload).not.toHaveProperty('email');
    });

    it('keeps the saved address when the field is left empty, as the web does', () => {
      const payload = buildProfileUpdatePayload(
        { ...formData, email: '' },
        { email: 'kayitli@example.com', phone: '5551234567' },
      );

      expect(payload.email).toBe('kayitli@example.com');
    });

    it('sends a typed address', () => {
      const payload = buildProfileUpdatePayload(
        { ...formData, email: ' yeni@example.com ' },
        { email: null, phone: '5551234567' },
      );

      expect(payload.email).toBe('yeni@example.com');
    });
  });
});
