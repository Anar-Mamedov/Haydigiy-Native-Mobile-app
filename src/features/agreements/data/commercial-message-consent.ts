import { AgreementBlock } from './agreement.types';

/**
 * Kayıt formundaki "elektronik ileti" bağlantısının açtığı Ticari Elektronik İleti
 * Bilgilendirme Metni — web kayıt formundaki pencereyle aynı (frontend
 * `src/components/legal/documents/ElectronicMessageText.tsx`). Web'de ayrı bir sayfası yok.
 * Metin içi bağlantılar web yollarıyla `link` blokları olarak tutulur; ekran
 * bunları uygulama rotasına çevirir.
 */
export const COMMERCIAL_MESSAGE_CONSENT: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'Ticari elektronik ileti onayı vermeniz halinde, Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Haydigiy") ile paylaştığınız kimlik bilgileriniz (ad, soyad) ve iletişim bilgileriniz (telefon numarası, e-posta adresi); kampanya, indirim, yeni ürün ve fırsat duyurularının SMS, e-posta ve telefon araması yoluyla tarafınıza iletilmesi, pazarlama ve kampanya iletişimlerinin yürütülmesi, bu iletişimlerin etkinliğinin ölçülmesi ve müşteri memnuniyetine yönelik faaliyetlerin yürütülmesi amaçlarıyla işlenecektir.',
  },
  {
    type: 'paragraph',
    text: 'Kişisel verileriniz, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun’un 6. maddesi ve Ticari İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca ticari elektronik ileti onayı şartına ve yalnızca ticari elektronik ileti gönderimi faaliyetiyle sınırlı olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun ("KVKK") 5. maddesinin 1. fıkrası uyarınca açık rıza hukuki sebebine dayanılarak işlenecektir.',
  },
  { type: 'heading', text: 'Kimlerle paylaşılır?' },
  {
    type: 'paragraph',
    text: 'Kişisel verileriniz yukarıdaki amaçlarla sınırlı olarak; ileti gönderimi için hizmet aldığımız SMS, e-posta ve çağrı hizmet sağlayıcılarıyla, pazarlama otomasyonu hizmeti aldığımız iş ortaklarımızla, onayınızın kaydedilmesi için İleti Yönetim Sistemi (İYS) ile ve talep edilmesi halinde yetkili kamu kurum ve kuruluşlarıyla paylaşılabilecektir.',
  },
  { type: 'heading', text: 'Tercihlerinizi nasıl değiştirebilirsiniz?' },
  {
    type: 'paragraph',
    text: 'Onay vermek zorunlu değildir. Ticari elektronik ileti tercihlerinizi dilediğiniz zaman Hesabım > Duyuru Tercihlerim sayfasından, size gönderilen iletilerde belirtilen ret yöntemiyle ya da İleti Yönetim Sistemi (iys.org.tr) üzerinden ücretsiz olarak değiştirebilirsiniz.',
  },
  {
    type: 'paragraph',
    text: 'Sipariş, ödeme, teslimat ve hesap güvenliği gibi konulardaki bilgilendirme mesajları ticari elektronik ileti niteliğinde olmadığından onayınızdan bağımsız olarak gönderilmeye devam eder.',
  },
  {
    type: 'paragraph',
    text: 'KVKK’nın 11. maddesinde sayılan haklarınız ve başvuru yöntemleri hakkında ayrıntılı bilgiye Aydınlatma Metni’nden ulaşabilirsiniz.',
  },
  { type: 'link', text: 'Aydınlatma Metni', href: '/kisisel-verilerin-korunmasi' },
  { type: 'paragraph', text: 'Son güncelleme: 18.11.2026' },
];
