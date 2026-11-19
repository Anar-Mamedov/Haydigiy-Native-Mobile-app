import { mapAnnouncementPreferences, toAnnouncementPreferencesPayload } from './announcement-preferences.mapper';

describe('mapAnnouncementPreferences', () => {
  it('maps notify flags to channels', () => {
    expect(
      mapAnnouncementPreferences({ notify_email: true, notify_sms: false, notify_call: true, notify_whatsapp: false }),
    ).toEqual({
      email: true,
      sms: false,
      phone: true,
      whatsapp: false,
    });
  });

  it('accepts 0/1 style flags and treats missing values as off', () => {
    expect(mapAnnouncementPreferences({ notify_email: 1, notify_sms: '1', notify_call: 0, notify_whatsapp: 1 })).toEqual({
      email: true,
      sms: true,
      phone: false,
      whatsapp: true,
    });
    expect(mapAnnouncementPreferences(null)).toEqual({ email: false, sms: false, phone: false, whatsapp: null });
  });

  it('marks WhatsApp as unsupported when the backend does not send notify_whatsapp', () => {
    expect(mapAnnouncementPreferences({ notify_email: true, notify_sms: true, notify_call: true }).whatsapp).toBeNull();
  });
});

describe('toAnnouncementPreferencesPayload', () => {
  it('sends the three channels like the web form when WhatsApp is unsupported', () => {
    expect(toAnnouncementPreferencesPayload({ email: false, sms: true, phone: true, whatsapp: null })).toEqual({
      notify_email: false,
      notify_sms: true,
      notify_call: true,
    });
  });

  it('adds notify_whatsapp when the backend supports it', () => {
    expect(toAnnouncementPreferencesPayload({ email: true, sms: true, phone: false, whatsapp: true })).toEqual({
      notify_email: true,
      notify_sms: true,
      notify_call: false,
      notify_whatsapp: true,
    });
  });
});
