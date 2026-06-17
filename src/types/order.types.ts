export type OrderProductKind = 'normal' | 'returned' | 'cancelled';

export type OrderProduct = {
  name: string;
  variantName: string;
  image: string | null;
  slug: string;
  kind: OrderProductKind;
};

export type Order = {
  id: number;
  orderNo: string;
  status: string;
  statusColor?: string;
  totalPrice: string;
  /** Raw "kargoya teslim" date string from the API (may contain a " - " range). */
  createdAt: string;
  shipmentCount: number;
  productCount: number;
  receiver: string;
  /** Normal + returned + cancelled lines combined, tagged with their kind. */
  products: OrderProduct[];
  isFullyCancelled: boolean;
  /** Unique row id for return-request cards (multiple returns can share an order). */
  returnRequestId?: number;
  /** Distinct return reasons, shown on "İadeler" cards. */
  returnReasons?: string[];
};

export type OrderMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
};

export type OrderCategory = 'all' | 'active' | 'returned' | 'cancelled';

export type OrderDateFilter = 'all' | 'last_30_days' | 'last_6_months' | 'last_1_year';

export type OrderFilters = {
  search: string;
  category: OrderCategory;
  dateFilter: OrderDateFilter;
};

export type OrdersPage = {
  orders: Order[];
  meta: OrderMeta;
};
