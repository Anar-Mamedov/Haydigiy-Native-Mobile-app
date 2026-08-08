import { useEffect, useState } from 'react';

/**
 * Bayrağı açarken bekletir, kapatırken anında kapatır.
 *
 * Yükleme katmanları için: hızlı yanıtta katman hiç görünmez (yanıp sönme olmaz),
 * yavaş bağlantıda ise kullanıcı beklediğini net olarak görür.
 */
export function useDelayedFlag(active: boolean, delay: number): boolean {
  const [hasWaited, setHasWaited] = useState(false);

  useEffect(() => {
    if (!active) return;

    const timer = setTimeout(() => setHasWaited(true), delay);
    return () => {
      clearTimeout(timer);
      setHasWaited(false);
    };
  }, [active, delay]);

  // `active` false olduğu anda sonuç false olur; bekleme durumu cleanup'ta sıfırlanır.
  return active && hasWaited;
}
