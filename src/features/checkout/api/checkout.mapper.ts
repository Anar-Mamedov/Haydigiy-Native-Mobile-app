import { PaymentTypeDto } from '@/services/payment-type.service';
import { CargoCompanyDto } from '@/services/cargo.service';
import { CouponValidateResponseDto } from '@/services/coupon.service';
import {
  OrderByTokenResponseDto,
  PaymentRouterResponseDto,
} from '@/services/checkout.service';
import { InstallmentResponseDto } from '@/services/installment.service';
import { AddressDto } from '@/services/address.service';
import {
  AppliedCoupon,
  CargoCompany,
  CheckoutAddress,
  GarantiFormData,
  InstallmentPlan,
  OrderDetails,
  PaymentMethod,
} from '@/types/checkout.types';
import { parsePrice } from '../utils/parse-price';

export function mapPaymentMethod(dto: PaymentTypeDto): PaymentMethod {
  const cap = dto.max_order_total;
  const capValue = cap === null || cap === undefined || String(cap).trim() === '' ? null : Number(cap);
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    commissionRate: Number(dto.commission_rate) || 0,
    serviceFee: Number(dto.service_fee) || 0,
    sortOrder: Number(dto.sort_order) || 0,
    maxOrderTotal: capValue !== null && Number.isFinite(capValue) && capValue > 0 ? capValue : null,
  };
}

export function mapCargoCompany(dto: CargoCompanyDto): CargoCompany {
  return {
    id: dto.id,
    name: dto.name,
    logo: dto.logo,
    price: parsePrice(dto.price),
    sortOrder: Number(dto.sort_order) || 0,
  };
}

/** Maps the İyzico installment lookup into sorted, payable (≥2) installment plans. */
export function mapInstallmentPlans(
  dto: InstallmentResponseDto,
  amount: number,
): InstallmentPlan[] {
  const detail = Array.isArray(dto.installmentDetails) ? dto.installmentDetails[0] : undefined;
  const prices = Array.isArray(detail?.installmentPrices) ? detail.installmentPrices : [];

  return prices
    .map((item) => {
      const installment = Number(item.installmentNumber);
      const perMonth = Number(item.installmentPrice);
      const total = Number(item.totalPrice);
      const ratio = amount > 0 ? ((total - amount) / amount) * 100 : 0;
      return {
        installment,
        ratio: Number.isFinite(ratio) ? ratio : 0,
        total: Number.isFinite(total) ? total : 0,
        perMonth: Number.isFinite(perMonth) ? perMonth : 0,
      };
    })
    .filter((plan) => Number.isInteger(plan.installment) && plan.installment > 1 && plan.total > 0 && plan.perMonth > 0)
    .sort((a, b) => a.installment - b.installment);
}

export function mapAppliedCoupon(dto: CouponValidateResponseDto, fallbackCode: string): AppliedCoupon {
  return {
    code: dto.coupon_code || fallbackCode,
    discountType: dto.discount_type || 'fixed',
    discountValue: Number(dto.discount_value ?? 0),
    discount: Number(dto.discount ?? 0),
    isFreeShipping: Boolean(dto.is_free_shipping),
    isCombinable: dto.is_combinable,
  };
}

export function mapOrderDetails(dto: OrderByTokenResponseDto): OrderDetails {
  return {
    orderId: dto.id != null ? String(dto.id) : undefined,
    orderNo: dto.order_no,
    totalPrice: Number(dto.total_price) || 0,
  };
}

/**
 * Maps the raw `/addresses` record to a checkout address that keeps the location
 * IDs (needed for cargo availability) and email (needed for the Garanti form).
 * The list mapper in the address feature drops these, so checkout reads the raw DTO.
 */
export function mapCheckoutAddress(dto: AddressDto): CheckoutAddress {
  const raw = dto as Record<string, unknown>;
  const asNumber = (value: unknown): number => Number(value) || 0;
  const asString = (value: unknown): string => (value == null ? '' : String(value));
  const asFlag = (value: unknown): boolean => value === 1 || value === true || value === '1';

  return {
    id: dto.id,
    title: dto.title?.trim() || `${dto.name ?? ''} ${dto.surname ?? ''}`.trim(),
    name: dto.name ?? '',
    surname: dto.surname ?? '',
    email: typeof raw.email === 'string' && raw.email.trim() !== '' ? raw.email.trim() : null,
    phone: dto.phone ?? '',
    addressLine: dto.address_line ?? '',
    zipCode: asString(raw.zip_code),
    cityId: asNumber(raw.city_id),
    cityName: dto.city?.name || dto.city_name || '',
    districtId: asNumber(raw.district_id),
    districtName: dto.district?.name || dto.district_name || '',
    neighbourhoodId: asNumber(raw.neighbourhood_id),
    neighbourhoodName: dto.neighbourhood?.name || dto.neighbourhood_name || '',
    isDefault: asFlag(raw.is_default),
    isInvoice: asFlag(raw.is_invoice),
  };
}

// ---- Garanti router-response detection + mapping ----

function pick(obj: Record<string, unknown>, key: string): unknown {
  return obj?.[key];
}

/**
 * The router can return different gateways. PayTR is excluded; İş Bankası/Payten
 * are out of scope. A Garanti response carries a `gateway_url`/`fields` block and
 * none of the other gateways' markers.
 */
export function isGarantiRouterResponse(response: PaymentRouterResponseDto): boolean {
  const res = (response.data ?? response) as Record<string, unknown>;
  const action = typeof res.action === 'string' ? res.action : '';
  if (action.includes('paytr.com') || action.includes('asseco-see.com.tr')) return false;
  if ('OrderNumber' in res || 'MerchantNumber' in res) return false;
  const fields = (pick(res, 'fields') as Record<string, unknown>) ?? {};
  return Boolean(res.gateway_url || res.gatewayUrl || fields.secure3dhash || response.gateway_url);
}

export function mapGarantiForm(
  response: PaymentRouterResponseDto,
  installmentCount: number,
): GarantiFormData {
  const res = (response.data ?? response) as Record<string, unknown>;
  const fields = ((pick(res, 'fields') as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  const str = (value: unknown, fallback = ''): string => (value == null ? fallback : String(value));

  return {
    gatewayUrl: str(
      res.gateway_url ?? res.gatewayUrl ?? response.gateway_url,
      'https://sanalposprov.garanti.com.tr/servlet/gt3dengine',
    ),
    orderId: str(res.order_no ?? fields.orderid),
    amount: str(res.amount ?? fields.txnamount),
    currency: str(fields.txncurrencycode ?? res.currency, '949'),
    type: str(fields.txntype ?? res.type, 'sales'),
    hashedData: str(fields.secure3dhash ?? res.hashedData),
    terminalId: str(fields.terminalid ?? res.terminalId),
    merchantId: str(fields.terminalmerchantid ?? res.merchantId),
    provUserId: str(fields.terminalprovuserid ?? res.provUserId, 'PROVAUT'),
    storeKey: str(res.storeKey ?? fields.storekey),
    successUrl: str(fields.successurl ?? res.successUrl),
    errorUrl: str(fields.errorurl ?? res.errorUrl),
    customerIpAddress: str(fields.customeripaddress ?? res.customeripaddress),
    mode: str(fields.mode ?? res.mode, 'PROD'),
    apiVersion: str(fields.apiversion ?? res.apiversion, '512'),
    installmentCount: installmentCount > 1 ? installmentCount : 1,
  };
}
