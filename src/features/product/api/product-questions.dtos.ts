/** Raw `GET /product/{slug}/question` response shape. */
export interface ProductQuestionReplyDto {
  admin_name?: string;
  text?: string;
  created_at?: string;
}

export interface ProductQuestionDto {
  id: number;
  question: string;
  user_name: string;
  created_at: string;
  like_count: number | null;
  tag?: string | null;
  reply: ProductQuestionReplyDto | null;
}

export interface ProductQuestionsPageDto {
  product?: {
    id?: number;
    name?: string;
    price?: string;
    media?: { medium?: string; thumb?: string };
    cart_count?: number;
    favorites_count?: number;
    total_quantity?: number;
    variants?: unknown[];
  };
  /** The API returns the topic tags either as a bare array or under `tags`. */
  filters?: string[] | { tags?: string[] };
  questions?: { data?: ProductQuestionDto[] };
}
