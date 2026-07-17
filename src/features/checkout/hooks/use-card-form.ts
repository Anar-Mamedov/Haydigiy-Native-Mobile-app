import { useEffect, useMemo, useState } from 'react';
import { useInstallmentPlansQuery } from '../api/checkout.queries';
import { hasRestrictedCardPrefix, isValidCard } from '../schemas/card.schema';
import { CardFormValues, InstallmentPlan } from '@/types/checkout.types';

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export interface CardFormController {
  values: CardFormValues;
  digits: string;
  setNumber: (value: string) => void;
  setExpiryMonth: (value: string) => void;
  setExpiryYear: (value: string) => void;
  setCvv: (value: string) => void;
  setOwner: (value: string) => void;
  isRestrictedBin: boolean;
  isValid: boolean;
  installmentPlans: InstallmentPlan[];
  isLoadingInstallments: boolean;
  selectedInstallment: number;
  selectedPlan: InstallmentPlan | null;
  selectInstallment: (count: number) => void;
}

/**
 * Owns the in-memory card fields (never persisted), card validity, and the İyzico
 * installment plans for the entered BIN. The single-payment amount drives the
 * installment rate lookup so the plans stay stable while the user picks one.
 * Mirrors the web `CardInformation`, minus the PayTR card-brand handling.
 */
export function useCardForm(singlePaymentAmount: number, enabled: boolean): CardFormController {
  const [number, setNumberState] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvvState] = useState('');
  const [owner, setOwner] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState(1);

  const digits = number.replace(/\s/g, '');
  const bin = digits.slice(0, 8);
  const isRestrictedBin = hasRestrictedCardPrefix(digits);

  const installmentsQuery = useInstallmentPlansQuery(
    bin,
    Math.max(1, singlePaymentAmount),
    enabled && !isRestrictedBin,
  );
  const installmentPlans = useMemo(() => installmentsQuery.data ?? [], [installmentsQuery.data]);

  // Reset the selection when the available plans change (new BIN / amount) and the
  // previously chosen installment is no longer offered. Keep the selection while
  // a new amount is loading so a price refresh cannot silently turn an installment
  // checkout into a single-payment checkout before the user retries.
  useEffect(() => {
    if (selectedInstallment === 1) return;
    if (installmentsQuery.isFetching) return;
    if (!installmentPlans.some((plan) => plan.installment === selectedInstallment)) {
      setSelectedInstallment(1);
    }
  }, [installmentPlans, installmentsQuery.isFetching, selectedInstallment]);

  const selectedPlan = useMemo(
    () => installmentPlans.find((plan) => plan.installment === selectedInstallment) ?? null,
    [installmentPlans, selectedInstallment],
  );

  const isValid = isValidCard({ number, expiryMonth, expiryYear, cvv, owner });

  return {
    values: { number, expiryMonth, expiryYear, cvv, owner },
    digits,
    setNumber: (value) => setNumberState(formatCardNumber(value)),
    setExpiryMonth,
    setExpiryYear,
    setCvv: (value) => setCvvState(value.replace(/\D/g, '').slice(0, 3)),
    setOwner,
    isRestrictedBin,
    isValid,
    installmentPlans,
    isLoadingInstallments: installmentsQuery.isFetching,
    selectedInstallment,
    selectedPlan,
    selectInstallment: setSelectedInstallment,
  };
}
