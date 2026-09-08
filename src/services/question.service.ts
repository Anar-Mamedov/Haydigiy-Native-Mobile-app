import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';
import { MyQuestionsResponseDto } from '@/features/question/api/question.dtos';
import { MyQuestionFilter } from '@/types/account-activity.types';

/**
 * Kullanıcının kendi sorularının sayfası (`GET /question/my`).
 *
 * `status` gönderilmediğinde backend tüm soruları döndürür; reddedilenler her
 * durumda dışarıda kalır.
 */
export async function getMyQuestionsDto(status: MyQuestionFilter, page: number): Promise<MyQuestionsResponseDto> {
  if (!appEnv.apiBaseUrl) return { data: [], meta: null };

  const params: Record<string, string | number> = { page: Math.max(1, page) };
  if (status !== 'all') params.status = status;

  const response = await apiClient.get<MyQuestionsResponseDto>('/question/my', {
    params,
    headers: { Accept: 'application/json' },
  });
  return response.data;
}
