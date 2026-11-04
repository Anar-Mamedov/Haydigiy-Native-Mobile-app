import { migrateUiPreferences } from './use-ui-preferences-store';

describe('ui preferences store migration', () => {
  // Koyu mod kaldırıldı; seçicinin göründüğü dönemden kalan tercih kullanıcıyı koyu temada bırakmamalı.
  it.each(['dark', 'system', 'light'])('resets a stored %p preference to the light theme', (themePreference) => {
    expect(migrateUiPreferences({ themePreference }).themePreference).toBe('light');
  });

  it('tolerates a missing or malformed stored state', () => {
    expect(migrateUiPreferences(undefined)).toEqual({ themePreference: 'light' });
    expect(migrateUiPreferences('bozuk')).toEqual({ themePreference: 'light' });
  });
});
