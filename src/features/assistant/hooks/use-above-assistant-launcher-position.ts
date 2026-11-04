import { getTokenValue } from 'tamagui';
import {
  ASSISTANT_LAUNCHER_INSET_TOKEN,
  type CornerPosition,
  resolveAboveAssistantLauncherPosition,
} from '../utils/assistant-launcher-layout';
import { useAssistantLauncherVisibility } from './use-assistant-launcher-visibility';

/**
 * Sağ-alt köşedeki yüzen düğmenin konumu: asistan düğmesi görünürken onun üstüne yığılır, böylece
 * ikisi çakışmaz (web `useAboveAssistantPosition`). `size`, yüzen düğmenin çapı.
 */
export function useAboveAssistantLauncherPosition(size: number): CornerPosition {
  const { visible } = useAssistantLauncherVisibility();
  const inset = getTokenValue(ASSISTANT_LAUNCHER_INSET_TOKEN, 'space');

  return resolveAboveAssistantLauncherPosition({ inset, launcherVisible: visible, size });
}
