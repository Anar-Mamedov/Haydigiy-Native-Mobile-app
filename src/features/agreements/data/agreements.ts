import { Agreement } from './agreement.types';
import { COOKIE_POLICY } from './cookie-policy';
import { TERMS_OF_USE } from './terms-of-use';
import { COOKIE_FRAME } from './cookie-frame';
import { KVKK_DISCLOSURE_NOTICE } from './kvkk-disclosure-notice';
import { SITE_PRIVACY_POLICY } from './site-privacy-policy';

/**
 * The five legal texts shown on the "Sözleşmeler" screen, in the web order.
 * Gizlilik Politikası ve Aydınlatma Metni, giriş ve kayıt ekranlarının açtığı
 * belgelerin aynısıdır (web Sözleşmeler de `PrivacyPolicyText` / `DisclosureText`
 * gösterir, HMA-77).
 */
export const AGREEMENTS: Agreement[] = [
  { id: 'cookie-policy', title: 'Çerez Politikası', blocks: COOKIE_POLICY },
  { id: 'privacy-policy', title: 'Gizlilik Politikası', blocks: SITE_PRIVACY_POLICY },
  { id: 'terms', title: 'Kullanım Koşulları', blocks: TERMS_OF_USE },
  { id: 'cookie-frame', title: 'Çerçeve Sözleşme', blocks: COOKIE_FRAME },
  { id: 'disclosure', title: 'Aydınlatma Metni', blocks: KVKK_DISCLOSURE_NOTICE },
];
