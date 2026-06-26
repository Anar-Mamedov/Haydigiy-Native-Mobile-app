import { CardFormValues, GarantiFormData } from '@/types/checkout.types';

function escapeAttr(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function hiddenInput(name: string, value: string | number): string {
  return `<input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(value)}" />`;
}

/**
 * Builds a self-submitting HTML page that POSTs the Garanti 3D Secure form to the
 * bank gateway. Loaded in the payment WebView (`source={{ html }}`), it mirrors the
 * web `createAndSubmitGarantiForm`: the bank then redirects through the callback
 * chain to `/odeme-basarili` or `/odeme-basarisiz`, which the WebView intercepts.
 */
export function buildGarantiFormHtml(
  garanti: GarantiFormData,
  card: CardFormValues,
  customerEmail: string | null,
  clientIp: string,
): string {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const cardNumber = card.number.replace(/\s/g, '');
  const expiryYear = card.expiryYear.length === 4 ? card.expiryYear.slice(-2) : card.expiryYear;
  const installment = garanti.installmentCount > 1 ? String(garanti.installmentCount) : '';

  const fields: [string, string | number][] = [
    ['mode', garanti.mode],
    ['apiversion', garanti.apiVersion],
    ['secure3dsecuritylevel', '3D_PAY'],
    ['lang', 'tr'],
    ['terminalid', garanti.terminalId],
    ['terminalmerchantid', garanti.merchantId],
    ['terminaluserid', 'GARANTI'],
    ['terminalprovuserid', garanti.provUserId],
    ['orderid', garanti.orderId],
    ['txntype', garanti.type],
    ['txnamount', garanti.amount],
    ['txncurrencycode', garanti.currency],
    ['txninstallmentcount', installment],
    ['txntimestamp', timestamp],
    ['refreshtime', '1'],
    ['secure3dhash', garanti.hashedData],
    ['successurl', garanti.successUrl],
    ['errorurl', garanti.errorUrl],
    ['customeripaddress', clientIp],
    ['customeremailaddress', customerEmail || 'siparis@haydigiy.com'],
    ['companyname', 'HaydiGiy'],
    ['cardholdername', card.owner],
    ['cardnumber', cardNumber],
    ['cardexpiredatemonth', card.expiryMonth.padStart(2, '0')],
    ['cardexpiredateyear', expiryYear],
    ['cardcvv2', card.cvv],
  ];

  const inputs = fields.map(([name, value]) => hiddenInput(name, value)).join('\n      ');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  </head>
  <body>
    <form id="garanti3d" method="post" action="${escapeAttr(garanti.gatewayUrl)}">
      ${inputs}
    </form>
    <script>document.getElementById('garanti3d').submit();</script>
  </body>
</html>`;
}
