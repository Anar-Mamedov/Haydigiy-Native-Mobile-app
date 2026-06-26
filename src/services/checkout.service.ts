import { apiClient } from '@/lib/axios';
import { appEnv } from '@/lib/env';

/** Platform header sent with order-token / İyzico calls, mirroring the web `X-Platform-Id`. */
const PLATFORM_ID = 'mobile';

// ---- /order/token (sync cargo, payment method, total, coupon, addresses) ----

export interface OrderTokenRequestDto {
  order_token: string;
  cargo_id: number;
  payment_method_id: number;
  total_price: string;
  installment_count: number;
  coupon_code?: string;
  shipping_address_id?: number;
  billing_address_id?: number;
}

export interface OrderTokenCouponDto {
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount: number;
  is_free_shipping: boolean;
}

export interface OrderTokenResponseDto {
  message?: string;
  total_price?: number | string;
  coupon?: OrderTokenCouponDto;
  coupon_error?: string;
  garanti?: Record<string, string | number | undefined>;
}

export async function updateOrderTokenDto(
  data: OrderTokenRequestDto,
): Promise<OrderTokenResponseDto> {
  const response = await apiClient.post<OrderTokenResponseDto>('/order/token', data, {
    headers: { 'X-Platform-Id': PLATFORM_ID },
  });
  return response.data;
}

// ---- /payment-router (single payment → returns the gateway form, e.g. Garanti) ----

export interface PaymentRouterRequestDto {
  total_price: number;
  installment_count: number;
  order_token?: string;
  cargo_id?: number;
  payment_method_id?: number;
  basket: { name: string; price: number; quantity: number }[];
  card_number: string;
  expire_month: string;
  expire_year: string;
  cvv: string;
  customer_ip: string;
}

export interface PaymentRouterResponseDto {
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function routePaymentDto(
  data: PaymentRouterRequestDto,
): Promise<PaymentRouterResponseDto> {
  const response = await apiClient.post<PaymentRouterResponseDto>('/payment-router', data);
  return response.data;
}

// ---- /iyzico-prod/3ds/initialize (installment payment → returns 3DS HTML/URL) ----

export interface Iyzico3dsInitializeRequestDto {
  order_token: string;
  cargo_id?: number;
  payment_method_id?: number;
  installment?: number;
  total_price?: number;
  paymentCard: {
    cardHolderName: string;
    cardNumber: string;
    expireYear: string;
    expireMonth: string;
    cvc: string;
    registerCard?: '0' | '1';
  };
}

export interface Iyzico3dsInitializeResponseDto {
  status?: string;
  message?: string;
  paymentPageUrl?: string;
  callbackUrl?: string;
  url?: string;
  threeDSHtmlContent?: string;
  checkoutFormContent?: string;
  data?: {
    paymentPageUrl?: string;
    callbackUrl?: string;
    url?: string;
    threeDSHtmlContent?: string;
    checkoutFormContent?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

export async function initializeIyzico3dsDto(
  data: Iyzico3dsInitializeRequestDto,
): Promise<Iyzico3dsInitializeResponseDto> {
  const response = await apiClient.post<Iyzico3dsInitializeResponseDto>(
    '/iyzico-prod/3ds/initialize',
    data,
    { headers: { 'X-Platform-Id': PLATFORM_ID } },
  );
  return response.data;
}

// ---- /order/confirm (Garanti pre-confirm + non-card methods like Kapıda Ödeme) ----

export interface OrderConfirmRequestDto {
  order_token: string;
  payment_method_id: number;
  shipping_address_id: number;
  billing_address_id: number;
  cargo_id: number;
  total_price?: string;
  payment_info?: {
    card_first_4?: string;
    card_last_6?: string;
    installment_count?: number;
  };
}

export interface OrderConfirmResponseDto {
  message?: string;
  order_no?: string;
  order_token?: string;
  status_id?: number;
  order?: { secure_token?: string };
}

export async function confirmOrderDto(
  data: OrderConfirmRequestDto,
): Promise<OrderConfirmResponseDto> {
  const response = await apiClient.post<OrderConfirmResponseDto>('/order/confirm', data);
  return response.data;
}

// ---- Order detail lookups used by the success screen ----

export interface OrderByTokenResponseDto {
  id?: number;
  order_no: string;
  total_price: number;
}

export async function getOrderByTokenDto(token: string): Promise<OrderByTokenResponseDto | null> {
  if (!appEnv.apiBaseUrl || !token) return null;
  const response = await apiClient.get<OrderByTokenResponseDto>('/order/by-token', {
    params: { token },
  });
  return response.data ?? null;
}

/** Sync/poll an order's status by bank order number (`GET /order/query/{no}`). */
export async function queryOrderDto(orderNo: string): Promise<void> {
  if (!appEnv.apiBaseUrl || !orderNo) return;
  await apiClient.get(`/order/query/${encodeURIComponent(orderNo)}`);
}

/** Finalize a Garanti 3D payment from the intercepted callback params (`POST /garanti/callback`). */
export async function submitGarantiCallbackDto(
  params: Record<string, string>,
): Promise<void> {
  if (!appEnv.apiBaseUrl) return;
  const body = new URLSearchParams(params).toString();
  await apiClient.post('/garanti/callback', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
}

/**
 * Best-effort public IP for the gateway request. The web reads it from a Next.js
 * route (`/api/get-client-ip`) that has no mobile equivalent, so we query a public
 * echo service and fall back to localhost — the backend also derives it server-side.
 */
export async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    if (response.ok) {
      const data = (await response.json()) as { ip?: string };
      const ip = data?.ip?.trim();
      if (ip && /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return ip;
    }
  } catch {
    // ignore — fall through to localhost fallback
  }
  return '127.0.0.1';
}
