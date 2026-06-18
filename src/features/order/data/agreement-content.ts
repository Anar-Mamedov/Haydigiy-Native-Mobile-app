export type AgreementSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  definitions?: { term: string; desc: string }[];
};

export const AGREEMENT_LAST_UPDATE = 'Son Güncelleme: 17.09.2025';

/** Static "Mesafeli Satış Sözleşmesi" sections shown before the order details. */
export const MESAFELI_INTRO: AgreementSection[] = [
  {
    heading: 'TARAFLAR',
    paragraphs: [
      'Bu sözleşme, müşteri (Alıcı) ile Haydigiy E-Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi (Satıcı) arasında elektronik ortamda kurulmuştur. Sözleşme, müşterinin sipariş verdiği ve satıcının kabul ettiği tarihte yürürlüğe girer.',
    ],
  },
  {
    heading: 'TANIMLAR',
    definitions: [
      {
        term: 'ALICI',
        desc: 'Bir ürün veya hizmeti ticari veya mesleki olmayan amaçlarla satın alan, bir mal veya hizmeti ticari veya mesleki olmayan amaçlarla edinen, kullanan veya yararlanan gerçek kişi.',
      },
      { term: 'Satıcı', desc: 'Haydigiy E-Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi’ni,' },
      { term: 'Ürün', desc: 'Alışverişe konu her türlü eşya' },
      {
        term: 'Platform',
        desc: 'Mülkiyeti ve her türlü fikri ve sınai hakları Şirket’e ait olan ve işbu sözleşmede anılan hizmetlerin sunulmakta olduğu haydigiy.com internet sitesini ifade eder.',
      },
      {
        term: 'Kargo Şirketi',
        desc: 'Ürünün teslim ve iadesini sağlayan anlaşmalı kargo/lojistik şirketi',
      },
      {
        term: 'Ön Bilgilendirme Formu',
        desc: 'Sözleşme kurulmadan ya da buna karşılık herhangi bir teklif alıcı tarafından kabul edilmeden önce alıcıyı Yönetmelik’te belirtilen asgari hususlar konusunda bilgilendirmek için hazırlanan form',
      },
      { term: 'Bakanlık', desc: 'Türkiye Cumhuriyeti Ticaret Bakanlığı' },
      { term: 'Kanun', desc: '6502 sayılı Tüketicinin Korunması Hakkında Kanun' },
      { term: 'Yönetmelik', desc: 'Mesafeli Sözleşmeler Yönetmeliği' },
    ],
  },
  {
    heading: 'KONU VE KAPSAM',
    paragraphs: [
      'İşbu sözleşmenin konusu alıcı ile satıcı arasında elektronik ortamda kurulan satış sözleşmesinin şartlarının belirlenmesi, tarafların karşılıklı hak ve yükümlülüklerinin tespiti ve gerekli konularda bilgilendirilmesidir.',
      'Alıcı, yasal mevzuat gereği önceden bilgilendirilmesi gereken hususlarda ön bilgilendirme formunda detaylı bir şekilde bilgilendirildiğini, bunları okuyup anladığını kabul ve taahhüt eder.',
    ],
  },
];

