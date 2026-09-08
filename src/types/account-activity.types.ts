/**
 * Hesap alanındaki sayfalı "kendi kayıtlarım" listelerinin ortak tipleri.
 *
 * `GET /review/my-reviews` ve `GET /question/my` aynı sözleşmeyi paylaşır:
 * `data` + `meta`, opsiyonel `status` filtresi ve her kayıtta aynı ürün özeti.
 * Ortak parçalar burada durur ki iki özellik modülü birbirini kopyalamasın.
 */

/** Kaydın bağlı olduğu ürünün özeti; ürün silinmişse `null` gelir. */
export type ActivityProduct = {
  id: number | null;
  name: string;
  slug: string;
  image: string | null;
};

export type ActivityPagination = {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
};

export type ActivityPage<TItem> = {
  items: TItem[];
  pagination: ActivityPagination;
};

/** Yorumun onay durumu. Backend `rejected` döndürmez ama gelirse ele alınır. */
export type MyReviewStatus = 'pending' | 'approved' | 'rejected';

/** Sorunun durumu. */
export type MyQuestionStatus = 'pending' | 'answered' | 'rejected';

/** `status` gönderilmediğinde backend tüm kayıtları döndürür; `all` bunu ifade eder. */
export type MyReviewFilter = 'all' | 'pending' | 'approved';
export type MyQuestionFilter = 'all' | 'pending' | 'answered';

/** Kullanıcının kendi yazdığı yorum (`GET /review/my-reviews`). */
export type MyReviewEntry = {
  id: number;
  rating: number;
  comment: string;
  status: MyReviewStatus;
  createdAt: string;
  likeCount: number;
  /** Beden/boy/kilo yalnızca kullanıcı girdiyse dolu. */
  size: string;
  height: number | null;
  weight: number | null;
  /** Listede küçük görsel; yoksa tam boy fotoğrafa düşer. */
  thumbnail: string | null;
  photo: string | null;
  orderId: number | null;
  product: ActivityProduct | null;
};

export type MyQuestionReply = {
  adminName: string;
  text: string;
  createdAt: string;
};

/** Kullanıcının bir ürüne sorduğu soru (`GET /question/my`). */
export type MyQuestion = {
  id: number;
  question: string;
  status: MyQuestionStatus;
  createdAt: string;
  likeCount: number;
  product: ActivityProduct | null;
  /** Yalnızca cevaplanmış sorularda dolu. */
  reply: MyQuestionReply | null;
};
