/** Web'deki bir sayfanın adresi: yol ve `?` olmadan sorgu dizesi (`c=216`). */
export type WebLocation = {
  path: string;
  queryString: string;
};

/** Yönetim panelinde tanımlanan SEO yönlendirme kuralının sonucu. */
export type SeoRedirectResolution =
  | { matched: false }
  | { matched: true; statusCode: number; targetUrl: string };
