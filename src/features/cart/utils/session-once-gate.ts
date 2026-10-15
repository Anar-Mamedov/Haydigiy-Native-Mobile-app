/** Bir işin oturum başına tek kez çalışmasını sağlayan kapı. */
export type SessionOnceGate = {
  /** İlk çağrıda `true` döner ve kapıyı kapatır; `reset` çağrılana kadar sonrakiler `false` döner. */
  tryEnter: () => boolean;
  /** Oturum bittiğinde (çıkış) kapıyı yeniden açar. */
  reset: () => void;
};

export function createSessionOnceGate(): SessionOnceGate {
  let entered = false;

  return {
    tryEnter: () => {
      if (entered) return false;
      entered = true;
      return true;
    },
    reset: () => {
      entered = false;
    },
  };
}

/**
 * Misafir sepetinin hesaba birleştirilmesi. Süreç ömrü boyunca yaşar: Android MainActivity'yi
 * yeniden oluşturduğunda (hazır durumda başlatma) React ağacı baştan mount olur; bileşen içindeki
 * bir ref sıfırlanacağı için birleştirme isteği ve sepet yenilemesi her seferinde tekrarlanırdı.
 */
export const guestCartMergeGate = createSessionOnceGate();
