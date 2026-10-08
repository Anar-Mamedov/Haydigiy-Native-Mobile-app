import { useEffect } from 'react';

type TabReselectListener = () => void;

/**
 * Alt menüde, kullanıcının zaten bulunduğu sekmenin kök ekranına tekrar basılması.
 *
 * Bir durum değil, tek seferlik bir olaydır; bu yüzden Zustand store'u yerine küçük bir
 * abone listesi kullanılır. Alt menü yeniden gezinmez (aynı ekranın yandan kayarak gelmesini
 * önler), sekmenin ekranı ise olayı dinleyip kendi tepkisini verir (ör. en üste kaydırma).
 */
const listeners = new Map<string, Set<TabReselectListener>>();

export function notifyTabReselect(path: string) {
  listeners.get(path)?.forEach((listener) => listener());
}

/** `path` sekmesine kök ekrandayken tekrar basıldığında `onReselect` çalışır; `onReselect` sabit tutulmalı. */
export function useTabReselect(path: string, onReselect: TabReselectListener) {
  useEffect(() => {
    const pathListeners = listeners.get(path) ?? new Set<TabReselectListener>();
    pathListeners.add(onReselect);
    listeners.set(path, pathListeners);

    return () => {
      pathListeners.delete(onReselect);
      if (pathListeners.size === 0) listeners.delete(path);
    };
  }, [path, onReselect]);
}
