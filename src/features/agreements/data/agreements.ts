import { Agreement } from './agreement.types';
import { COOKIE_POLICY } from './cookie-policy';
import { PRIVACY_POLICY } from './privacy-policy';
import { TERMS_OF_USE } from './terms-of-use';
import { COOKIE_FRAME } from './cookie-frame';
import { DISCLOSURE } from './disclosure';

/** The five legal texts shown on the "Sözleşmeler" screen, in the web order. */
export const AGREEMENTS: Agreement[] = [
  { id: 'cookie-policy', title: 'Çerez Politikası', blocks: COOKIE_POLICY },
  { id: 'privacy', title: 'Kişisel Verilerin Korunması', blocks: PRIVACY_POLICY },
  { id: 'terms', title: 'Kullanım Koşulları', blocks: TERMS_OF_USE },
  { id: 'cookie-frame', title: 'Çerçeve Sözleşme', blocks: COOKIE_FRAME },
  { id: 'disclosure', title: 'Aydınlatma Metni', blocks: DISCLOSURE },
];
