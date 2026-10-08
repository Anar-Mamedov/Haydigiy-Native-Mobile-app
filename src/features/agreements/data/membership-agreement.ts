import { AgreementBlock } from './agreement.types';

/**
 * "Üyelik Sözleşmesi" — mirrors the web `/uyelik-sozlesmesi` page. Web'deki
 * metin içi bağlantılar (KVKK, Kullanım Koşulları, Çerez Politikası) `link`
 * blokları olarak web yollarıyla tutulur; ekran bunları uygulama rotasına çevirir.
 */
export const MEMBERSHIP_AGREEMENT: AgreementBlock[] = [
  { type: 'heading', text: 'Taraflar' },
  {
    type: 'paragraph',
    text: 'İşbu sözleşme Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde adresinde mukim Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Şirket" olarak anılacaktır) ile aşağıda yer alan şart ve kurallara ve sözleşme eklerine elektronik ortamda onay veren üye arasında akdedilmiştir.',
  },
  { type: 'heading', text: 'Tanımlar' },
  {
    type: 'term',
    term: 'Platform/pazaryeri',
    text: 'Mülkiyeti ve her türlü fikri ve sınai hakları Şirket\'e ait olan ve işbu sözleşmede anılan hizmetlerin sunulmakta olduğu haydigiy.com internet sitesini ve mobil uygulamasını ifade eder.',
  },
  {
    type: 'term',
    term: 'Hizmet/Hizmetler',
    text: 'Satıcının ürünlerini platform üzerinden yayınlayarak satışa çıkarmasını ve ürün teslimatını sağlayan sanal mağazadaki Şirket tarafından yürütülen uygulamaları ifade eder.',
  },
  {
    type: 'term',
    term: 'Alıcı',
    text: 'Platform üzerinden ürün alan gerçek ve tüzel kişileri ifade eder.',
  },
  {
    type: 'term',
    term: 'Satıcı',
    text: 'Platform üzerinden ürünlerini satışa sunan Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi\'ni ifade eder.',
  },
  {
    type: 'term',
    term: 'İşgünü',
    text: 'Resmî tatil ve cumartesi ile pazar günleri dışındaki günleri ifade eder.',
  },
  {
    type: 'term',
    term: 'İçerik',
    text: 'Platformda yayınlanan ve erişimi mümkün olan her türlü bilgi, yazı, dosya, resim, video vb. görsel, işitsel ve yazımsal imgeleri ifade eder.',
  },
  {
    type: 'term',
    term: 'Kişisel Veri',
    text: '6698 sayılı Kişisel Verilerin Korunması Hakkında Kanun\'a göre kimliği belirli veya belirlenebilir gerçek kişiye ilişkin her türlü bilgidir.',
  },
  {
    type: 'term',
    term: 'Özel Nitelikli Kişisel Veri',
    text: '6698 sayılı Kişisel Verilerin Korunması Hakkında Kanun\'a göre kişilerin ırkı, etnik kökeni, siyasi düşüncesi, felsefi inancı, dini, mezhebi veya diğer inançları, kılık ve kıyafeti, dernek, vakıf ya da sendika üyeliği, sağlığı, cinsel hayatı, ceza mahkûmiyeti ve güvenlik tedbirleriyle ilgili verileri ile biyometrik ve genetik verileri özel nitelikli kişisel verilerdir.',
  },
  { type: 'heading', text: 'Konu ve Kapsam' },
  {
    type: 'paragraph',
    text: 'İşbu sözleşmenin konusu, Şirket tarafından platformda sunulan hizmetlerden yararlanma şartları ile tarafların hak ve yükümlülüklerinin tespitidir. İşbu sözleşme ve ekleri ile platform içerisinde yer alan kullanıma, hesaba ve hizmetlere ilişkin Şirket tarafından yapılan tüm uyarı, bildirim, uygulama ve açıklama gibi beyanlar kapsam dâhilindedir.',
  },
  { type: 'heading', text: 'Üyelik Şartları' },
  { type: 'paragraph', text: 'Üyelik için reşit olmak gerekmektedir.' },
  {
    type: 'paragraph',
    text: 'Üyelik formunun kullanıcı tarafından doğru ve güncel bilgilerle eksiksiz olarak doldurulması üzerine Şirket tarafından onay verilmesi gerekmektedir. Bilgilerinde değişiklik olan üye derhal bilgilerini güncelleyecektir. Platformda kendisinden talep edilen bilgileri doğru, tam ve güncel sağlamayan üye, bu sebeple doğabilecek tüm zararlardan bizzat sorumludur.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, üyeliğe onay verme hususunda inisiyatif sahibidir. Onay vermeyeceği gibi ek şart koşabilir yahut verdiği onayı gerekli görürse geri alabilir, üyelik hesabını geçici olarak askıya alabilir veya kapatabilir.',
  },
  {
    type: 'paragraph',
    text: 'Şirket herhangi bir zamanda gerekçe göstermeden, bildirimde bulunmadan, tazminat, ceza vb. sair yükümlülüğü bulunmaksızın derhal yürürlüğe girecek şekilde işbu sözleşmeyi tek taraflı fesih yetkisine sahiptir.',
  },
  {
    type: 'paragraph',
    text: 'Üye, her zaman ve gerekçe göstermeksizin üyeliğini sonlandırma hakkını haizdir. Üye, üyelik hesabının kapatılmasından sonra üyelik hesabını yeniden kullanamayacağını ve hesaba bağlı tanımlanmış haklar var ise bunların da üyelik hesabı ile son bulacağını kabul eder.',
  },
  {
    type: 'paragraph',
    text: 'Üye; isim, elektronik posta adresi/cep telefonu numarası ve diğer bilgileri doğru, eksiksiz ve hatasız girmediyse veya bilgilerde değişiklik yaşandıysa üyelik işleminin tamamlanmasından sonra eksiklik/yenilik/hataları Hesabım bölümünde düzeltebilir.',
  },
  {
    type: 'paragraph',
    text: 'Üyelik işlemleri tamamlandıktan sonra bu Üyelik Sözleşmesi (form-metin olarak) üyenin belirttiği e posta adresine gönderilecektir. Ayrıca haydigiy.com\'da yine form olarak yer almaktadır. Üyeye "özel" (taraf olarak bilgileri girilmiş) Sözleşme metni gibi bir metin Şirket sistemlerinde ayrıca muhafaza edilmeyebilecektir.',
  },
  {
    type: 'paragraph',
    text: 'Üyeler tarafından sağlanan bilgilerin ve işlemlerin güvenliği için gerekli önlemler bilgi ve işlemin mahiyetine göre Şirket veya ilgili kuruluşlarca sistem ve internet altyapısında alınmaktadır. Üyenin alışverişte kullandığı kredi kartı işlem ve onayları Şirket\'ten bağımsız olarak ilgili Banka ve benzeri ödeme kuruluşlarınca online olarak gerçekleşmektedir. Kart şifresi gibi bilgiler Şirket tarafından görüntülenmemekte ve kaydedilmemektedir.',
  },
  { type: 'heading', text: 'Tarafların Hak ve Yükümlülükleri' },
  {
    type: 'paragraph',
    text: 'Şirket, İstanbul Ticaret Odası (ITO) üyesidir. Üye, ITO\'nun meslek ile ilgili davranış kurallarını www.ito.org.tr veya 444 0 486 no.lu telefonundan ögrenebilir.',
  },
  { type: 'paragraph', text: 'Üye reşit olduğunu kabul ve taahhüt etmektedir.' },
  {
    type: 'paragraph',
    text: 'Üye, platforma giriş yapmak üzere oluşturduğu kullanıcı adı ve parola bilgilerinin güvenliğini sağlamaktan şahsen sorumludur. Bu bilgileri şahsen kullanması zorunlu olup üçüncü kişilerle paylaşmaması gerekmektedir. Üyenin bu konudaki ihmal ve kusuru neticesinde diğer üyelerin ve/veya Şirket\'in ve/veya diğer üçüncü kişilerin uğradığı veya uğrayabileceği maddi ve/veya manevi her tür zarardan üye sorumludur.',
  },
  {
    type: 'paragraph',
    text: 'Üye, üyelik formunu doldururken sunduğu bilgilerin değişmesi halinde yeni ve güncel bilgileri Şirket\'i gecikmeksizin bildirmekle yükümlü olduğunu kabul ve taahhüt etmektedir. Bildirmemesi durumunda Şirket uğrayacağı her türlü zarar için üyeye rücu etme hakkını haizdir.',
  },
  {
    type: 'paragraph',
    text: 'Üye, Şirket\'in yazılı onayı olmadan işbu sözleşmeyi veya bu sözleşme kapsamındaki hak ve yükümlülüklerini kısmen veya tamamen herhangi bir üçüncü kişiye devredemez.',
  },
  {
    type: 'paragraph',
    text: 'Üye işbu sözleşme ve ekleri ile platformdaki tüm kuralları anladığını ve onayladığını kabul ve taahhüt etmektedir.',
  },
  {
    type: 'paragraph',
    text: 'Üye; platformda yer alan tüm kurallara ve Şirket tarafından açıklanacak kurallara, yürürlükteki mevzuata ve genel ahlak kurallarına uygun davranacağını kabul ve taahhüt etmektedir.',
  },
  {
    type: 'paragraph',
    text: 'Şirket mevzuat gereği resmi kurum ve kuruluşlara, kamu hukuku tüzel kişilerine, özel hukuk tüzel kişilerine açıklama yapma yükümlülüğü altındaysa, üyenin kişisel verilerini ve/veya ticari bilgilerini açıklamak hususunda tam yetkilidir. Üye, böyle bir açıklama nedeniyle hiçbir ad altında tazminat talep etmeyeceğini kabul ve taahhüt etmektedir.',
  },
  {
    type: 'paragraph',
    text: 'Üye platformu hukuka uygun amaçlarla kullanacağını kabul ve taahhüt etmektedir. Üye platform dahilinde hukuka aykırı iş/işlem/eylemde bulunursa her türlü hukuki ve cezai sorumluluk kendisine aittir. Şirket hiçbir şekilde sorumlu tutulamaz.',
  },
  {
    type: 'paragraph',
    text: 'Üye platformun işleyişine, hukuka, işbu sözleşmede yer alan koşullara, genel ahlak kurallarına aykırı mesaj ve/veya içerik girmeyeceğini kabul ve taahhüt eder. Buna aykırı davranması halinde Şirket mesaj ve/veya içerikleri istediği zaman ve şekilde, bildirimde bulunmadan ve süre vermeden erişimden kaldırabilir ve/veya mesaj ve/veya içeriği giren üyenin hesabını bildirimde bulunmadan ve süre vermeden kapatabilir.',
  },
  {
    type: 'paragraph',
    text: 'Üyenin Şirket sistem ve hizmetlerinin güvenliğini tehdit edebilecek ve/veya diğer kullanıcılara zarar verebilecek eylemlerde bulunması, platforma ait yazılımların çalışmasını veya diğer kullanıcıların platformdan faydalanmasını engelleyebilecek herhangi bir girişimde bulunması, bu sonuçları verecek şekilde sisteme veya platforma orantısız yük bindirmesi; platformun kaynak kodlarına veya Şirket sistemlerine yetkisiz bir şekilde erişmesi, bu bilgileri kopyalaması, silmesi, değiştirmesi ya da bu yönde denemeler yapması, platformun çalışmasını engelleyecek yazılımlar kullanması, kullanmaya çalışması veya her türlü yazılım, donanım ve sunucuların çalışmasını aksatması, bozulmasına yol açması, tersine mühendislik yapması, saldırılar düzenlemesi, meşgul etmesi veya bunlara sair surette müdahale etmesi, Şirket sunucularına erişim sağlamaya çalışması kesinlikle yasaktır. Buna aykırı hareket eden üye, Şirket\'in doğrudan ve/veya dolaylı her türlü zararını karşılamakla yükümlüdür.',
  },
  {
    type: 'paragraph',
    text: 'Şirket işbu sözleşmede anılan hizmetleri, Şirket sistemlerinde yer alan açıklamalar ve bu sözleşmede belirtilen şartlar çerçevesinde yerine getirmek üzere gerekli altyapıyı sağlayıp işletmeyi kabul ve taahhüt eder. İşbu madde içerisinde belirtilen altyapı sağlama yükümlülüğü, sınırsız ve eksiksiz bir hizmet taahhüdü anlamına gelmeyip Şirket, her zaman herhangi bir bildirimde bulunmadan işbu sözleşmeyle belirlenen hizmetlerini ve altyapısını askıya alabilir ve/veya son verebilir. Şirket bakım, onarım çalışmaları, teknik aksaklıklar dahil ancak bunlarla sınırlı olmamak kaydıyla herhangi bir sebepten ötürü Sözleşme kapsamındaki hizmetlerin geç verilmesi, kesintiye uğraması veya hizmetin verilmesi ile ilgili bir sorumluluk üstlenmemektedir.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, platformda sunulan bilgi ve içeriği her zaman denetleyebilir, üyeden değiştirmesini isteyebilir. Üye Şirket\'in talep ettiği değişiklik ve/veya düzeltmeleri derhal yerine getirmek zorundadır. Şirket gerekli gördüğü hallerde üyenin sisteme yüklediği bilgi ve içeriği üçüncü kişilerin erişimine kapatabilir ve silebilir. Şirket bu yetkilerini bildirimde bulunmadan ve süre vermeden kullanabilir. Şirket tarafından yapılan değişiklik ve/veya düzeltme taleplerini derhal yerine getirmeyen üye doğan/doğabilecek zararlardan bizzat sorumludur.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, kullanıcıların platform üzerinden üçüncü kişilerin sahip olduğu internet sitelerine ve/veya platformlara, dosyalara veya içeriklere link verilmesini engellememektedir. Bununla birlikte Şirket bu linklerin yöneldiği internet sitesini veya işleten kişisini veya içerdiği bilgileri desteklemek veya herhangi bir açıdan doğrulama veya garanti etme amacı taşımamaktadır ve bu linkler vasıtasıyla sağlanan erişimlerden doğabilecek hiçbir zarardan Şirket\'in hukuki veya cezai sorumluluğu yoktur.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, mevzuatta meydana gelen değişikliklere bağlı olarak üyelere her zaman ek yükümlülükler getirebilir, söz konusu yükümlülükler platformda yayımlandığı tarihte yürürlüğe girer. Eğer ki bu ek yükümlülükler üyenin onayının alınmasını gerektiriyorsa Şirket bu ek onay için gerekli alt yapıyı sağlar. Şirket, gerekli ek onayı vermeyen üyelerin üyeliklerini askıya alabilir veya sonlandırabilir.',
  },
  {
    type: 'paragraph',
    text: 'Üye, satın aldığı ürüne ilişkin platform üzerinde yaptığı yorumların satıcı tarafından bu yorumların platformda ve diğer mecralarda mevzuata uygun olarak paylaşılabileceğini kabul eder.',
  },
  {
    type: 'paragraph',
    text: 'Şirket platform üzerinde her türlü değişiklik, güncelleme ve benzeri çalışmaları her zaman yapabilir ve üye de üyeliği devam ettiği sürece, haydigiy.com\'u olduğu haliyle kabul etmiş sayılır.',
  },
  {
    type: 'paragraph',
    text: 'Şirket bu sözleşmeyi uygun göreceği nedenlerle uygun gördüğü zamanda tek taraflı olarak değiştirme hakkını haizdir. Değişen sözleşme Şirket tarafından platformda yayınlandığı tarihte geçerlilik kazanarak yürürlüğe girer.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, üyenin platformu kullanması veya yanlış kullanması sonucunda platformu kullanmasını engelleyen uyumsuzlukların veya hataların (tüm donanım, sistem yazılımı/diğer yazılımlar ve ağ ilişkili işlevden ve bu nedenle ortaya çıkacak arızalar; platformda gerçekleştirilen her türlü değişiklik, güncelleme ve benzeri çalışmalar sonucunda oluşabilecek hata ve arızalar; vs.) ortaya çıkmasından kaynaklanan doğrudan veya dolaylı her türlü maddi ve manevi zararlardan, bu kapsamda üye veya üçüncü bir tarafça yapılabilecek tazminat taleplerinden sorumlu değildir.',
  },
  {
    type: 'paragraph',
    text: 'haydigiy.com\'da sunulan görsel ve yazılı içerik, kişisel kullanım içindir. haydigiy.com içeriğinde yer alan bütün alan adı, logo, ikon, demonstratif, yazılı, elektronik, grafik veya makinede okunabilir şekilde sunulan teknik veriler, uygulanan satış sistemi, iş metodu ve iş modeli de dahil tüm materyallerin ve bunlara ilişkin fikri ve sınai mülkiyet haklarının sahibi veya lisans sahibidir ve yasal koruma altındadır. Aksi belirtilmedikçe ticari ya da kişisel amaçlarla izinsiz veya kaynak göstermeksizin kullanılamaz. Bu sayfaların tasarımında ve veri tabanı oluşturulmasında kullanılan yazılımın hakkı Şirket\'e aittir. Bahsi geçen yazılımın kopyalanması veya kullanılması kesinlikle yasaktır. Şirket.com.tr\'ye iletilen tüm eleştirilerin hakkı Şirket\'e aittir, istenildiği taktirde Şirket tarafından pazarlama amacıyla kullanılabilir.',
  },
  {
    type: 'paragraph',
    text: 'Üye, platform üzerinden yapacağı alışverişlerde kullanacağı ödeme bilgilerinin (kredi kartı, GSM numarası bilgileri vb.) doğru olduğunu, bunlardan kaynaklanan hukuki ve cezai sorumlulukların kendisine ait olduğunu kabul ve taahhüt eder.',
  },
  { type: 'heading', text: 'Gizlilik' },
  {
    type: 'paragraph',
    text: 'Şirket üye ile ilgili bilgileri işbu sözleşme ve ekleri kapsamında kullanabilir, bu sözleşme eklerinde yer alan aydınlatma metni ve gizlilik politikası kapsamında kullanabilir ve/veya üçüncü kişilere açıklayabilir.',
  },
  {
    type: 'paragraph',
    text: 'Şirket, üye tarafından üyelik aşamasında verilen kişisel veri niteliğindeki bilgileri üyenin platformdan gerektiği gibi faydalanabilmesini temin amacıyla toplamakta ve işlemektedir. Kişisel verilerin korunması hakkında detaylı bilgi için Kişisel Verilerin Korunması Aydınlatma Metni. Şirket kişisel verilerin korunmasına ilişkin politikalarında dilediği zaman değişiklik yapma yetkisini haiz olup bu değişiklikler platformda yayınlanmakla yürürlüğe girmektedir. Üye bu değişiklikleri takip etmekle yükümlü olup değişikliklerden kaynaklı olarak Şirket\'e karşı talep ve zarar iddiasında bulunamaz.',
  },
  {
    type: 'link',
    text: 'Kişisel Verilerin Korunması Aydınlatma Metni',
    href: '/kisisel-verilerin-korunmasi',
  },
  {
    type: 'paragraph',
    text: 'Üye, işbu sözleşmenin kapsamında kalan amaçlarla üyelik aşamasında paylaştığı bilgilerinin Kişisel Verilerin Korunması kurallarına uygun olacak şekilde, gerektiğinde ek bilgilendirmeler yapılıp açık rıza alınarak, işlenmesini ve/veya aktarılmasını kabul ve taahhüt etmektedir.',
  },
  {
    type: 'paragraph',
    text: 'Üye platform dahilinde elde ettiği bilgileri, platformda bu bilgileri sağlayan kişilerin ifşa amacını aşacak şekilde kullanmayacağını kabul ve taahhüt eder. Platform dahilinde elde ettiği her türlü kişisel verilerin güvenliğinden, Türk Ceza Kanunu ve Kişisel Verilerin Korunması Kanunu kapsamında bizzat sorumlu olduğunu ve buna uygun olarak davranacağını kabul ve taahhüt eder. Üyenin kişisel verilerin korunması kurallarına aykırı davranışlarından dolayı Şirket\'in bir zarara uğraması durumunda Şirket üyeye rücu hakkını haizdir ve üye bu zararı ilk talepte nakden ve defaten tazmin edeceğini kabul ve taahhüt eder.',
  },
  {
    type: 'paragraph',
    text: 'Avrupa Birliğinde yerleşik üye, kişisel verilerin korunması hakkında Türkiye\'de yürürlükte bulunan veri güvenliği kurallarının uygulanacağını, Türk Hukukunun tam yetkili olduğunu, 95/46/EC sayılı Avrupa Birliği Direktifi\'nin ve Mayıs 2018 tarihinde Avrupa Birliği\'nde yürürlüğe giren Genel Veri Koruma Regülasyonu\'nun (GDPR) uygulanmayacağını, Türk Milletlerarası Özel Hukuk ve Usul Hukuku Hakkında Kanun\'un kanunlar ihtilafı kaidelerinin uygulanmasını talep etmekten feragat ettiğini kabul ve taahhüt eder.',
  },
  {
    type: 'paragraph',
    text: 'Üye, platformda yayınlanan yorumları nedeniyle alenileşen kişisel verilerinin Google ve diğer arama motorları tarafından işlenmesi halinde Şirket\'in bir dahili olmadığını ve bu şekilde doğabilecek her türlü zararı, zarara sebebiyet veren veri sorumlularına yöneltmeyi kabul ve taahhüt eder.',
  },
  { type: 'heading', text: 'Yürürlük' },
  {
    type: 'paragraph',
    text: 'İşbu sözleşme ve sözleşmenin ayrılmaz bir parçası olan ekler ile platformda yer alan kurallar üyenin elektronik olarak onay vermesi ile elektronik ortamda akdedilerek yürürlüğe girmiştir. Sözleşmedeki herhangi bir hükmün geçersizliği, mevzuata aykırılığı veya uygulanabilir olmaması sözleşmenin geri kalan hükümlerinin yürürlüğünü etkilemeyecektir.',
  },
  { type: 'heading', text: 'Ekler' },
  {
    type: 'paragraph',
    text: 'Üye Kullanım Koşulları, Kişisel Verilerin Korunması Aydınlatma Metni, Çerez Politikası ile platformda yer alan kuralların bu sözleşmenin eki ve ayrılmaz parçası olduğunu, tüm hükümleriyle okuyup anladığını ve üyeliği boyunca bunlara uygun davranacağını kayıtsız ve şartsız olarak kabul ve taahhüt eder.',
  },
  { type: 'link', text: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
  {
    type: 'link',
    text: 'Kişisel Verilerin Korunması Aydınlatma Metni',
    href: '/kisisel-verilerin-korunmasi',
  },
  { type: 'link', text: 'Çerez Politikası', href: '/cerez-politikasi' },
];
