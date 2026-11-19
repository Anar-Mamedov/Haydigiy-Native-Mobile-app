import { AgreementBlock } from './agreement.types';

/**
 * Kayıt formundaki "açık rıza" bağlantısının açtığı metin — web kayıt formundaki
 * pencereyle aynı (frontend `src/components/legal/documents/ExplicitConsentText.tsx`).
 * Web'de ayrı bir sayfası yok; uygulamada yalnız uygulama içi bağlantıyla açılır.
 * Metin içi bağlantılar web yollarıyla `link` blokları olarak tutulur; ekran
 * bunları uygulama rotasına çevirir.
 */
export const EXPLICIT_CONSENT: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Haydigiy" veya "Şirket") olarak, açık rıza vermeniz halinde kişisel verilerinizi hangi amaçlarla işleyeceğimiz ve kimlerle paylaşacağımız konusunda sizi bilgilendirmek isteriz.',
  },
  { type: 'heading', text: 'Hangi kişisel verileriniz işlenir?' },
  {
    type: 'paragraph',
    text: 'Açık rızanızın bulunması halinde; kimlik ve iletişim bilgileriniz (ad, soyad, telefon numarası, e-posta adresi), haydigiy.com internet sitesi ve Haydigiy mobil uygulamasında ("Platform") üyelik hesabınızı kullanırken oluşan alışveriş, sipariş, sepet, favori ve gezinme bilgileriniz, kampanya etkileşimleriniz ve bu bilgilerden oluşturulan ilgi alanı, segment ve profil bilgileriniz işlenir.',
  },
  { type: 'heading', text: 'Hangi amaçlarla işlenir?' },
  { type: 'bullet', text: 'Size özel avantajlı teklif, indirim ve kuponların sunulması,' },
  {
    type: 'bullet',
    text: 'İlgi alanlarınıza ve alışveriş alışkanlıklarınıza uygun ürün önerilerinin hazırlanması ve Platform içeriğinin size göre kişiselleştirilmesi,',
  },
  {
    type: 'bullet',
    text: 'Pazarlama, reklam ve kampanya faaliyetlerinin planlanması, yürütülmesi ve sonuçlarının ölçülmesi,',
  },
  { type: 'bullet', text: 'Müşteri segmentasyonu, analiz ve raporlama çalışmalarının yapılması,' },
  { type: 'bullet', text: 'Sizi daha iyi tanıyarak memnuniyetinizin artırılmasına yönelik faaliyetlerin yürütülmesi.' },
  { type: 'heading', text: 'Nasıl toplanır ve hangi hukuki sebebe dayanır?' },
  {
    type: 'paragraph',
    text: 'Kişisel verileriniz Platform üzerinden elektronik ortamda, çerezler ve benzeri teknolojiler aracılığıyla otomatik yollarla toplanır ve 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun ("KVKK") 5. maddesinin 1. fıkrası uyarınca açık rızanıza dayanılarak işlenir.',
  },
  { type: 'heading', text: 'Kimlerle paylaşılır?' },
  {
    type: 'paragraph',
    text: 'Kişisel verileriniz yukarıdaki amaçlarla sınırlı olarak; pazarlama otomasyonu, kampanya yönetimi, reklam ve analiz hizmeti aldığımız iş ortaklarımız ve hizmet sağlayıcılarımızla (dijital reklam ve sosyal medya platformları dahil) ve talep edilmesi halinde yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir. Bu hizmet sağlayıcılardan bazılarının sunucuları yurt dışında bulunduğundan, kişisel verileriniz KVKK’nın 9. maddesinde öngörülen şartlara uygun olarak yurt dışına aktarılabilir.',
  },
  { type: 'heading', text: 'Rızanızı nasıl geri alabilirsiniz?' },
  {
    type: 'paragraph',
    text: 'Açık rıza vermek zorunlu değildir; vermemeniz üyeliğinizi ve alışverişlerinizi etkilemez. Rızanızı dilediğiniz zaman kvkk@haydigiy.com adresine yazarak ya da Aydınlatma Metni’nde belirtilen başvuru yöntemleriyle geri alabilirsiniz. Geri alma, bildirdiğiniz tarihten sonraki işlemler için geçerli olur.',
  },
  {
    type: 'paragraph',
    text: 'KVKK’nın 11. maddesinde sayılan haklarınız ve başvuru yöntemleri hakkında ayrıntılı bilgiye Aydınlatma Metni’nden ulaşabilirsiniz.',
  },
  { type: 'link', text: 'Aydınlatma Metni', href: '/kisisel-verilerin-korunmasi' },
  { type: 'paragraph', text: 'Son güncelleme: 18.11.2026' },
];
