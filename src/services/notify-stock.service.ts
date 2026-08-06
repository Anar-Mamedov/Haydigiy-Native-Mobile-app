import { apiClient } from '@/lib/axios';

/**
 * Registers a "tell me when this variant is back in stock" request.
 * Mirrors the web `/notify-stock` call; the backend mails the account owner.
 */
export async function postNotifyStock(variantId: number): Promise<void> {
  await apiClient.post('/notify-stock', { variant_id: variantId });
}
