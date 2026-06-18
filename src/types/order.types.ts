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

export type OrderAddress = {
  name: string;
  surname: string;
  phone: string;
  addressLine: string;
  neighbourhood: string;
  district: string;
  city: string;
  zipCode: string | null;
};

export type OrderDetailItem = {
  id: number;
  productId?: number;
  variantId?: number;
  name: string;
  variantName: string;
  slug: string;
  image: string | null;
  quantity: number;
  price: number;
  kind: OrderProductKind;
  /** Return status label (returned) or cancellation reason (cancelled). */
  note?: string;
  /** Whether the buyer has already reviewed this delivered item. */
  isReviewed?: boolean;
};

export type OrderTotalsView = {
  subtotal: number;
  userDiscount: number;
  couponDiscount: number;
  couponCode: string | null;
  campaignDiscount: number;
  cargoFee: number;
  codFee: number;
  paymentFee: number;
  returnTotal: number;
  total: number;
  paymentMethod: string;
};

export type OrderDetail = {
  id: number;
  orderNo: string;
  createdAt: string;
  deliveredAt: string;
  status: string;
  statusColor?: string;
  statusId: number;
  trackingCode: string | null;
  cargoCompanyName: string | null;
  invoicePdfUrl: string | null;
  shippingAddress: OrderAddress | null;
  billingAddress: OrderAddress | null;
  billingType: string;
  tcNumber: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  items: OrderDetailItem[];
  returnedItems: OrderDetailItem[];
  cancelledItems: OrderDetailItem[];
  totals: OrderTotalsView;
  totalItemsQty: number;
  returnedQty: number;
  cancelledQty: number;
  isFullyCancelled: boolean;
};
