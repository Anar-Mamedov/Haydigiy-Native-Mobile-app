import { AgreementBlock } from './agreement.types';

/** "Çerçeve Sözleşme" — mirrors the web CookieFrameContent. */
export const COOKIE_FRAME: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun (Kanun) 10\'uncu maddesi ile Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında veri sorumlusu sıfatıyla Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi tarafından hazırlanmıştır.',
  },
  {
    type: 'paragraph',
    text: 'Bu Çerez Politikasının amacı, internet sitemizde kullanılan çerezlerin cihazınıza yerleştirilmesi aracılığıyla otomatik yolla elde edilen kişisel verilerin işlenmesine ilişkin olarak, hangi amaçlarla hangi tür çerezleri kullandığımızı ve bu çerezleri nasıl yönetebileceğiniz hakkında sizlere bilgi vermektir.',
  },
  {
    type: 'paragraph',
    text: 'İnternet sitemizde kullandığımız, zorunlu çerezler haricindeki çerezler için, kullanıcıların açık rızaları alınmakta ve istedikleri zaman rızalarını değiştirebilme olanağı sağlanmaktadır.',
  },

  { type: 'heading', text: 'Çerez Nedir ve Neden Kullanılmaktadır?' },
  {
    type: 'paragraph',
    text: 'Çerezler ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla bilgisayarınıza, cep telefonlarınıza, tabletlerinize veya diğer mobil cihazlarınıza yerleştirilen ve kullanıcıların internet siteleri üzerinde aradıklarını cihazın tarayıcı geçmişinde tutan küçük metin dosyalarıdır. İnternet sitesi üzerindeki hareketleriniz ve bilgileriniz tarayıcılar aracılığı ile bu metin dosyalarına yazıldığında, aynı sitelere girdiğinizde bilgilerinizi yazmanıza gerek kalmadan sizin tanınmanızı sağlar.',
  },

  { type: 'heading', text: 'Çerez Çeşitleri Nelerdir?' },
  { type: 'paragraph', text: 'Kullanım Süresine göre çerezler:' },
  {
    type: 'bullet',
    lead: 'Geçici Çerezler/Oturum Çerezleri:',
    text: 'Sadece oturum sırasında geçici olarak depolanır ve tarayıcınızı kapattığınızda sona erer. Bu tür çerezlerin kullanılmasının temel amacı ziyaretiniz süresince platformun düzgün bir biçimde çalışmasını sağlamaktır.',
  },
  {
    type: 'bullet',
    lead: 'Kalıcı Çerezler:',
    text: 'Tarayıcı veya uygulamayı kapattıktan sonra bilgisayar/mobil cihazınızda kalır. Platformu aynı cihazla tekrar ziyaret etmeniz durumunda, cihazınızda platform tarafından oluşturulmuş bir çerez olup olmadığı kontrol edilir ve var ise, sizin platformu daha önce ziyaret ettiğiniz anlaşılır ve size iletilecek içerik bu doğrultuda belirlenir. Kalıcı çerezler siz silinceye veya süreleri doluncaya kadar kalır.',
  },

  { type: 'subheading', text: 'Kullanım Amacına göre çerezler:' },
  {
    type: 'bullet',
    lead: 'Zorunlu Çerezler:',
    text: 'Gerekli ve en önemli çerezlerdir. Kullanıcı hesabı oluşturmanıza, giriş yapmanıza ve platformda gezinti yapmanıza olanak sağlar. Bu çerezler güvenlik ve doğrulama gibi amaçlar için kullanılmakta olup, herhangi bir pazarlama amacı doğrultusunda kullanılmaz.',
  },
  {
    type: 'bullet',
    lead: 'Performans ve analiz çerezleri:',
    text: 'Platformun genel çalışmasını geliştirmek için ziyaretçilerin platformu (izlenen sayfalar, ziyaretin ortalama süresi, vs.) nasıl kullandığı hakkında bilgi toplamak, sitenin gerektiği gibi çalışıp çalışmadığını denetlemek ve alınan hataları tespit etmek için kullanılır.',
  },
  {
    type: 'bullet',
    lead: 'İşlevsellik çerezleri:',
    text: 'Platforma ziyareti kolaylaştırmak ve tarama deneyiminizi geliştirmek için kullanılan çerezlerdir. Tercih ettiğiniz dil, düzen veya renk şeması gibi belirli ayarları hatırlamak için izin verir.',
  },
  {
    type: 'bullet',
    lead: 'İzleme çerezleri:',
    text: 'Ziyaretçilerin internet tarama davranışlarını izlemek ve ziyaret ettikleri çeşitli internet sitelerinden kendi tarama davranışına veri ve bilgi toplamak için kullanılır.',
  },

  { type: 'heading', text: 'Çerezi yerleştiren tarafa göre çerez çeşitleri:' },
  {
    type: 'bullet',
    lead: 'Reklam çerezleri:',
    text: 'Platform tarafından yerleştirilen birinci taraf çerezleri ziyaretçilere sunulan reklamları özelleştirmek, zaten görüntülenmiş reklamların tekrar gösterilmesini engellemek için kullanılır.',
  },
  {
    type: 'bullet',
    lead: 'Hedef/Reklam Çerezleri:',
    text: 'Bir internet sitesini ziyaret ettiğiniz sırada iş birliği yaptığımız üçüncü taraf iş ortaklarımız (Google, Facebook vb.) tarafından yüklenen ve yönetilen reklam çerezleri platformu ziyaretinizle ilgili bazı bilgileri iletmek için kullanılır.',
  },

  { type: 'heading', text: 'Çerezleri Nasıl Yönetebilirsiniz?' },
  {
    type: 'paragraph',
    text: 'Çerez kullanılmasını tercih etmezseniz tarayıcınızın ayarlarından çerezleri silebilir, engelleyebilir veya istediğiniz gibi yönetebilirsiniz. Ancak çerezleri silmenin veya engellemenin platformu verimli olarak kullanmanızı etkileyebileceğini hatırlatmak isteriz.',
  },
  {
    type: 'bullet',
    lead: 'Google Chrome:',
    text: 'tarayıcınızın "Adres Bölümünde" yer alan, "Kilit İşareti" veya "i" harfini tıklayarak, "Cookie" sekmesinden çerezlere izin verebilir veya reddedebilirsiniz.',
  },
  {
    type: 'bullet',
    lead: 'Mozilla Firefox:',
    text: 'tarayıcınızın sağ üst köşesinde yer alan "Menüyü Aç" sekmesinden "Seçenekler" görselini tıklayarak "Gizlilik ve Güvenlik" butonunu kullanarak çerez yönetiminizi yapabilirsiniz.',
  },
  {
    type: 'bullet',
    lead: 'Microsoft Internet Explorer:',
    text: 'Tarayıcınızın sağ üst köşesinde yer alan "Tool" veya "Araçlar" bölümünden "Güvenlik" sekmesini tıklayarak "İzin Ver" veya "İzin Verme" şeklinde çerez yönetiminizi gerçekleştirebilirsiniz.',
  },
  {
    type: 'bullet',
    lead: 'Apple Safari:',
    text: 'Telefonunuzun "Ayarlar" bölümünden "Safari" sekmesini seçip, "Gizlilik ve Güvenlik" bölümünden tüm çerez yönetiminizi sağlayabilirsiniz.',
  },
  { type: 'bullet', text: 'Diğer tarayıcılar için de ilgili tarayıcıların yardım veya destek sayfalarını inceleyebilirsiniz.' },

  { type: 'heading', text: 'İlgili Kişi Olarak Haklarınız' },
  {
    type: 'paragraph',
    text: 'İlgili kişi (kişisel verisi işlenen gerçek kişi) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu\'nun 11\'inci maddesi uyarınca aşağıdaki haklara sahipsiniz:',
  },
  { type: 'bullet', text: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme,' },
  { type: 'bullet', text: 'Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,' },
  { type: 'bullet', text: 'Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,' },
  { type: 'bullet', text: 'Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,' },
  { type: 'bullet', text: 'Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,' },
  { type: 'bullet', text: 'Kişisel verilerinizin silinmesini veya yok edilmesini isteme,' },
  { type: 'bullet', text: 'Düzeltme, silme ve yok etme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere bildirilmesini isteme,' },
  { type: 'bullet', text: 'İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme,' },
  { type: 'bullet', text: 'Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.' },
];