/** Static "Mesafeli Satış Sözleşmesi" sections shown after the order details. */
export const MESAFELI_CLOSING: AgreementSection[] = [
  {
    heading: 'TARAFLARIN HAK VE YÜKÜMLÜLÜKLERİ',
    paragraphs: [
      'Şirket, İstanbul Ticaret Odası (ITO) üyesidir. Alıcı, ITO’nun meslek ile ilgili davranış kurallarını www.ito.org.tr veya 444 0 486 no.lu telefonundan öğrenebilir.',
      'Satıcı, ürün/hizmeti siparişe uygun olarak ve mevzuat gereği ürün/hizmet ile teslim edilmesi gereken sair bilgi ve belgelerle teslim etmeyi kabul ve taahhüt eder.',
      'Ürün, alıcı veya alıcı tarafından belirlenen üçüncü kişiye en geç 30 günlük yasal süre içinde teslim edilir. Taraflar yasal sürenin altında bir sürede anlaşmışlarsa ürün mutabık kalınan bu süre içerisinde teslim edilir. Alıcı, süresinde teslim edilmeyen ürünler için sözleşmeyi fesih hakkını haizdir.',
      'Alıcının isteği/kişisel ihtiyaçları doğrultusundaki özel siparişlerde teslim süresi 30 günlük yasal süreye bağlı değildir ve alıcı 30 gün içinde teslimatın gerçekleşmemiş olması gerekçesiyle sözleşmeyi feshedemez.',
      'Satıcı ürünlerin teslimatını kargo şirketleri aracılığıyla gerçekleştirmektedir. Alıcının belirttiği teslimat adresinde kargo şirketinin şubesi olmaması durumunda alıcı, kargo şirketinin adrese en yakın şubesine yapılan teslimatı kabul etmek ve ürünü buradan almakla yükümlüdür.',
      'Alıcının ürünü teslim almaması durumunda bu davranış ürünün iadesi olarak yorumlanacak ve iadeye ilişkin hükümler uygulanacaktır. Alıcının yaptığı tüm ödemeler yasal süresi içinde alıcıya iade edilecektir.',
      'Alıcının belirlediği teslimat adresinde teslim sırasında adreste kimsenin bulunmaması halinde ürünün geç teslim alınmasından veya hiç teslim alınmamasından doğan zararlardan sorumluluk alıcıya aittir.',
      'Satıcının platformda teslimat masraflarını üstlendiğini bildirdiği durumlar hariç olmak üzere alıcı teslimat masraflarından sorumludur.',
      'Ürün teslimin yerine getirilmesinin imkansızlaştığı hallerde satıcının bu durumu öğrendiği tarihten itibaren 3 gün içinde alıcıya yazılı olarak veya veri saklayıcısı ile bildirmesi ve varsa teslimat masrafları da dâhil olmak üzere tahsil edilen tüm ödemeleri bildirim tarihinden itibaren en geç 14 gün içinde iade etmesi zorunludur. Ürünün stokta bulunmaması durumu, ürünün tesliminin yerine getirilmesinin imkânsızlaşması olarak kabul edilmez.',
      'Alıcı ürünü teslim almadan evvel ürünü kontrol etmekle yükümlü olup, siparişe herhangi bir haliyle uygun olmayan ürünü teslim almaktan kaçınması gereklidir. Alıcının ürün/hizmeti teslim alması, ürün/hizmetin siparişe uygun teslim/ifa edildiği şeklinde yorumlanacaktır. Teslim ile hasar ve zarar sorumluluğu alıcıya aittir. Alıcı, cayma hakkını kullanmak isterse bu hakkını yasal mevzuata uygun olarak kullanmakla yükümlüdür.',
      'Alıcı, sözleşmeden doğan ödeme yükümlülüğünü yerine getirmekle yükümlüdür. Bu yükümlülüğü yerine getirmemesi veya banka kayıtlarına yaptığı itiraz ile yaptığı ödemeyi iptal etmesi durumunda satıcı ürünü teslim ile işbu sözleşmeden kaynaklanan diğer yükümlülüklerden kurtulacaktır.',
      'Alıcı, ürünün teslim edilmesinden sonra alıcıya ait kredi kartının yetkisiz kişilerce haksız kullanılması sonucunda sözleşme konusu bedelin ilgili Banka tarafından satıcıya ödenmemesi halinde, alıcı ürünü 3 gün içerisinde iade masrafları alıcıya ait olacak şekilde satıcıya iade edeceğini kabul, beyan ve taahhüt eder.',
      'Alıcıya herhangi bir nedenle iade yapılması gereken durumlarda, alıcı ödemeyi kredi kartı ile yapmışsa, satıcı yasal süre içerisinde iadeyi karta yapacaktır. Satıcı iadeyi gerçekleştirdikten sonra iadenin alıcının hesabına yansıtılmasından münhasıran Banka sorumludur.',
      'Alıcı tarafından sipariş edilmeyen ürün/hizmetin alıcıya gönderilmesi halinde satıcı alıcıya karşı herhangi bir hak ileri süremeyeceği gibi alıcının sessiz kalması veya ürün/hizmeti kullanmış olması da sözleşmenin kurulduğuna yönelik bir karine olarak yorumlanamaz.',
      'Platformda yayınlanan ürün/hizmetin sipariş adetlerine ilişkin kısıtlamalar getirilebilir. Alıcı bu kısıtlamalara uymakla yükümlüdür. Alıcı bu kısıtın üzerinde sipariş oluşturursa siparişi iptal edilebilir.',
      'Platform üzerinden kredi kartı ile ödeme yapıldığı durumlarda Banka tarafından düzenlenen kampanyada taksit/vade/faiz/ödeme planı Bankanın inisiyatifindedir.',
      'Platformda satışa sunulan ürün/hizmetler yalnızca satıcı tarafından belirlenen sınırlı lokasyonlara (il/ilçe/bölge) teslim edilmek üzere satışa sunulabilecek olup, sipariş sürecinde alıcının bu ürün/hizmetler için teslimat adresini satıcı tarafından belirlenmiş olan lokasyonlardan biri dışında seçmesi halinde ilgili sipariş verilemeyecek/satın alım gerçekleşmeyecektir.',
    ],
  },
  {
    heading: 'CAYMA HAKKI',
    paragraphs: [
      'Alıcı, 14 gün içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.',
      'Cayma hakkı süresi, siparişin konusu hizmet ise sözleşmenin kurulduğu gün; siparişin konusu ürün ise alıcının veya alıcı tarafından belirlenen üçüncü kişinin ürünü teslim aldığı gün başlar.',
      'Alıcı, sözleşmenin kurulmasından ürün teslimine kadar olan süre içinde de cayma hakkını kullanabilir.',
      'Cayma hakkı süresinin belirlenmesinde;',
      'a) Tek sipariş konusu olup ayrı ayrı teslim edilen ürünlerde, alıcı veya alıcı tarafından belirlenen üçüncü kişinin son ürünü teslim aldığı gün,',
      'b) Birden fazla parçadan oluşan üründe, alıcı veya alıcı tarafından belirlenen üçüncü kişinin son parçayı teslim aldığı gün,',
      'c) Belirli bir süre boyunca ürünün düzenli tesliminin yapıldığı durumlarda, alıcı veya alıcı tarafından belirlenen üçüncü kişinin ilk ürünü teslim aldığı gün esas alınır.',
      'Ürün teslimi ile hizmet ifasının birlikte olduğu durumlarda, ürün teslimine ilişkin cayma hakkı hükümleri uygulanır.',
      'Cayma hakkının kullanılması halinde alıcı, cayma hakkını kullanmasından itibaren 14 gün içerisinde cayma hakkı kapsamında iade edilecek ürün, ürün kutusu, fatura, ambalajı, varsa standart aksesuarları ve varsa ürün ile hediye edilen diğer ürünlerin de eksiksiz ve hasarsız olarak satıcıya kargo şirketiyle geri gönderir.',
      'Alıcı cayma süresi içinde ürünü, işleyişine, teknik özelliklerine ve kullanım talimatlarına uygun bir şekilde kullandığı takdirde meydana gelen değişiklik ve bozulmalardan sorumlu değildir.',
      'Alıcı aşağıdaki hallerde cayma hakkını kullanamaz:',
    ],
    bullets: [
      'Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve satıcının kontrolünde olmayan mallara ilişkin sözleşmeler,',
      'Tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallara ilişkin sözleşmeler,',
      'Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine ilişkin sözleşmeler,',
      'Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların teslimine ilişkin sözleşmeler,',
      'Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallara ilişkin sözleşmeler,',
      'Ürünün tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olması halinde maddi ortamda sunulan kitap, dijital içerik ve bilgisayar sarf malzemelerine ilişkin sözleşmeler,',
      'Abonelik sözleşmesi kapsamında sağlananlar dışında gazete ve dergi gibi süreli yayınların teslimine ilişkin sözleşmeler,',
      'Belirli bir tarihte veya dönemde yapılması gereken, konaklama, eşya taşıma, araba kiralama, yiyecek içecek tedariki ve eğlence veya dinlenme amacıyla yapılan boş zamanın değerlendirilmesine ilişkin sözleşmeler,',
      'Elektronik ortamda anında ifa edilen hizmetler ile alıcıya anında teslim edilen gayri maddi mallara ilişkin sözleşmeler,',
      'Cayma hakkı süresi sona ermeden önce, alıcının onayı ile ifasına başlanan hizmetlere ilişkin sözleşmeler.',
    ],
  },
  {
    paragraphs: [
      'Alıcı süresi içinde cayma hakkını kullanmadığı takdirde bu hakkını kaybeder.',
      'İade şartlarına uyan ürünler, kargoyu teslim alma tarihinden itibaren 14 iş günü içinde orijinal ambalajında güvenli bir şekilde paketlenerek ve beraberinde gönderilen fatura/irsaliye ile gönderilmelidir.',
      'Satın alınan ürünün ücretsiz iadesi ve/veya değişimi için belirtilen anlaşmalı kargo şirketi kullanılmalıdır. Aksi taktirde iade kargo ücreti iade edilecek tutardan kesilecektir.',
      'Cayma hakkı bildirimi ve Sözleşmeye ilişkin sair bildirimler Şirket’e ait e-posta ve/veya internet sitesinde belirtilen iletişim kanalları ile gönderilecektir. Cayma hakkının kullanılması için süresi içerisinde Satıcı’ya mevzuat hükümlerine ve internet sitesindeki cayma hakkı kullanım seçeneğine uygun olarak bildirimde bulunulması şarttır, aksi takdirde cayma hakkı kullanılamayacaktır.',
      'Kargo bedava kampanyasıyla oluşturulan siparişler için iade sonrası kalan tutar kampanya şartını sağlamazsa iade edilecek ürün bedelinden teslimatınızın kargo ücreti düşebilir.',
      'İptal ya da iade gerçekleştirildiği halde kampanya koşulları sağlanmaya devam ediyorsa kampanya iptal olmaz.',
      'İptal ya da iade sonrası siparişte kalan ürünler kampanya şartlarını sağlamaya yetmiyorsa, ücret iadesi, iptal ya da iade edilen ürünler için kampanyadan gelen indirim tutarı düşülerek yapılır.',
    ],
  },
  {
    heading: 'SON HÜKÜMLER',
    paragraphs: [
      'Sözleşmeden kaynaklı ihtilaflara Türk Hukuku uygulanacaktır.',
      'Sözleşmeden kaynaklı ihtilaflarda Bakanlıkça ilan edilen değerlere uygun olarak alıcının ürün/hizmeti satın aldığı ve ikametgahının bulunduğu yer Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.',
      'İşbu sözleşme taraflarca okunarak elektronik ortamda onay verildiği tarihte akdedilerek yürürlüğe girmiştir. Sözleşmenin bir nüshası alıcının üyelik hesabında mevcuttur. Alıcının talebi halinde bir örneği kendisine e posta ile iletilecektir.',
    ],
  },
];

