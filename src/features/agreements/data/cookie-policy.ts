import { AgreementBlock } from './agreement.types';

/** "Çerez Politikası" — mirrors the web CookiePolicyContent. */
export const COOKIE_POLICY: AgreementBlock[] = [
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
    text: 'İnternet sitemizde kullandığımız, zorunlu çerezler haricindeki çerezler için, kullanıcıların açık rızaları alınmakta ve istedikleri zaman rızalarını değiştirebilme olanağı sağlanmaktadır. Kullanıcılar çerez yönetim paneli üzerinden, internet sitemizde kullanılan çerez çeşitlerini görebilmekte ve Zorunlu Çerezler dışında kalan tüm çerezler için "açık" veya "kapalı" seçenekleri ile tercihlerini belirleyebilmektedirler. Yine bu panel üzerinden kullanıcılar tercihlerini her zaman değiştirebilmektedirler.',
  },

  { type: 'heading', text: 'Çerez Nedir ve Neden Kullanılmaktadır?' },
  {
    type: 'paragraph',
    text: 'Çerezler ziyaret ettiğiniz internet siteleri tarafından tarayıcılar aracılığıyla bilgisayarınıza, cep telefonlarınıza, tabletlerinize veya diğer mobil cihazlarınıza yerleştirilen ve kullanıcıların internet siteleri üzerinde aradıklarını cihazın tarayıcı geçmişinde tutan küçük metin dosyalarıdır. İnternet sitesi üzerindeki hareketleriniz ve bilgileriniz tarayıcılar aracılığı ile bu metin dosyalarına yazıldığında, aynı sitelere girdiğinizde bilgilerinizi yazmanıza gerek kalmadan sizin tanınmanızı sağlar. Platform tarafından kullanılan çerezler bilgisayarınıza herhangi bir zarar vermez ve virüs içermez. Platformda çerez kullanılmasının başlıca amaçları aşağıda belirtilmiştir:',
  },
  { type: 'bullet', text: 'Platformu ziyaret ettiğiniz zaman göz atma deneyiminizi daha hızlı ve kolay hale getirerek zamandan tasarruf etmenizi sağlamak.' },
  { type: 'bullet', text: 'Platforma yapacağınız ziyaretleriniz için tercihlerinizi veya kayıt ayrıntılarınızı hatırlayarak tarama deneyiminizi daha verimli hale getirmek.' },
  { type: 'bullet', text: 'Platformun elde edeceği tanımlama bilgileriyle platformu tercihlerinize göre kişiselleştirmek ve ilgi alanınıza uygun içerikleri sunmak.' },
  { type: 'bullet', text: 'Platforma ait Parolanızı kaydederek oturumunuzun sürekli açık kalmasını sağlamak ve her ziyaretinizde parola girmenizi önlemek.' },
  { type: 'bullet', text: 'Platforma ait reklam niteliğine sahip içerikler yayınlamak, içeriklere olan yaklaşım ve tepkilerinizi analiz ederek geliştirmek;' },
  { type: 'bullet', text: 'Platformun, sizin ve İmza\'nın hukuki ve ticari güvenliğini sağlamak.' },

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
    text: 'Gerekli ve en önemli çerezlerdir. Kullanıcı hesabı oluşturmanıza, giriş yapmanıza ve platformda gezinti yapmanıza olanak sağlar. Kalıcı çerezler tarayıcı veya uygulamayı kapattıktan sonra bilgisayarınızda veya mobil cihazınızda kalır ve platforma döndüğünüzde sizi tanımak için kullanılır. Bu çerezler güvenlik ve doğrulama gibi amaçlar için kullanılmakta olup, herhangi bir pazarlama amacı doğrultusunda kullanılmaz.',
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
];
