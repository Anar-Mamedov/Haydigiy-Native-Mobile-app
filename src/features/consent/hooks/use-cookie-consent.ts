import { useCallback, useEffect, useState } from 'react';
import { postCookieConsent } from '@/services/cookie-consent.service';
import { buildConsentPayload } from '../services/consent-payload';
import { readStoredConsent, writeStoredConsent } from '../services/consent-storage';
import {
  ConsentPreferences,
  ConsentStatus,
  FULL_CONSENT_PREFERENCES,
  NO_CONSENT_PREFERENCES,
} from '../types/consent.types';

/**
 * Kısmi seçimde doğru durum: hepsi açıksa `accepted`, hepsi kapalıysa
 * `rejected`, arada ise `partial`. Backend yalnızca bu üçünü kabul ediyor.
 */
export function resolveConsentStatus(preferences: ConsentPreferences): ConsentStatus {
  const values = [preferences.analytics, preferences.functional, preferences.marketing];

  if (values.every(Boolean)) return 'accepted';
  if (values.every((value) => !value)) return 'rejected';

  return 'partial';
}

/**
 * İlk açılışta izin sorulup sorulmayacağını ve kullanıcının seçimini yönetir.
 * Seçim önce yerel olarak kaydedilir; sunucuya gönderim başarısız olsa bile
 * kullanıcıya tekrar sorulmaz.
 */
export function useCookieConsent() {
  const [isReady, setIsReady] = useState(false);
  const [needsConsent, setNeedsConsent] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(NO_CONSENT_PREFERENCES);

  useEffect(() => {
    let cancelled = false;

    readStoredConsent()
      .then((stored) => {
        if (cancelled) return;
        if (stored) setPreferences(stored.preferences);
        setNeedsConsent(!stored);
      })
      .catch(() => {
        // Depo okunamazsa izni tekrar sormak, hiç sormamaktan iyidir.
        if (!cancelled) setNeedsConsent(true);
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(async (next: ConsentPreferences) => {
    const status = resolveConsentStatus(next);

    setPreferences(next);
    setNeedsConsent(false);

    try {
      await writeStoredConsent({ preferences: next, status });
    } catch (error) {
      console.warn('[Consent] Tercih yerel olarak kaydedilemedi.', error);
    }

    try {
      await postCookieConsent(await buildConsentPayload(status, next));
    } catch (error) {
      console.warn('[Consent] Tercih sunucuya iletilemedi.', error);
    }
  }, []);

  const togglePreference = useCallback((key: keyof ConsentPreferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  return {
    acceptAll: useCallback(() => submit(FULL_CONSENT_PREFERENCES), [submit]),
    isReady,
    needsConsent,
    preferences,
    rejectAll: useCallback(() => submit(NO_CONSENT_PREFERENCES), [submit]),
    saveSelection: useCallback(() => submit(preferences), [preferences, submit]),
    togglePreference,
  };
}
