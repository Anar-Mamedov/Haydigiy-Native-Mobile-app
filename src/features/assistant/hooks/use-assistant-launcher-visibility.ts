import { usePathname } from 'expo-router';
import type { AssistantConfig } from '@/types/assistant.types';
import { isAssistantLauncherHiddenPath } from '../utils/assistant-launcher-visibility';
import { useAssistantAvailability } from './use-assistant-availability';

export interface AssistantLauncherVisibility {
  /** Düğme bu ekranda çizilecekse asistanın config'i, çizilmeyecekse `null`. */
  config: AssistantConfig | null;
  visible: boolean;
}

/**
 * Sağ-alt "Haydi Asistan" düğmesi bu ekranda görünüyor mu. Düğme ve aynı köşedeki yüzen düğmeler
 * (ör. "Sayfanın başına dön") aynı kararı buradan okur. `/config` kapalıysa (enabled:false, eski
 * istemci ya da 403) hiçbir ekranda görünmez (kural 13).
 */
export function useAssistantLauncherVisibility(): AssistantLauncherVisibility {
  const pathname = usePathname();
  const { available, config } = useAssistantAvailability();
  const visible = available && config !== null && !isAssistantLauncherHiddenPath(pathname);

  return { config: visible ? config : null, visible };
}
