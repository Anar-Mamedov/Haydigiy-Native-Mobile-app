import { HelpCategoryDto } from '@/services/help.service';
import { HelpCategory } from '@/types/help.types';

/** Maps a help-category DTO to the domain model, defaulting a missing article list. */
export function mapHelpCategory(dto: HelpCategoryDto): HelpCategory {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    articles: Array.isArray(dto.articles)
      ? dto.articles.map((article) => ({
          id: article.id,
          question: article.question,
          answer: article.answer,
        }))
      : [],
  };
}
