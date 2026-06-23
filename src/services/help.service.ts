import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

export interface HelpArticleDto {
  id: number;
  question: string;
  answer: string;
}

export interface HelpCategoryDto {
  id: number;
  title: string;
  slug?: string;
  articles?: HelpArticleDto[];
}

interface HelpResponseDto {
  data?: { categories?: HelpCategoryDto[] };
}

/** Loads the help/FAQ categories and their articles (`GET /help`). */
export async function getHelpCategoriesDto(): Promise<HelpCategoryDto[]> {
  if (!appEnv.apiBaseUrl) return [];
  const response = await apiClient.get<HelpResponseDto>('/help');
  const categories = response.data?.data?.categories;
  return Array.isArray(categories) ? categories : [];
}

/** Sends "Faydalı mı?" feedback for an article (`POST /help/feedback`). */
export async function sendHelpFeedbackDto(articleId: number, isHelpful = true): Promise<void> {
  await apiClient.post('/help/feedback', { article_id: articleId, is_helpful: isHelpful });
}
