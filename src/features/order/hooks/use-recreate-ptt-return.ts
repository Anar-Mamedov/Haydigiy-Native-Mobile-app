import { useCallback } from 'react';
import { useRecreateReturnAsPttMutation } from '../api/return.mutations';
import { buildPttRecreatedMessage } from '../utils/return-messages';
import { getReturnErrorMessage, SubmitReturnRequestPayload } from '@/services/return.service';

type Params = {
  /** PTT isteğinin gövdesi; IBAN eksik/geçersizse null döner ve istek gönderilmez. */
  buildPayload: () => SubmitReturnRequestPayload | null;
  /** Varsa en son iade talebi; backend bu talebi PTT'ye çevirir. */
  lastReturnRequestId: number | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

/**
 * Hepsijet "sistemde kayıtlı" hatasındaki "PTT İade Talebi Oluştur" akışı: mevcut
 * talep PTT'ye çevrilir ya da (talep hiç oluşmadıysa) PTT ile yeniden gönderilir.
 * Sonuç, ekranın başarı/hata sheet'lerine geri bildirilir.
 */
export function useRecreatePttReturn({
  buildPayload,
  lastReturnRequestId,
  onSuccess,
  onError,
}: Params) {
  const { mutateAsync, isPending } = useRecreateReturnAsPttMutation();

  const recreate = useCallback(async () => {
    const payload = buildPayload();
    if (!payload) return;

    try {
      const result = await mutateAsync({ returnRequestId: lastReturnRequestId, payload });
      onSuccess(
        buildPttRecreatedMessage({
          updatedExisting: lastReturnRequestId !== null,
          code: result.return_code ?? result.code,
          expiresAt: result.expires_at,
        }),
      );
    } catch (error) {
      onError(getReturnErrorMessage(error));
    }
  }, [buildPayload, lastReturnRequestId, mutateAsync, onSuccess, onError]);

  return { recreate, isRecreating: isPending };
}
