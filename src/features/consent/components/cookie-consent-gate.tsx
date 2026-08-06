import { useState } from 'react';
import { useCookieConsent } from '../hooks/use-cookie-consent';
import { CookieConsentSheet } from './cookie-consent-sheet';
import { CookiePreferencesSheet } from './cookie-preferences-sheet';

/**
 * İzin akışının uygulama kökündeki bağlanma noktası. Kullanıcı daha önce
 * cevap vermediyse ilk açılışta bildirimi, oradan da tercih panelini açar.
 */
export function CookieConsentGate() {
  const { acceptAll, isReady, needsConsent, preferences, rejectAll, saveSelection, togglePreference } =
    useCookieConsent();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  if (!isReady || !needsConsent) return null;

  return (
    <>
      <CookieConsentSheet
        onAcceptAll={acceptAll}
        onOpenPreferences={() => setIsPreferencesOpen(true)}
        onRejectAll={rejectAll}
        open={!isPreferencesOpen}
      />
      <CookiePreferencesSheet
        onAcceptAll={() => {
          setIsPreferencesOpen(false);
          acceptAll();
        }}
        onClose={() => setIsPreferencesOpen(false)}
        onSave={() => {
          setIsPreferencesOpen(false);
          saveSelection();
        }}
        onToggle={togglePreference}
        open={isPreferencesOpen}
        preferences={preferences}
      />
    </>
  );
}
