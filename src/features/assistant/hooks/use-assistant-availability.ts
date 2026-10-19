import { useEffect } from 'react';
import type { AssistantConfig } from '@/types/assistant.types';
import { useAssistantConfigQuery } from '../api/assistant.queries';
import { useAssistantStore } from '../store/use-assistant-store';

export interface AssistantAvailability {
  config: AssistantConfig | null;
  /** Asistan açık mı: config `enabled` ve oturumda `403 assistant_disabled` gelmedi. */
  available: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/** `/config` sonucunu sohbet akışlarının okuduğu depoya taşır ve görünürlüğü tek yerde hesaplar. */
export function useAssistantAvailability(): AssistantAvailability {
  const query = useAssistantConfigQuery();
  const disabled = useAssistantStore((state) => state.disabled);
  const setConfig = useAssistantStore((state) => state.setConfig);
  const config = query.data ?? null;

  useEffect(() => {
    if (config) setConfig(config);
  }, [config, setConfig]);

  return {
    config,
    available: !!config?.enabled && !disabled,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
