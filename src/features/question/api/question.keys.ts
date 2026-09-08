import { MyQuestionFilter } from '@/types/account-activity.types';

export const questionKeys = {
  all: ['my-questions'] as const,
  /** Kullanıcının kendi soruları (`/question/my`); sayfalar sonsuz sorguda tutulur. */
  list: (status: MyQuestionFilter) => [...questionKeys.all, 'list', status] as const,
};
