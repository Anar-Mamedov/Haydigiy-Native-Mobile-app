import { appStorage } from '@/lib/storage/mmkv';

/**
 * "Bu kullanıcının e-postası/telefonu az önce değişti, Insider'daki profil henüz
 * güncellenmemiş olabilir" bayrağı.
 *
 * E-posta ve telefon Insider'da identifier'dır. Değişikliği mevcut profile backend
 * işler (`UserInsiderSyncObserver` → Update Identifiers PATCH'i). O istek kuyrukta
 * beklerken cihaz yeni değeri `login()` ile gönderirse Insider onu ilk kez görür ve
 * İKİNCİ bir profil açar; ardından gelen PATCH de "already has a user" ile reddedilir
 * ve eski e-postalı profil yerinde kalır.
 *
 * Profil kaydı yeni kimliği zaten göndermiyor, ama `identifyUser` her girişte ve her
 * soğuk açılışta çalışıyor. Kullanıcı kayıttan hemen sonra uygulamayı yeniden açtığında
 * (sistem uygulamayı arka planda da kapatabilir) ya da çıkış yapıp tekrar girdiğinde
 * yarış yine kaybediliyordu. Bayrak açıkken `identifyUser` e-posta ve telefonu geri
 * tutar; profil CRM kimliğiyle (`uuid`) çözülmeye devam eder. Web'deki
 * `markInsiderIdentityChangePending` ile aynı sözleşme.
 *
 * Süre backend'in bekleme bütçesiyle aynı (`InsiderIdentityPendingGate::TTL_SECONDS` =
 * 180 sn): PATCH'in en kötü ömrünü (3 deneme + backoff) ve kuyruk gecikmesini kapsar.
 *
 * Kayıt MMKV'de durur: pencerenin en riskli anı süreç yeniden başladığındaki kimlik
 * geri yüklemesidir, bellekteki bir bayrak o anda çoktan kaybolmuş olurdu.
 *
 * @see https://academy.insiderone.com/docs/update-identifiers-api
 */
export const INSIDER_IDENTITY_CHANGE_TTL_MS = 180_000;

const STORAGE_KEY = 'insider.identity-change';

export interface InsiderIdentityChangeGate {
  /** Kaydedilen profil e-posta ya da telefonu değiştirdiğinde çağrılır. */
  markPending(userId: string): void;
  /** Bu kullanıcı için pencere hâlâ açıksa `true`. Süresi dolan kayıt okunduğu anda silinir. */
  isPending(userId: string): boolean;
}

type PendingIdentityChange = {
  userId: string;
  changedAt: number;
};

interface IdentityChangeGateDependencies {
  now: () => number;
  storage: {
    getItem: (key: string) => Promise<string | null> | string | null;
    removeItem: (key: string) => Promise<void> | void;
    setItem: (key: string, value: string) => Promise<void> | void;
  };
  ttlMs: number;
}

const defaultDependencies: IdentityChangeGateDependencies = {
  now: () => Date.now(),
  storage: appStorage,
  ttlMs: INSIDER_IDENTITY_CHANGE_TTL_MS,
};

function parsePendingChange(raw: string): PendingIdentityChange | null {
  try {
    const parsed = JSON.parse(raw) as Partial<PendingIdentityChange> | null;
    if (typeof parsed?.userId !== 'string' || !parsed.userId) return null;
    if (typeof parsed.changedAt !== 'number' || !Number.isFinite(parsed.changedAt)) return null;

    return { userId: parsed.userId, changedAt: parsed.changedAt };
  } catch {
    return null;
  }
}

export function createInsiderIdentityChangeGate(
  dependencies: IdentityChangeGateDependencies = defaultDependencies,
): InsiderIdentityChangeGate {
  // Depo eşzamansızsa (yalnızca Expo Go'daki AsyncStorage yedeği; orada native SDK de
  // yok) ya da yazma başarısız olduysa aynı süreç içinde bu kopya kullanılır.
  let memory: PendingIdentityChange | null = null;

  const clear = (): void => {
    memory = null;
    try {
      void dependencies.storage.removeItem(STORAGE_KEY);
    } catch {
      // Yoksayılır; kayıt zaten süresi dolmuş ya da bozuk sayılıyor.
    }
  };

  const read = (): PendingIdentityChange | null => {
    let raw: Promise<string | null> | string | null;
    try {
      raw = dependencies.storage.getItem(STORAGE_KEY);
    } catch {
      return memory;
    }
    if (typeof raw !== 'string') return memory;

    const pending = parsePendingChange(raw);
    // Bozuk kayıt kimliği süresiz geri tutmasın.
    if (!pending) clear();
    return pending;
  };

  return {
    markPending(userId) {
      if (!userId) return;

      memory = { userId, changedAt: dependencies.now() };
      try {
        void dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(memory));
      } catch {
        // Kalıcı kopya en iyi çaba; bu süreç boyunca bellekteki kopya korur.
      }
    },

    isPending(userId) {
      const pending = read();
      if (!pending) return false;

      // Saat geriye alınmışsa da pencere en fazla bir TTL kadar uzayabilir; aksi halde
      // kimlik, cihaz saati düzelene kadar süresiz geri tutulurdu.
      if (Math.abs(dependencies.now() - pending.changedAt) >= dependencies.ttlMs) {
        clear();
        return false;
      }

      return pending.userId === userId;
    },
  };
}

export const insiderIdentityChangeGate = createInsiderIdentityChangeGate();