/** "Ön Bilgilendirme Formu" — fully static. */
export const ONBILGI_SECTIONS: AgreementSection[] = [
  { paragraphs: ['Bu form, Haydigiy.com üzerinden gerçekleştirilen alışveriş işlemlerine ilişkin önemli bilgileri içerir.'] },
  {
    heading: 'TARAFLAR',
    definitions: [
      { term: 'ALICI', desc: 'Bir ürün veya hizmeti ticari veya mesleki olmayan amaçlarla satın alan gerçek kişiyi ifade eder.' },
      { term: 'SATICI', desc: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi’ni ifade eder.' },
      { term: 'HAYDİGİY', desc: 'www.haydigiy.com internet sitesini ve mobil uygulamasını ifade eder.' },
      {
        term: 'ÜRÜN',
        desc: 'Alışverişe konu olan taşınır eşya ve elektronik ortamda kullanılmak üzere hazırlanan yazılım, ses, görüntü ve benzeri her türlü gayri maddi malı ifade eder.',
      },
      { term: 'KARGO ŞİRKETİ', desc: 'Ürünün müşteriye ulaştırılmasını sağlayan anlaşmalı kargo veya lojistik şirketini ifade eder.' },
      { term: 'KANUN', desc: '6502 sayılı Tüketicinin Korunması Hakkında Kanun’u ifade eder.' },
      { term: 'YÖNETMELİK', desc: 'Mesafeli Sözleşmeler Yönetmeliği’ni ifade eder.' },
    ],
  },
  {
    heading: 'SATICI BİLGİLERİ',
    definitions: [
      { term: 'Unvan', desc: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi' },
      { term: 'Adres', desc: 'Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde' },
      { term: 'MERSİS No', desc: '0460103536600001' },
      { term: 'Vergi Kimlik No', desc: '4601035366' },
      { term: 'Telefon', desc: '0850 259 04 49' },
      { term: 'E-posta', desc: 'info@haydigiy.com' },
      { term: 'Web Sitesi', desc: 'www.haydigiy.com' },
    ],
  },
  {
    heading: 'ÜRÜN BİLGİLERİ',
    paragraphs: [
      'Ürün Özellikleri: Ürünün temel özellikleri (türü, miktarı, marka/modeli, rengi, adedi, fiyatı) Haydigiy.com sitesinde detaylı olarak belirtilmiştir.',
      'Teslimat Bilgileri:',
    ],
    bullets: ['Teslimat Şekli: Kargo ile teslim', 'Teslimat Süresi: En geç 30 gün', 'Teslimat Masrafları: Sipariş onay aşamasında belirtilir'],
  },
  {
    heading: 'ÖDEME BİLGİLERİ',
    paragraphs: ['Ödeme Yöntemleri:'],
    bullets: ['Kredi kartı', 'Banka kartı', 'Taksit imkanları (banka politikalarına göre)', 'Tüm fiyatlar KDV dahildir', 'Fiyatlar değişiklik gösterebilir', 'Kampanya fiyatları geçici olabilir'],
  },
  {
    heading: 'CAYMA HAKKI',
    paragraphs: [
      'Cayma Hakkı Süresi: Müşteri, ürünü teslim aldığı tarihten itibaren 14 gün içerisinde herhangi bir gerekçe göstermeksizin cayma hakkını kullanabilir.',
      'Cayma Hakkının Kullanılması:',
    ],
    bullets: [
      'Ürün orijinal ambalajı ile iade edilmelidir',
      'İade işlemleri ücretsiz olarak gerçekleştirilmektedir.',
      'Cayma bildirimi yazılı olarak yapılmalıdır',
      'İade Edilemeyecek Ürünler: Kişiye özel hazırlanan ürünler, hijyenik ürünler, açılmış ambalajlı ürünler, dijital ürünler',
    ],
  },
  {
    heading: 'SORUMLULUK ve GARANTİ',
    paragraphs: [
      'Satıcının Sorumluluğu: Satıcı, ürünü siparişte belirtilen niteliklere uygun olarak teslim etmekle yükümlüdür.',
      'Garanti: Ürünler, üretici garantisi kapsamındadır. Garanti koşulları ürün sayfasında belirtilmiştir.',
    ],
  },
  {
    heading: 'KİŞİSEL VERİLERİN KORUNMASI',
    paragraphs: [
      'Müşteri bilgileri, 6698 sayılı Kişisel Verilerin Korunması Kanunu’na uygun olarak işlenir. Detaylı bilgi için Kişisel Verilerin Korunması Aydınlatma Metni incelenebilir.',
    ],
  },
  {
    heading: 'UYUŞMAZLIKLARIN ÇÖZÜMÜ',
    paragraphs: ['Bu sözleşmeden doğabilecek uyuşmazlıklarda Niğde Mahkemeleri yetkilidir.'],
  },
  {
    heading: 'İLETİŞİM',
    definitions: [
      { term: 'Telefon', desc: '0850 259 04 49' },
      { term: 'E-posta', desc: 'info@haydigiy.com' },
      { term: 'Web Sitesi', desc: 'www.haydigiy.com' },
    ],
  },
];

/** Static seller block for the "Mesafeli" tab (SATICI BİLGİLERİ). */
export const SELLER_INFO: { label: string; value: string }[] = [
  { label: 'Satıcının Ticaret Unvanı / Adı ve Soyadı', value: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi' },
  { label: 'Satıcının Adresi', value: 'Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde' },
  { label: 'Satıcının Mersis Numarası', value: '0460103536600001' },
  { label: 'Satıcının Vergi Kimlik Numarası', value: '4601035366/ Niğde V.D.' },
  { label: 'Satıcının Telefonu', value: '+90 850 259 0 449' },
  { label: 'Satıcı KEP ve E-posta Bilgileri', value: 'haydigiy@hs01.kep.tr' },
];
