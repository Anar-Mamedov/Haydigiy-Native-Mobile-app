import { useQuery } from '@tanstack/react-query';
import { getAssistantConfigDto } from '@/services/assistant.service';
import type { AssistantConfig } from '@/types/assistant.types';
import { parseAssistantConfig } from './assistant-config.mapper';
import { assistantKeys } from './assistant.keys';

/** Sunucu `/config`'i 5 dk önbellekler (README §4.1); uygulama da aynı süreyle tutar. */
const CONFIG_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * `GET /assistant/config` (kimliksiz). `enabled:false`, desteklenmeyen şema ya da eski istemci →
 * `enabled:false` döner ve giriş noktaları hiç gösterilmez (kural 13).
 */
export function useAssistantConfigQuery() {
  return useQuery<AssistantConfig>({
    queryKey: assistantKeys.config(),
    staleTime: CONFIG_STALE_TIME_MS,
    queryFn: async () => parseAssistantConfig(await getAssistantConfigDto()),
  });
}
