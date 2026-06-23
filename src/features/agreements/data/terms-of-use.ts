import { AgreementBlock } from './agreement.types';

/** "Kullanım Koşulları" — mirrors the web TermsOfUseContent. */
export const TERMS_OF_USE: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'İşbu kullanıcı koşulları Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde adresinde mukim Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Şirket" olarak anılacaktır) tarafından Şirket\'in sahibi olduğu "platform"un kullanımına ilişkin hususları belirlemek amacıyla hazırlanmıştır.',
  },
  {
    type: 'paragraph',
    text: 'haydigiy.com web sitesini ve mobil uygulamasını ziyaret etmek, üyelik oluşturmadan veya üyelik oluşturmak suretiyle bu kullanım koşullarını kayıtsız şartsız kabul ettiğinizi, Şirket\'in dilediği zaman bu kullanım koşullarında değişiklik yapabileceğini ve bu değişikliklerin web sitesinde yayınlanmakla yürürlüğe gireceğini kayıtsız şartsız kabul etmiş bulunursunuz. Eğer buna rızanız yoksa kullanımı derhal durdurunuz.',
  },
  { type: 'paragraph', text: 'Kullanım koşullarında yer alan bazı teknik terimlerin anlamı aşağıdaki gibidir:' },

  { type: 'heading', text: '1. Tanımlar' },
  {
    type: 'term',
    term: 'Platform',
    text: 'Mülkiyeti ve her türlü fikri ve sınai hakları Şirket\'e ait olan ve işbu sözleşmede anılan hizmetlerin sunulmakta olduğu haydigiy.com internet sitesi ile mobil uygulamayı ifade eder.',
  },
  {
    type: 'term',
    term: 'Hizmet/Hizmetler',
    text: 'Satıcının ürünlerini platform üzerinden yayınlayarak satışa çıkarmasını ve ürün teslimatını sağlayan sanal mağazadaki Şirket tarafından yürütülen uygulamaları ifade eder.',
  },
  { type: 'term', term: 'Alıcı', text: 'Platform üzerinden ürün alan gerçek ve tüzel kişileri ifade eder.' },
  {
    type: 'term',
    term: 'Satıcı',
    text: 'Platform üzerinden ürünlerini satışa sunan Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi\'ni ifade eder.',
  },
  { type: 'term', term: 'İşgünü', text: 'Resmî tatil ve cumartesi ile pazar günleri dışındaki günleri ifade eder.' },
  {
    type: 'term',
    term: 'İçerik',
    text: 'Platformda yayınlanan ve erişimi mümkün olan her türlü bilgi, yazı, dosya, resim, video vb. görsel/işitsel/yazımsal imgeleri ifade eder.',
  },
  {
    type: 'term',
    term: 'Kişisel Veri',
    text: '6698 sayılı Kişisel Verilerin Korunması Hakkında Kanun\'a göre kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgidir.',
  },

  { type: 'heading', text: '2. İçerik ve Kullanıcı Sorumluluğu' },
  { type: 'paragraph', text: 'Kullanıcılar tarafından sağlanan içeriklerden doğabilecek hukuki ve cezai sorumluluk kullanıcının şahsına aittir.' },
  {
    type: 'paragraph',
    text: 'Şirket, platformdaki hizmetleri bu sözleşmede belirtilen şartlar çerçevesinde sunmak üzere gerekli altyapıyı sağlamakla birlikte, kesintisiz veya hatasız hizmet taahhüdünde bulunmamaktadır. Şirket, bakım, onarım, teknik aksaklıklar veya benzeri nedenlerle hizmetleri askıya alabilir ya da sona erdirebilir.',
  },
  {
    type: 'paragraph',
    text: 'Platform üzerinden üçüncü kişilere ait internet sitelerine veya içeriklere verilen linkler yalnızca erişim kolaylığı sağlamak amacıyla sunulmakta olup, bu sitelerin içeriklerinden Şirket sorumlu değildir.',
  },

  { type: 'heading', text: '3. Kullanım Kuralları' },
  { type: 'paragraph', text: 'Kullanıcılar platformu hukuka uygun şekilde kullanmakla yükümlüdür. Hukuka aykırı her türlü işlemden doğan sorumluluk kullanıcıya aittir.' },
  {
    type: 'paragraph',
    text: 'Platformun güvenliğini tehdit edecek, sistemlere yetkisiz erişim sağlamaya yönelik girişimler, tersine mühendislik faaliyetleri, platforma zarar verecek yazılımlar kullanılması kesinlikle yasaktır.',
  },
  { type: 'paragraph', text: 'Bu hükümlere aykırı davranan kullanıcılar, Şirket\'in doğrudan veya dolaylı tüm zararlarını tazmin etmekle yükümlüdür.' },

  { type: 'heading', text: '4. Kişisel Verilerin Korunması' },
  {
    type: 'paragraph',
    text: 'Şirket, kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu\'na uygun şekilde işlemekte olup, detaylı bilgi Kişisel Verilerin Korunması Aydınlatma Metni ve Çerez Politikası\'nda yer almaktadır.',
  },
  { type: 'paragraph', text: 'Mevzuat gereği yetkili kamu kurum ve kuruluşlarına yapılması zorunlu açıklamalar kapsamında, kullanıcı verileri ilgili mevzuata uygun şekilde paylaşılabilir.' },
  { type: 'paragraph', text: 'Kullanıcılar, platform üzerinden elde ettikleri kişisel verilerin güvenliğinden bizzat sorumludur.' },

  { type: 'heading', text: '5. Fikri Mülkiyet Hakları' },
  {
    type: 'paragraph',
    text: 'haydigiy.com\'da yer alan tüm görsel, yazılı ve dijital içerikler ile alan adı, logo, yazılım ve iş modeli Şirket\'e aittir veya lisanslıdır. İzinsiz kullanımı yasaktır.',
  },
  { type: 'paragraph', text: 'Platform tasarımı ve altyapısında kullanılan yazılımlar kopyalanamaz, çoğaltılamaz ve ticari amaçla kullanılamaz.' },

  { type: 'heading', text: '6. Ödeme Güvenliği' },
  { type: 'paragraph', text: 'Kredi kartı işlemleri ilgili banka veya ödeme kuruluşları tarafından gerçekleştirilmekte olup, kart bilgileri Şirket tarafından görülmez ve kaydedilmez.' },
  { type: 'paragraph', text: 'Üyelik ve ödeme sırasında girilen bilgiler üçüncü kişiler tarafından görüntülenemez.' },

  { type: 'heading', text: '7. Değişiklik Hakkı' },
  { type: 'paragraph', text: 'Şirket, platformda ve kullanım koşullarında her zaman değişiklik yapma hakkını saklı tutar. Kullanıcılar, platformu mevcut haliyle kabul etmiş sayılır.' },
];
