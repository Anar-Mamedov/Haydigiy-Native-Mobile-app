/** `GET /categories` ağacındaki bir düğüm; bu özellik için yalnız kimlik alanları okunur. */
export interface CategoryTreeNodeDto {
  id?: number | string | null;
  slug?: string | null;
  children?: CategoryTreeNodeDto[] | null;
}

/** Uç ağacı `{ data: [...] }` ya da doğrudan dizi olarak döndürebiliyor. */
export type CategoryTreeResponseDto = { data?: CategoryTreeNodeDto[] | null } | CategoryTreeNodeDto[];
