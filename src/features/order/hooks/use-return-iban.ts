import { useEffect, useMemo, useState } from 'react';
import { isValidIban, normalizeIban } from '../utils/iban';
import { PaymentMethod } from '@/types/order.types';

export type ResolvedIban = { iban: string; ibanName: string };

/**
 * Manages the refund-IBAN section of the return flow: selecting a saved IBAN when
 * the user has any, or entering a new one inline otherwise — mirroring the web
 * return page's IBAN logic (only relevant for bank-transfer payments).
 */
export function useReturnIban(shouldShow: boolean, paymentMethods: PaymentMethod[]) {
  const [selectedIbanId, setSelectedIbanId] = useState<number | null>(null);
  const [newIban, setNewIban] = useState('');
  const [newIbanName, setNewIbanName] = useState('');
  const [ibanError, setIbanError] = useState<string | null>(null);

  // Keep a valid selection: default to the first IBAN, clear when none / hidden.
  useEffect(() => {
    if (!shouldShow) {
      setSelectedIbanId(null);
      setNewIban('');
      setNewIbanName('');
      setIbanError(null);
      return;
    }
    if (paymentMethods.length === 0) {
      setSelectedIbanId(null);
      return;
    }
    setSelectedIbanId((prev) =>
      prev !== null && paymentMethods.some((method) => method.id === prev)
        ? prev
        : paymentMethods[0].id,
    );
  }, [shouldShow, paymentMethods]);

  const hasSavedSelected =
    selectedIbanId !== null && paymentMethods.some((method) => method.id === selectedIbanId);
  const isNewIbanValid = isValidIban(newIban);
  const isNewNameValid = newIbanName.trim().length > 0;

  const hasValidForSubmit = useMemo(() => {
    if (!shouldShow) return true;
    return paymentMethods.length > 0 ? hasSavedSelected : isNewIbanValid && isNewNameValid;
  }, [shouldShow, paymentMethods.length, hasSavedSelected, isNewIbanValid, isNewNameValid]);

  /** Resolves the IBAN values to submit, or null + sets an error when invalid. */
  function resolveForPayload(): ResolvedIban | null {
    if (!shouldShow) return { iban: '', ibanName: '' };
    if (paymentMethods.length > 0) {
      const selected = paymentMethods.find((method) => method.id === selectedIbanId);
      if (!selected) {
        setIbanError('Lütfen iade için IBAN seçin.');
        return null;
      }
      setIbanError(null);
      return { iban: selected.iban, ibanName: selected.ibanName };
    }
    if (!isNewIbanValid) {
      setIbanError('Geçerli bir IBAN giriniz.');
      return null;
    }
    if (!isNewNameValid) {
      setIbanError('IBAN sahibi adı gereklidir.');
      return null;
    }
    setIbanError(null);
    return { iban: normalizeIban(newIban), ibanName: newIbanName.trim() };
  }

  return {
    selectedIbanId,
    setSelectedIbanId,
    newIban,
    setNewIban,
    newIbanName,
    setNewIbanName,
    ibanError,
    setIbanError,
    hasValidForSubmit,
    resolveForPayload,
  };
}

export type UseReturnIban = ReturnType<typeof useReturnIban>;
