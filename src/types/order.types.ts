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
  email: string | null;
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
  /** When true the line cannot be returned (e.g. hygiene products). */
  isNonReturnable?: boolean;
  /** `available` | `gift_product` | other backend label. */
  returnStatus?: string;
  // ---- Return metadata (kind === 'returned', web order-detail parity) ----
  returnRequestId?: number | null;
  returnCode?: string | null;
  returnRequestedAt?: string | null;
  returnReceivedAt?: string | null;
  /** Normalized return status code (1 beklemede … 7 ödeme iadesi), null when unknown. */
  returnStatusCode?: number | null;
  /** Backend status label for the chip; empty → "İşlem Bekliyor". */
  returnStatusName?: string | null;
  // ---- Cancellation metadata (kind === 'cancelled') ----
  cancelledAt?: string | null;
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
  /** Cash/upfront total (peşin toplam). */
  total: number;
  paymentMethod: string;
  /** Installment count when paid in installments (> 1), else null. */
  installmentCount: number | null;
  /** Installment interest amount (vade farkı), 0 when none. */
  interestAmount: number;
  /** Total with installment interest (taksitli toplam), 0 when none. */
  totalWithInterest: number;
  /** Whether any installment info should be shown. */
  hasInstallmentInfo: boolean;
  /** Amount actually charged: installment total when applicable, else `total`. */
  payableTotal: number;
};

export type CancellationReason = { id: number; name: string };

export type ReturnReason = { id: number; name: string };

export type ReturnMethod = 'ptt' | 'hepsijet';

/** A return photo selected from the device, as an RN multipart file part. */
export type ReturnPhoto = { uri: string; name: string; type: string };

/** A single line the user wants to return (one unit per entry, like the web flow). */
export type ReturnSubmitItem = {
  orderItemId: number;
  quantity: number;
  returnReasonId: number;
  photo?: ReturnPhoto | null;
};

/** A saved refund IBAN (shown when the order was paid by bank transfer). */
export type PaymentMethod = {
  id: number;
  iban: string;
  ibanName: string;
  isDefault: boolean;
};

/** A city / district / neighbourhood option for the manual pickup address. */
export type LocationOption = { id: string; name: string };

/** A user's saved address, used for the scheduled (Hepsijet) return pickup. */
export type SavedAddress = {
  id: string;
  title: string;
  name: string;
  surname: string;
  phone: string;
  addressLine: string;
  city: string;
  district: string;
  neighbourhood: string;
};

/** A fully resolved pickup address (saved or manual) ready for a Hepsijet send. */
export type ResolvedAddress = {
  city: string;
  town: string;
  district: string;
  addressLine1: string;
  name: string;
  surname: string;
  phone: string;
};

export type CancelItem = {
  orderItemId: number;
  quantity: number;
  cancellationReasonId?: number;
};

export type BrokenCampaign = {
  id: number;
  name: string;
  type: string;
  minOrderAmount: number;
};

export type CancelPreview = {
  campaignWillBreak: boolean;
  currentTotal: number;
  newTotal: number;
  cancelledAmount: number;
  currentCargoFee: number;
  newCargoFee: number;
  netRefundAmount: number;
  brokenCampaigns: BrokenCampaign[];
  wasFreeShipping: boolean;
  addedCargoFee: number;
  cancellationBlocked: boolean;
  blockMessage: string | null;
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
  /** Backend payment method id; 2/3 (bank transfer) require an IBAN for refunds. */
  paymentMethodId: number | null;
  /** Whether a return request can be created for this order. */
  canCreateReturnRequest: boolean;
  /** `time_expired` | `not_delivered` | `already_requested` | other, when blocked. */
  returnBlockReason: string | null;
  /** Last return-request date (delivery + 13 days), `DD.MM.YYYY`, or null. */
  returnDeadline: string | null;
  /** Existing return request ids (latest used for the PTT re-create fallback). */
  returnRequestIds: number[];
  /** Pending return request that can still be cancelled (web parity), else null. */
  cancellableReturnRequestId: number | null;
  /** True when any return line was created as a Hepsijet home pickup. */
  hasHepsijetReturn: boolean;
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
