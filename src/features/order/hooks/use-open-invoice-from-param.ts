import { useEffect, useRef } from 'react';
import type { OrderDetail } from '@/types/order.types';
import { openInvoicePdf } from '../utils/open-invoice-pdf';

/**
 * Haydi Asistan'ın "Faturamı aç" bağlantısı sipariş ekranını `?fatura=1` ile açar. Sipariş ilk
 * yüklendiğinde fatura hazırsa fatura, "Fatura" düğmesiyle aynı yoldan bir kez açılır. Fatura yoksa
 * (sohbetteki eski düğme, elle yazılmış adres, fatura sonradan kalktı) ekran normal açılır, hata
 * gösterilmez. Aşağı çekip yenilemek ya da faturadan geri dönmek faturayı yeniden açmaz.
 */
export function useOpenInvoiceFromParam(
  invoiceParam: string | string[] | undefined,
  order: Pick<OrderDetail, 'invoicePdfUrl'> | null | undefined,
  openInvoice: (url: string) => void = openInvoicePdf,
) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!order || handledRef.current) return;
    handledRef.current = true;
    if (invoiceParam === '1' && order.invoicePdfUrl) openInvoice(order.invoicePdfUrl);
  }, [invoiceParam, openInvoice, order]);
}
