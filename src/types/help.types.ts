/** A single FAQ article (question + answer). */
export type HelpArticle = {
  id: number;
  question: string;
  answer: string;
};

/** A help category grouping FAQ articles, shown as a tab on the help screen. */
export type HelpCategory = {
  id: number;
  title: string;
  slug?: string;
  articles: HelpArticle[];
};
