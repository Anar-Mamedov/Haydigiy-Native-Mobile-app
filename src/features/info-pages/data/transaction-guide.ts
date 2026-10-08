import { AgreementBlock } from '@/features/agreements/data/agreement.types';

/** "İşlem Rehberi" — web `/islem-rehberi` sayfasının içeriği. */
export const TRANSACTION_GUIDE: AgreementBlock[] = [
  { type: 'heading', text: 'I. Teknik Adımlar' },
  {
    type: 'paragraph',
    text: 'Üye olarak alışveriş yapmak istiyorsanız öncelikle üye ol alanından üyelik oluşturunuz.',
  },
  {
    type: 'paragraph',
    text: 'İlgilendiğiniz ürünün üstüne tıklayarak ürün detayını görerek ürünü inceleyiniz.',
  },
  {
    type: 'paragraph',
    text: 'Satın almak istediğiniz ürünü seçerek alışveriş sepetinize ekleyiniz.',
  },
  {
    type: 'paragraph',
    text: 'Tek seferde birden fazla farklı ürün almak istiyorsanız ürün sayfalarından devam ediniz.',
  },
  { type: 'paragraph', text: 'Teslimat için gerekli adres ve iletişim bilgilerinizi giriniz.' },
  { type: 'paragraph', text: 'Ödeme yönteminizi seçiniz.' },
  { type: 'paragraph', text: 'Sipariş Özetinizi Kontrol ediniz.' },
  {
    type: 'paragraph',
    text: 'Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okuyarak kabul etmeniz durumunda ilgili kutucuğu tıklayınız.',
  },
  {
    type: 'paragraph',
    text: 'II. Sitemizden yaptığınız alışverişe dair Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi, elektronik ortamda 2 yıl süre ile saklanır. 2 yıl boyunca sitemizden yaptığınız tüm alışverişlerle ilgili sözleşmelere Siparişlerim sayfasından ulaşabilirsiniz. 2 yıldan sonra 8 yıl boyunca siparişinize dair bilgiler elektronik ortamda tarafımızca arşivlenerek saklanır.',
  },
  {
    type: 'paragraph',
    text: 'III. Siparişinizi onaylamadan önce siparişinizde değişiklik yapmak isterseniz Sipariş Özetinizin sunulduğu sayfadaki geri al veya değiştir butonlarını kullanarak ürün-adres bilgisi-ödeme yönetimi gibi seçimlerinizi değiştirebilirsiniz.',
  },
  {
    type: 'paragraph',
    text: 'IV. Sitemizdeki işlemleriniz sebebiyle işlediğimiz kişisel verileriniz başta 6698 sayılı Kişisel Verilerin Korunması Hakkında Kanun olmak üzere ilgili mevzuata uygun şekilde işlenmektedir. Kişisel verilerinizin işlenmesi ile ilgili detaylı bilgiye e-ticaret sitemizin alt bölümünde bulunan Kişisel Verilerin Korunması alanından ulaşabilirsiniz.',
  },
  { type: 'link', text: 'Kişisel Verilerin Korunması', href: '/kisisel-verilerin-korunmasi' },
  {
    type: 'paragraph',
    text: 'V. E-ticaret sitemiz ile tüketicilerimiz arasında çıkabilecek uyuşmazlıklarda Ticaret Bakanlığı tarafından her yıl Aralık ayında belirlenen parasal sınırlar içerisinde doğrudan tüketicinin yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Sorunları Hakem Heyetine veya Tüketici Mahkemesine başvurulabilir. Tüketicinin Korunması Hakkında Kanun\'un 73/A maddesi uyarınca istisnai haller dışında Tüketici mahkemelerinde görülen uyuşmazlıklarda dava açılmadan önce arabulucuya başvurulmasının dava şartı olduğunu hatırlatmak isteriz.',
  },
];
