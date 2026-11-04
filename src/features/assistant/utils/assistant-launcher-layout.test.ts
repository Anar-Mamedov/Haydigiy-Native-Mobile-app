import { ASSISTANT_LAUNCHER_SIZE, resolveAboveAssistantLauncherPosition } from './assistant-launcher-layout';

describe('resolveAboveAssistantLauncherPosition', () => {
  it('asistan görünürken düğme onun üstüne çıkar ve ortası asistan dairesiyle hizalanır', () => {
    const position = resolveAboveAssistantLauncherPosition({ inset: 18, launcherVisible: true, size: 48 });

    expect(position).toEqual({ bottom: 18 + ASSISTANT_LAUNCHER_SIZE + 8, right: 18 + (ASSISTANT_LAUNCHER_SIZE - 48) / 2 });
    // Asistan dairesinin üst kenarının üstünde kalır; çakışmaz.
    expect(position.bottom).toBeGreaterThan(18 + ASSISTANT_LAUNCHER_SIZE);
  });

  it('asistan görünmezken köşeye iner', () => {
    expect(resolveAboveAssistantLauncherPosition({ inset: 18, launcherVisible: false, size: 48 })).toEqual({
      bottom: 18,
      right: 18,
    });
  });
});
