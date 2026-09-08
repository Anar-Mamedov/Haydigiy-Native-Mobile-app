import { ActivityMetaDto, ActivityProductDto } from '@/utils/account-activity';

export interface MyQuestionReplyDto {
  admin_name?: string | null;
  text?: string | null;
  created_at?: string | null;
}

/** `GET /question/my` kaydı: kullanıcının bir ürüne sorduğu soru. */
export interface MyQuestionDto {
  id?: number | string | null;
  question?: string | null;
  status?: string | null;
  created_at?: string | null;
  like_count?: number | string | null;
  product?: ActivityProductDto | null;
  reply?: MyQuestionReplyDto | null;
}

export interface MyQuestionsResponseDto {
  data?: MyQuestionDto[];
  meta?: ActivityMetaDto | null;
}
