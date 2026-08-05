import { useEffect, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { parseQuery } from '../utils/parse-query';
import { parsePrice } from '../utils/parse-price';
import { mapOrderDetails } from '../api/checkout.mapper';
import {
  getOrderByTokenDto,
  queryOrderDto,
  submitGarantiCallbackDto,
} from '@/services/checkout.service';
import { cartKeys } from '@/features/cart/api/cart.keys';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { insiderTracker } from '@/features/insider/services/insider-tracker';
import { cartItemToInsiderInput } from '@/features/insider/utils/insider-product.mapper';
import { consumePurchaseSnapshot } from '../utils/purchase-snapshot';
import { OrderDetails } from '@/types/checkout.types';

type SuccessParams = {
  url?: string;
  secureToken?: string;
  orderNo?: string;
  totalPrice?: string;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

/**
 * Drives the native success screen, mirroring the web `PaymentSuccessful`:
 * finalizes a Garanti 3D payment (`/garanti/callback`) when the intercepted URL
 * carries bank params, syncs the order (`/order/query`), then resolves the order
 * details (`/order/by-token`) for display and refreshes the cart.
 */
export function usePaymentSuccess(): { orderDetails: OrderDetails | null; isProcessing: boolean } {
  const rawParams = useLocalSearchParams<SuccessParams>();
  const queryClient = useQueryClient();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const processedRef = useRef(false);

  const url = firstValue(rawParams.url);
  const secureTokenParam = firstValue(rawParams.secureToken);
  const orderNoParam = firstValue(rawParams.orderNo);
  const totalPriceParam = firstValue(rawParams.totalPrice);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const run = async () => {
      const query = parseQuery(url);
      const get = (...keys: string[]): string => {
        for (const key of keys) {
          if (query[key] && query[key].trim() !== '') return query[key];
        }
        return '';
      };

      const mdStatus = get('mdstatus', 'mdStatus');
      const procReturnCode = get('procreturncode', 'ProcReturnCode');
      const bankOrderNo = get('order_no', 'orderid', 'oid', 'merchant_oid', 'OrderId');
      const token = get('order_token', 'secure_token') || secureTokenParam;
      const totalPrice = get('total_price') || totalPriceParam;

      // Garanti: finalize the order from the bank params (idempotent if already done).
      if (mdStatus && procReturnCode) {
        const body: Record<string, string> = {};
        Object.entries(query).forEach(([key, value]) => {
          if (key !== 'order_no' && key !== 'total_price') body[key] = value;
        });
        try {
          await submitGarantiCallbackDto(body);
        } catch {
          // Backend may already have finalized via its own callback; ignore.
        }
      }

      if (bankOrderNo) {
        try {
          await queryOrderDto(bankOrderNo);
        } catch {
          // Non-fatal sync; details still resolve below.
        }
      }

      let details: OrderDetails | null = null;
      if (token) {
        try {
          const dto = await getOrderByTokenDto(token);
          if (dto?.order_no) details = mapOrderDetails(dto);
        } catch {
          // fall through to param-based fallback
        }
      }

      if (!details) {
        details = {
          orderNo: bankOrderNo || orderNoParam || token,
          totalPrice: parsePrice(totalPrice),
        };
      }

      // Insider purchase: sipariş satırları submit anında alınan snapshot'tan
      // gelir (sepet bu noktada boşalmış olabilir); yoksa hâlâ dolu olan sepete
      // düşülür. `consume` tek seferlik olduğundan event mükerrer atılmaz.
      const purchasedItems = consumePurchaseSnapshot() ?? useCartStore.getState().items;
      const saleId = details.orderNo || token;
      if (saleId && purchasedItems.length > 0) {
        insiderTracker.trackPurchase(saleId, purchasedItems.map(cartItemToInsiderInput));
      }

      setOrderDetails(details);
      setIsProcessing(false);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    };

    void run();
  }, [url, secureTokenParam, orderNoParam, totalPriceParam, queryClient]);

  return { orderDetails, isProcessing };
}
