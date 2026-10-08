import { mapAnnouncementPreferences, toAnnouncementPreferencesPayload } from './announcement-preferences.mapper';

describe('mapAnnouncementPreferences', () => {
  it('maps notify flags to channels', () => {
    expect(mapAnnouncementPreferences({ notify_email: true, notify_sms: false, notify_call: true })).toEqual({
      email: true,
      sms: false,
      phone: true,
    });
  });

  it('accepts 0/1 style flags and treats missing values as off', () => {
    expect(mapAnnouncementPreferences({ notify_email: 1, notify_sms: '1', notify_call: 0 })).toEqual({
      email: true,
      sms: true,
      phone: false,
    });
    expect(mapAnnouncementPreferences(null)).toEqual({ email: false, sms: false, phone: false });
  });
});

describe('toAnnouncementPreferencesPayload', () => {
  it('sends all three flags like the web form', () => {
    expect(toAnnouncementPreferencesPayload({ email: false, sms: true, phone: true })).toEqual({
      notify_email: false,
      notify_sms: true,
      notify_call: true,
    });
  });
});
