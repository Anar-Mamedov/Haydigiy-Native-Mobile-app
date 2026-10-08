import { AgreementBlock } from '@/features/agreements/data/agreement.types';

/** "Cayma, İptal ve İade Koşulları" — web `/iptal-iade-kosullari` sayfasının içeriği. */
export const CANCELLATION_RETURN: AgreementBlock[] = [
  {
    type: 'paragraph',
    text: 'haydigiy.com üzerinden yaptığınız alışverişler, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği ve ikincil düzenlemelerine tabidir. Bu iptal ve iade koşullarında düzenlenmeyen durumlarda ilgili mevzuat hükümleri geçerli olacaktır.',
  },
  { type: 'heading', text: 'Teslimat Süresi' },
  {
    type: 'paragraph',
    text: 'İnternet sitemizde açıkça daha kısa bir sürede teslimat taahhüt edilmediği durumda ürün teslimat süresi … gündür. Satıcı, yasal süre olan 30 günü aşmamak kaydı ile ürünü alıcının gösterdiği adresteki kişi ve/veya kuruluşa teslim eder. Ürün bu süre içinde teslim edilmezse Alıcı sözleşmeye sona erdirme hakkına sahiptir.',
  },
  { type: 'heading', text: 'Kargo Ücreti' },
  {
    type: 'paragraph',
    text: 'İnternet sitemizde kargo ücretinin satıcı tarafından karşılanacağının taahhüt edilmediği durumda kargo ücretleri alıcı tarafından ödenecektir.',
  },
  { type: 'heading', text: 'İade Kargo Ücreti' },
  {
    type: 'paragraph',
    text: 'İade kargo ücreti müşteriye aittir. Her sipariş için ilk iade talebinde kargo ücreti Satıcı tarafından karşılanır; aynı siparişe ilişkin ikinci ve sonraki iade taleplerinde gönderi karşı ödemeli yapılır ve kargo ücreti iade edilecek tutardan düşülür. Anlaşmalı kargo şirketi dışında bir kargo şirketi ile gönderilen iadelerin kargo ücreti de müşteriye aittir.',
  },
  { type: 'heading', text: 'Teslimat Koşulları' },
  {
    type: 'paragraph',
    text: 'İnternet sitemiz üzerinden yaptığınız alışverişlerde satın aldığınız ürün eksiksiz ve siparişte belirtilen niteliklere uygun ve varsa garanti belgesi, kullanım kılavuzu gibi belgelerle teslim edilir.',
  },
  { type: 'heading', text: 'Satışın İmkansızlaşması' },
  {
    type: 'paragraph',
    text: 'İnternet sitemiz üzerinden yaptığınız alışverişlerde satın aldığınız ürünün satılmasının imkansızlaşması durumunda, satıcı bu durumu öğrendiğinden itibaren 3 gün içinde yazılı olarak alıcıya bildirir ve 14 gün içinde toplama bedel alıcıya iade edilir.',
  },
  { type: 'heading', text: 'Ürün Bedelinin Ödenmemesi, Ödemenin İptal Edilmesi' },
  {
    type: 'paragraph',
    text: 'Alıcı, satın aldığı ürün bedelini ödemez veya banka kanalıyla iptal ederse, Satıcının ürünü teslim yükümlülüğü sona erer.',
  },
  {
    type: 'paragraph',
    text: 'Ürün teslim edildikten sonra, alıcının ödeme yaptığı kredi kartının yetkisiz kişiler tarafından haksız olarak kullanıldığı tespit edilirse ve satılan ürün bedeli ilgili banka veya finans kuruluşu tarafından Satıcıya ödenmez ise, Alıcı, sözleşme konusu ürünü 3 gün içerisinde nakliye gideri Satıcıya ait olacak şekilde Satıcıya iade etmek zorundadır.',
  },
  { type: 'heading', text: 'Mücbir Sebepler' },
  {
    type: 'paragraph',
    text: 'Satıcının öngöremeyeceği mücbir sebepler oluşursa ve ürün süresinde teslim edilemez ise, durum Alıcıya bildirilir. Alıcı, siparişin iptalini, ürünün benzeri ile değiştirilmesini veya engel ortadan kalkana dek teslimatın ertelenmesini talep edebilir. Alıcı siparişi iptal ederse; ödemeyi nakit yapmış ise iptalden itibaren 14 gün içinde kendisine nakden bu ücret ödenir. Alıcı, ödemeyi kredi kartı ile yapmış ise ve iptal ederse, bu iptalden itibaren yine 14 gün içinde ürün bedeli bankaya iade edilir. Bankanın bu bedeli alıcının hesabına geçirmesi Bankanın sorumluluğundadır.',
  },
  { type: 'heading', text: 'Alıcının Ürünü Kontrol Etme Yükümlülüğü' },
  {
    type: 'paragraph',
    text: 'İptal ve iade koşullarının geçerli olabilmesi için teslimat esnasında ürünü mutlaka kontrol ediniz. Herhangi bir hasar gördüğünüzde tutanak tutturarak ürünü teslim almayınız. Ürün üzerinde yapılan değişiklikler, ürünün deforme olması ya da ürünün orijinal dizaynının bozulması iptal iade kapsamı dışındadır. Alıcı, teslimden sonra ürünü özenle korumak zorundadır. Cayma hakkı kullanılacaksa mal/hizmet kullanılmamalıdır. Ürünle birlikte fatura da iade edilmelidir.',
  },
  { type: 'heading', text: 'Cayma Hakkı' },
  {
    type: 'paragraph',
    text: 'Alıcı; satın aldığı ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14 (on dört) gün içerisinde, Satıcıya aşağıdaki iletişim bilgileri üzerinden bildirmek şartıyla hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin ve hiçbir masraf üstlenmeksizin cayma hakkını kullanabilir.',
  },
  {
    type: 'paragraph',
    text: 'İade şartlarına uyan ürünler, kargoyu teslim alma tarihinizden itibaren 14 iş günü içinde orijinal ambalajında güvenli bir şekilde paketlenerek ve beraberinde gönderilen fatura/irsaliye ile gönderilmelidir. İade etmek istediğiniz ürün/ürünler eksiksiz (ürün paketinin içinden çıkan tüm aksesuar ve aparatlar; iğne, mendil, yaka çiçeği vs.) ve orijinal kutusu ile sağlam bir şekilde gönderilmelidir. Üzerinde tadilat vb. hiçbir değişiklik yapılmamış bir şekilde, ebatına uygun ve zarar görmeyecek ambalajda olmalıdır.',
  },
  {
    type: 'paragraph',
    text: 'İade işlemleri, Hesabım > Siparişlerim > Detaylar bölümünden iade talebi oluşturularak ve oluşturulan iade kodu ile belirtilen anlaşmalı kargo şirketi üzerinden yapılmalıdır. İade kargo ücretine ilişkin koşullar yukarıdaki "İADE KARGO ÜCRETİ" başlığında düzenlenmiştir.',
  },
  {
    type: 'paragraph',
    text: 'Cayma hakkı bildirimi ve Sözleşmeye ilişkin sair bildirimler tarafımıza ait şu bilgilerle gerçekleştirilebilecektir:',
  },
  { type: 'subheading', text: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi' },
  {
    type: 'bullet',
    text: 'Hesabım > Siparişlerim > Detaylar bölümünden iade etmek istediğiniz ürünü seçerek iade nedenini belirtmeniz yeterlidir. Oluşturacağınız iade kodu ile PTT Kargo üzerinden gönderim yapabilirsiniz; her sipariş için ilk iadenizin kargo ücreti tarafımızca karşılanır.',
  },
  {
    type: 'bullet',
    text: 'Gönderdiğiniz ürünler tarafımıza ulaştığında size SMS ile bilgi veririz.',
  },
  {
    type: 'bullet',
    text: '1-3 iş günü içerisinde gönderdiğiniz ürünler incelenir ve onaylanırsa Ödeme işleminiz başlar.',
  },
  {
    type: 'bullet',
    text: 'Ödemeniz, kapıda ödemeli siparişler için belirttiğiniz IBAN\'a, kredi/banka kartı siparişleri için kredi/banka kartınıza yapılır.',
  },
  { type: 'bullet', text: 'Ödemeniz yapıldığında sizi SMS ile bilgilendiririz.' },
  {
    type: 'bullet',
    text: 'Kredi/banka kartınıza yapılan iadelerin kartınıza geçmesi banka kaynaklı olarak 3 iş günü kadar sürebilir.',
  },
  {
    type: 'bullet',
    text: 'Kapıda ödeme siparişlerde ürünler tarafımıza ulaştıktan sonra IBAN bilgisi için sizinle iletişime geçilecektir.',
  },
  {
    type: 'paragraph',
    text: 'Cayma hakkının kullanılması için süresi içerisinde tarafımıza mevzuat hükümlerine ve internet sitesindeki cayma hakkı kullanım seçeneğine uygun olarak bildirimde bulunulması şarttır, aksi takdirde cayma hakkı kullanılamayacaktır.',
  },
  {
    type: 'paragraph',
    text: 'Cayma bildiriminizin tarafımıza ulaşmasından itibaren en geç 10 günlük süre içerisinde toplam bedeli ve tarafınızı borç altına sokan belgeleri tarafınıza iade eder ve 20 günlük süre içerisinde malı iade alırız.',
  },
  {
    type: 'paragraph',
    text: 'Tarafınızın kusurundan kaynaklanan bir nedenle malın değerinde bir azalma olursa veya iade imkânsızlaşırsa kusurunuz oranında doğan zararı tazmin etmekle yükümlüsünüz. Ancak cayma hakkı süresi içinde malın veya ürünün usulüne uygun kullanılması sebebiyle meydana gelen değişiklik ve bozulmalardan sorumlu değilsiniz.',
  },
  { type: 'subheading', text: 'Cayma hakkı aşağıdaki hallerde kullanılamaz:' },
  {
    type: 'bullet',
    text: 'Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve satıcının kontrolünde olmayan mal veya hizmetlere ilişkin sözleşmelerde (ziynet, altın ve gümüş kategorisindeki ürünler)',
  },
  {
    type: 'bullet',
    text: 'Tüketicinin istekleri veya açıkça onun kişisel ihtiyaçları doğrultusunda hazırlanan, niteliği itibariyle geri gönderilmeye elverişli olmayan ve çabuk bozulma tehlikesi olan veya son kullanma tarihi geçme ihtimali olan malların teslimine ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallara ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Tüketici tarafından ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olması şartıyla maddi ortamda sunulan kitap, ses veya görüntü kayıtlarına, yazılım programlarına ve bilgisayar sarf malzemelerine ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Abonelik sözleşmesi kapsamında sağlananlar dışında gazete, dergi gibi süreli yayınların teslimine ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Belirli bir tarihte veya dönemde yapılması gereken, konaklama, eşya taşıma, araba kiralama, yiyecek-içecek tedariki ve eğlence veya dinlenme amacıyla yapılan boş zamanın değerlendirilmesine ilişkin sözleşmelerde',
  },
  { type: 'bullet', text: 'Bahis ve piyangoya ilişkin hizmetlerin ifasına ilişkin sözleşmelerde' },
  {
    type: 'bullet',
    text: 'Cayma hakkı süresi sona ermeden önce, tüketicinin onayı ile ifasına başlanan hizmetlere ilişkin sözleşmelerde',
  },
  {
    type: 'bullet',
    text: 'Elektronik ortamda anında ifa edilen hizmetler ile tüketiciye anında teslim edilen gayri maddi mallara ilişkin sözleşmelerde ve sözleşmeye konu mal/hizmet\'in Mesafeli Sözleşmeler Yönetmeliği\'nin uygulama alanı dışında bırakılmış olan (satıcının düzenli teslimatları ile alıcının meskenine teslim edilen gıda maddelerinin, içeceklerin ya da diğer günlük tüketim maddeleri ile seyahat, konaklama, lokantacılık, eğlence sektörü gibi alanlarda hizmetler) mal/hizmet türlerinden müteşekkil olması halinde alıcı ve satıcı arasındaki hukuki ilişkiye Mesafeli Sözleşmeler Yönetmeliği hükümleri uygulanamaması sebebiyle cayma hakkı kullanılamayacaktır.',
  },
  { type: 'heading', text: 'Kampanya Koşulları' },
  {
    type: 'paragraph',
    text: 'İnternet sitemizde zaman zaman kampanyalar uygulanabilir. Bu kampanyalar özelinde ilan edilen koşullar dışında aşağıdaki koşullar her kampanyamız için geçerlidir.',
  },
  {
    type: 'paragraph',
    text: 'Kargo bedava kampanyasıyla oluşturulan siparişler için iade sonrası kalan tutar kampanya şartını sağlamazsa iade edilecek ürün bedelinden teslimatınızın kargo ücreti düşebilir.',
  },
  {
    type: 'paragraph',
    text: 'İptal ya da iade gerçekleştirildiği halde kampanya koşulları sağlanmaya devam ediyorsa kampanya iptal olmaz.',
  },
  {
    type: 'paragraph',
    text: 'İptal ya da iade sonrası siparişte kalan ürünler kampanya şartlarını sağlamaya yetmiyorsa, ücret iadesi, iptal ya da iade edilen ürünler için kampanyadan gelen indirim tutarı düşülerek yapılır.',
  },
  {
    type: 'paragraph',
    text: 'Tarafımıza göndermiş olduğunuz paketinizde; talebinizle ilgili herhangi bir bilgi bulunmaması durumunda, paket iade işlemi olarak değerlendirilecektir.',
  },
];
