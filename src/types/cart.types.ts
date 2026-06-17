export type CartCampaign = {
  id: number;
  name: string;
  type: string;
  isApplicable: boolean;
  threshold: number | null;
  remaining: number;
  discount?: number;
  endDate?: string | null;
};

export type CartLineItem = {
  imageUrl: string;
  productId: string;
  quantity: number;
  sellerName: string;
  title: string;
  unitPrice: number;
  size?: string;
  /** Server cart line identifier; required for update/remove API calls. */
  variantId?: string;
  /** Catalog slug used to deep-link back to the product detail screen. */
  slug?: string;
  /** Pre-discount unit price; drives the struck-through original price. */
  originalPrice?: number;
  /** Remaining stock for the selected variant; caps quantity and drives low-stock badges. */
  stock?: number;
};
