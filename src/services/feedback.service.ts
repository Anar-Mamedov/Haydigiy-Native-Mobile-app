import { apiClient } from '@/lib/axios';

export interface SendFeedbackPayloadDto {
  message: string;
}

/** Genel geri bildirim gönderir (`POST /feedback`), web ile aynı gövdeyle. */
export async function sendFeedbackDto(payload: SendFeedbackPayloadDto): Promise<void> {
  await apiClient.post('/feedback', payload);
}
