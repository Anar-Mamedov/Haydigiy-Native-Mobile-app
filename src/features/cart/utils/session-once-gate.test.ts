import { createSessionOnceGate } from './session-once-gate';

describe('createSessionOnceGate', () => {
  it('lets the work run once until it is reset', () => {
    const gate = createSessionOnceGate();

    expect(gate.tryEnter()).toBe(true);
    expect(gate.tryEnter()).toBe(false);

    gate.reset();

    expect(gate.tryEnter()).toBe(true);
  });

  it('keeps separate gates independent', () => {
    const first = createSessionOnceGate();
    const second = createSessionOnceGate();

    first.tryEnter();

    expect(second.tryEnter()).toBe(true);
  });
});
