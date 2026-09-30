import {
  INSIDER_IDENTITY_CHANGE_TTL_MS,
  createInsiderIdentityChangeGate,
} from './insider-identity-change-gate';

const STORAGE_KEY = 'insider.identity-change';

function createStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: jest.fn((key: string) => store.get(key) ?? null),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  };
}

function createHarness(storage = createStorage()) {
  const clock = { now: 1_000_000 };
  const gate = createInsiderIdentityChangeGate({
    now: () => clock.now,
    storage,
    ttlMs: INSIDER_IDENTITY_CHANGE_TTL_MS,
  });
  return { clock, gate, storage };
}

describe('insider identity change gate', () => {
  it('uses the same budget as the backend pending gate', () => {
    // `InsiderIdentityPendingGate::TTL_SECONDS` ve web `INSIDER_IDENTITY_CHANGE_TTL_MS` ile aynı.
    expect(INSIDER_IDENTITY_CHANGE_TTL_MS).toBe(180_000);
  });

  it('is closed until an identifier change is marked', () => {
    const { gate } = createHarness();

    expect(gate.isPending('42')).toBe(false);
  });

  it('holds back only the user whose identifier changed', () => {
    const { gate } = createHarness();

    gate.markPending('42');

    expect(gate.isPending('42')).toBe(true);
    expect(gate.isPending('7')).toBe(false);
  });

  /**
   * Regresyon: pencerenin en riskli anı, kayıttan hemen sonra uygulamanın yeniden
   * açılmasıdır. Bellekte tutulan bir bayrak o anda kaybolur ve açılıştaki kimlik geri
   * yüklemesi yeni e-postayı Insider'a PATCH'ten önce tanıtırdı.
   */
  it('survives a process restart through the persisted copy', () => {
    const storage = createStorage();
    const beforeRestart = createHarness(storage);
    beforeRestart.gate.markPending('42');

    const afterRestart = createHarness(storage);

    expect(afterRestart.gate.isPending('42')).toBe(true);
  });

  it('closes once the backend budget is spent and drops the record', () => {
    const { clock, gate, storage } = createHarness();
    gate.markPending('42');

    clock.now += INSIDER_IDENTITY_CHANGE_TTL_MS - 1;
    expect(gate.isPending('42')).toBe(true);

    clock.now += 1;
    expect(gate.isPending('42')).toBe(false);
    // Süresi dolan kayıt okunduğu anda silinir; pencere bir sonraki okumada uzamaz.
    expect(storage.store.has(STORAGE_KEY)).toBe(false);
    expect(gate.isPending('42')).toBe(false);
  });

  it('does not keep identifiers withheld forever when the device clock jumps backwards', () => {
    const { clock, gate } = createHarness();
    gate.markPending('42');

    clock.now -= INSIDER_IDENTITY_CHANGE_TTL_MS;

    expect(gate.isPending('42')).toBe(false);
  });

  it('ignores and removes a corrupt record', () => {
    const { gate, storage } = createHarness();
    storage.store.set(STORAGE_KEY, 'bozuk');

    expect(gate.isPending('42')).toBe(false);
    expect(storage.store.has(STORAGE_KEY)).toBe(false);
  });

  it('keeps the window in memory when the persisted copy cannot be written', () => {
    const storage = createStorage();
    storage.setItem.mockImplementation(() => {
      throw new Error('disk full');
    });
    const { gate } = createHarness(storage);

    expect(() => gate.markPending('42')).not.toThrow();
    expect(gate.isPending('42')).toBe(true);
  });

  it('ignores a change without a user id', () => {
    const { gate, storage } = createHarness();

    gate.markPending('');

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(gate.isPending('')).toBe(false);
  });
});
