import { getProfileCompletion } from './profile-completion';

const FULL_PROFILE = {
  name: 'Ayşe',
  surname: 'Yılmaz',
  email: 'ayse@example.com',
  phone: '5321234567',
  birthDate: '1990-05-12',
  gender: 'female',
  emailVerified: true,
};

describe('getProfileCompletion', () => {
  it('is 100% when every field is filled and the e-mail is verified', () => {
    expect(getProfileCompletion(FULL_PROFILE)).toEqual({ percent: 100, missingLabels: [], isComplete: true });
  });

  it('is 86% with only the e-mail verification missing', () => {
    const completion = getProfileCompletion({ ...FULL_PROFILE, emailVerified: false });

    expect(completion.percent).toBe(86);
    expect(completion.missingLabels).toEqual(['E-posta doğrulaması']);
    expect(completion.isComplete).toBe(false);
  });

  it('lists empty fields in form order', () => {
    const completion = getProfileCompletion({ ...FULL_PROFILE, birthDate: null, gender: '' });

    expect(completion.percent).toBe(71);
    expect(completion.missingLabels).toEqual(['Doğum tarihi', 'Cinsiyet']);
  });

  it('counts an empty e-mail and its verification as two missing steps', () => {
    const completion = getProfileCompletion({ ...FULL_PROFILE, email: null, emailVerified: false });

    expect(completion.percent).toBe(71);
    expect(completion.missingLabels).toEqual(['E-posta', 'E-posta doğrulaması']);
  });

  it('treats whitespace-only values as empty', () => {
    expect(getProfileCompletion({ ...FULL_PROFILE, name: '  ', surname: '\t' }).missingLabels).toEqual(['Ad', 'Soyad']);
  });

  it('returns 0% without crashing when the profile is missing', () => {
    expect(getProfileCompletion(null)).toEqual({
      percent: 0,
      missingLabels: ['Ad', 'Soyad', 'E-posta', 'Telefon', 'Doğum tarihi', 'Cinsiyet', 'E-posta doğrulaması'],
      isComplete: false,
    });
    expect(getProfileCompletion(undefined).percent).toBe(0);
  });
});
