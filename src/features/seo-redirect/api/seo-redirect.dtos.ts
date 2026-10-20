/** `GET /seo/redirect-rules/resolve` yanıtı; eşleşme yoksa yalnızca `{ matched: false }` gelir. */
export interface SeoRedirectResolveDto {
  success?: boolean;
  matched?: boolean;
  status_code?: number;
  target_url?: string | null;
}
