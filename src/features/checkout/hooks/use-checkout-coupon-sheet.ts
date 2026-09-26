import { useCallback, useState } from 'react';

/** Kuponu uygular; kupon doğrulanıp uygulandıysa `true` döner. */
export type ApplyCoupon = (code: string) => Promise<boolean>;

/**
 * "Kuponlarım" sayfasının durumu: açık/kapalı, yazılan kod ve uygulama akışı.
 * Sayfa yalnızca kupon uygulanınca kapanır; başarısız denemede açık kalır ki
 * hata mesajı kullanıcının gözü önünde görünsün.
 */
export function useCheckoutCouponSheet(onApplyCoupon: ApplyCoupon) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const applyCoupon = useCallback(
    async (couponCode: string) => {
      const trimmedCode = couponCode.trim();
      if (!trimmedCode) return;

      const isApplied = await onApplyCoupon(trimmedCode);
      if (!isApplied) return;

      setCode('');
      setIsOpen(false);
    },
    [onApplyCoupon],
  );

  const applyTypedCode = useCallback(() => applyCoupon(code), [applyCoupon, code]);

  return { isOpen, open, close, code, setCode, applyCoupon, applyTypedCode };
}
