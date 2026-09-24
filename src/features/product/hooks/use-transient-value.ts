import { useCallback, useEffect, useRef, useState } from 'react';

export type TransientValue<T> = {
  /** Şu an gösterilen değer; süre dolunca ya da `clear` çağrılınca null. */
  value: T | null;
  /** Değeri gösterir ve süre sonunda kendiliğinden sıfırlar. Önceki sayaç iptal edilir. */
  show: (next: T) => void;
  /** Değeri beklemeden sıfırlar. */
  clear: () => void;
};

/**
 * Bir değeri kısa bir süre tutar ("Tekli Ürün Eklendi" gibi geçici geri bildirimler için).
 * Bileşen kaldırılınca bekleyen sayaç temizlenir; kaldırılmış bileşende state güncellenmez.
 */
export function useTransientValue<T>(durationMs: number): TransientValue<T> {
  const [value, setValue] = useState<T | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const clear = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = null;
    setValue(null);
  }, []);

  const show = useCallback(
    (next: T) => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setValue(next);
      resetTimer.current = setTimeout(() => {
        resetTimer.current = null;
        setValue(null);
      }, durationMs);
    },
    [durationMs],
  );

  return { value, show, clear };
}
