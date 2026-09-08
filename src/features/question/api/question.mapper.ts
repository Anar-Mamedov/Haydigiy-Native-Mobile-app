import { MyQuestionDto, MyQuestionReplyDto, MyQuestionsResponseDto } from './question.dtos';
import { ActivityPage, MyQuestion, MyQuestionReply } from '@/types/account-activity.types';
import {
  mapActivityPagination,
  mapActivityProduct,
  readActivityCount,
  readActivityNumber,
  readActivityString,
} from '@/utils/account-activity';

/** Cevap metni boşsa cevap yok sayılır; kart "cevap bekliyor" durumunu gösterir. */
function mapQuestionReply(dto: MyQuestionReplyDto | null | undefined): MyQuestionReply | null {
  const text = readActivityString(dto?.text);
  if (!text) return null;

  return {
    adminName: readActivityString(dto?.admin_name) || 'HaydiGiy',
    text,
    createdAt: readActivityString(dto?.created_at),
  };
}

/** Kimliksiz ya da metinsiz soru listeye alınmaz; kart boş çizilmesin. */
export function mapMyQuestion(dto: MyQuestionDto): MyQuestion | null {
  const id = readActivityNumber(dto?.id);
  if (id === null) return null;

  const question = readActivityString(dto.question);
  if (!question) return null;

  const status = readActivityString(dto.status).toLowerCase();

  return {
    id,
    question,
    status: status === 'answered' || status === 'rejected' ? status : 'pending',
    createdAt: readActivityString(dto.created_at),
    likeCount: readActivityCount(dto.like_count),
    product: mapActivityProduct(dto.product),
    reply: mapQuestionReply(dto.reply),
  };
}

export function mapMyQuestionsPage(dto: MyQuestionsResponseDto | null | undefined): ActivityPage<MyQuestion> {
  const items = (Array.isArray(dto?.data) ? dto.data : [])
    .map(mapMyQuestion)
    .filter((question): question is MyQuestion => question !== null);

  return { items, pagination: mapActivityPagination(dto?.meta, items.length) };
}
