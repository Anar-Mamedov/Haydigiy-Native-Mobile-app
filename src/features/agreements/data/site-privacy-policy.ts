import { AgreementBlock } from './agreement.types';

/**
 * Gizlilik Politikası — web `/gizlilik-politikasi` sayfasıyla aynı metin (frontend
 * `src/components/legal/documents/PrivacyPolicyText.tsx`). Mevcut `PRIVACY_POLICY` ise
 * Sözleşmeler'deki "Kişisel Verilerin Korunması" metnidir; bu ondan ayrıdır.
 * Metin içi bağlantılar web yollarıyla `link` blokları olarak tutulur; ekran
 * bunları uygulama rotasına çevirir.
 */
export const SITE_PRIVACY_POLICY: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Haydigiy") olarak haydigiy.com internet sitesini ve Haydigiy mobil uygulamasını (birlikte "Platform") kullanırken gizliliğinize önem veriyoruz. Bu Gizlilik Politikası, kişisel verilerinizi nasıl topladığımızı, ne için kullandığımızı, kimlerle paylaştığımızı ve nasıl koruduğumuzu özetler.',
  },
  {
    type: 'paragraph',
    text: 'Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi Aydınlatma Metni’nde, çerezlere ilişkin bilgi Çerez Politikası’nda yer alır.',
  },
  { type: 'link', text: 'Aydınlatma Metni', href: '/kisisel-verilerin-korunmasi' },
  { type: 'link', text: 'Çerez Politikası', href: '/cerez-politikasi' },
  { type: 'heading', text: '1. Hangi bilgileri topluyoruz?' },
  {
    type: 'bullet',
    text: 'Üyelik bilgileri: ad, soyad, telefon numarası, e-posta adresi ve eklemeniz halinde doğum tarihi ve cinsiyet.',
  },
  {
    type: 'bullet',
    text: 'Sipariş bilgileri: teslimat ve fatura adresleri, sipariş, ödeme, iptal, iade ve değişim bilgileri. Ödeme kartı bilgileriniz Haydigiy tarafından görüntülenmez ve saklanmaz; ödemeler anlaşmalı banka ve ödeme kuruluşlarının altyapısında gerçekleşir.',
  },
  {
    type: 'bullet',
    text: 'Paylaştığınız içerikler: ürün yorumları, puanlar, sorular, eklediğiniz fotoğraflar ve müşteri hizmetleriyle yazışmalarınız.',
  },
  {
    type: 'bullet',
    text: 'Cihaz ve kullanım bilgileri: IP adresi, cihaz ve tarayıcı bilgileri, oturum kayıtları ve çerezler aracılığıyla elde edilen gezinme bilgileri.',
  },
  { type: 'heading', text: '2. Bilgilerinizi ne için kullanıyoruz?' },
  { type: 'bullet', text: 'Üyelik hesabınızı oluşturmak ve hesabınızın güvenliğini sağlamak,' },
  { type: 'bullet', text: 'Siparişlerinizi almak, teslim etmek ve iptal, iade ve değişim taleplerinizi yürütmek,' },
  { type: 'bullet', text: 'Sorularınızı ve taleplerinizi yanıtlamak, sipariş durumunuz hakkında sizi bilgilendirmek,' },
  { type: 'bullet', text: 'Yasal yükümlülüklerimizi yerine getirmek ve dolandırıcılığı önlemek,' },
  {
    type: 'bullet',
    text: 'İzin vermeniz halinde size kampanya ve fırsatları iletmek ve önerileri ilgi alanlarınıza göre kişiselleştirmek.',
  },
  { type: 'heading', text: '3. Bilgilerinizi kimlerle paylaşıyoruz?' },
  {
    type: 'paragraph',
    text: 'Bilgilerinizi yalnızca gerektiği kadarıyla; teslimat için kargo firmalarıyla, ödeme için banka ve ödeme kuruluşlarıyla, Platform’un çalışması için hizmet aldığımız bilişim ve iletişim hizmet sağlayıcılarıyla, izin vermeniz halinde pazarlama ve analiz iş ortaklarıyla ve mevzuatın gerektirdiği durumlarda yetkili kamu kurum ve kuruluşlarıyla paylaşırız. Alıcılar ve aktarım koşulları Aydınlatma Metni’nde ayrıntılı olarak yer alır.',
  },
  { type: 'heading', text: '4. Çerezler' },
  {
    type: 'paragraph',
    text: 'Platform’un çalışması, tercihlerinizin hatırlanması, kullanımın ölçülmesi ve reklamların kişiselleştirilmesi için çerezler kullanırız. Hangi çerezleri kullandığımız ve tercihlerinizi nasıl yönetebileceğiniz Çerez Politikası’nda açıklanmıştır.',
  },
  { type: 'link', text: 'Çerez Politikası', href: '/cerez-politikasi' },
  { type: 'heading', text: '5. İletişim tercihleriniz' },
  {
    type: 'paragraph',
    text: 'Kampanya ve duyuruları e-posta, SMS, telefon araması veya WhatsApp ile almak isteyip istemediğinizi dilediğiniz zaman Hesabım > Duyuru Tercihlerim sayfasından değiştirebilirsiniz. Ticari elektronik ileti onayınızı ayrıca iletilerde belirtilen ret yöntemiyle ya da İleti Yönetim Sistemi (iys.org.tr) üzerinden geri alabilirsiniz. Sipariş ve hesap güvenliğine ilişkin bilgilendirmeler bu tercihlerden bağımsız olarak gönderilir.',
  },
  { type: 'heading', text: '6. Bilgilerinizi nasıl koruyoruz?' },
  {
    type: 'paragraph',
    text: 'Platform ile cihazınız arasındaki veri trafiği SSL/TLS ile şifrelenir, şifreniz şifrelenmiş olarak saklanır ve kişisel verilere yalnızca görevi gereği yetkilendirilmiş çalışanlar erişebilir. Sistemlerimiz düzenli olarak güvenlik testlerinden geçirilir.',
  },
  { type: 'heading', text: '7. Bilgilerinizi ne kadar süre saklıyoruz?' },
  {
    type: 'paragraph',
    text: 'Bilgilerinizi işlenme amacının gerektirdiği süre ve mevzuatta öngörülen saklama süreleri boyunca saklarız; bu sürelerin sonunda silinir, yok edilir veya anonim hale getirilir.',
  },
  { type: 'heading', text: '8. Haklarınız' },
  {
    type: 'paragraph',
    text: '6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 11. maddesi kapsamında kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve işlenmesine itiraz etme gibi haklara sahipsiniz. Başvuru yöntemleri Aydınlatma Metni’nde yer alır; taleplerinizi kvkk@haydigiy.com adresine de iletebilirsiniz.',
  },
  { type: 'link', text: 'Aydınlatma Metni', href: '/kisisel-verilerin-korunmasi' },
  { type: 'heading', text: '9. Yaş sınırı' },
  { type: 'paragraph', text: 'Platform’a üye olabilmek için reşit olmak gerekir (Üyelik Sözleşmesi).' },
  { type: 'link', text: 'Üyelik Sözleşmesi', href: '/uyelik-sozlesmesi' },
  { type: 'heading', text: '10. Değişiklikler ve iletişim' },
  {
    type: 'paragraph',
    text: 'Haydigiy bu Gizlilik Politikası’nı mevzuattaki ve uygulamalarındaki değişikliklere göre güncelleyebilir; güncel metin bu sayfada yayımlanır.',
  },
  {
    type: 'paragraph',
    text: 'Sorularınız için: Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi, Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde · 0850 259 04 49 · info@haydigiy.com',
  },
  { type: 'paragraph', text: 'Son güncelleme: 18.11.2026' },
];
