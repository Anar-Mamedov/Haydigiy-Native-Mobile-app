import { Linking } from 'react-native';

/** Fatura PDF'ini sistemin görüntüleyicisinde açar; açılamazsa sessizce vazgeçer (ekran bozulmaz). */
export function openInvoicePdf(url: string) {
  Linking.openURL(url).catch(() => undefined);
}
