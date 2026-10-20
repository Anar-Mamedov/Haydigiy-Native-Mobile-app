import { renderHook } from '@testing-library/react-native';
import { useOpenInvoiceFromParam } from './use-open-invoice-from-param';

const INVOICE_URL = 'https://cdn.haydigiy.com/invoice/100001.pdf';

type Props = {
  param: string | string[] | undefined;
  order: { invoicePdfUrl: string | null } | null | undefined;
};

const renderInvoiceHook = (initialProps: Props) => {
  const openInvoice = jest.fn();
  const view = renderHook(
    ({ param, order }: Props) => useOpenInvoiceFromParam(param, order, openInvoice),
    { initialProps },
  );
  return { ...view, openInvoice };
};

describe('useOpenInvoiceFromParam', () => {
  it('fatura=1 ile gelen ekranda sipariş yüklenince faturayı bir kez açar', () => {
    const { openInvoice, rerender } = renderInvoiceHook({ param: '1', order: undefined });
    expect(openInvoice).not.toHaveBeenCalled();

    rerender({ param: '1', order: null });
    expect(openInvoice).not.toHaveBeenCalled();

    rerender({ param: '1', order: { invoicePdfUrl: INVOICE_URL } });
    expect(openInvoice).toHaveBeenCalledTimes(1);
    expect(openInvoice).toHaveBeenCalledWith(INVOICE_URL);
  });

  it('yenilemede gelen yeni sipariş verisi faturayı yeniden açmaz', () => {
    const { openInvoice, rerender } = renderInvoiceHook({
      param: '1',
      order: { invoicePdfUrl: INVOICE_URL },
    });

    rerender({ param: '1', order: { invoicePdfUrl: INVOICE_URL } });
    expect(openInvoice).toHaveBeenCalledTimes(1);
  });

  it('faturası olmayan siparişte hiçbir şey açmaz, fatura sonradan gelse de açmaz', () => {
    const { openInvoice, rerender } = renderInvoiceHook({ param: '1', order: { invoicePdfUrl: null } });

    rerender({ param: '1', order: { invoicePdfUrl: INVOICE_URL } });
    expect(openInvoice).not.toHaveBeenCalled();
  });

  it.each([undefined, '0', ['1', '1']])('fatura parametresi %p ise açmaz', (param) => {
    const { openInvoice } = renderInvoiceHook({ param, order: { invoicePdfUrl: INVOICE_URL } });
    expect(openInvoice).not.toHaveBeenCalled();
  });
});
