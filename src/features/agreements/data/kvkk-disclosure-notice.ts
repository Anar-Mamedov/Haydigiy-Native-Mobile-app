import { AgreementBlock } from './agreement.types';

/**
 * Kişisel Verilerin Korunmasına İlişkin Aydınlatma Metni — web `/kisisel-verilerin-korunmasi`
 * sayfası ve web kayıt formundaki "Aydınlatma Metni" penceresiyle aynı metin
 * (frontend `src/components/legal/documents/DisclosureText.tsx`).
 * Metin içi bağlantılar web yollarıyla `link` blokları olarak tutulur; ekran
 * bunları uygulama rotasına çevirir.
 */
export const KVKK_DISCLOSURE_NOTICE: AgreementBlock[] = [
  { type: 'heading', text: '1. Giriş' },
  {
    type: 'paragraph',
    text: 'Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi ("Haydigiy" veya "Şirket") olarak kişisel verilerinizin gizliliğine ve güvenliğine önem veriyoruz. Kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve ikincil mevzuata uygun olarak işliyoruz. Kişisel veri, kimliğinizi belirli ya da belirlenebilir kılan her türlü bilgidir.',
  },
  {
    type: 'paragraph',
    text: 'Bu metin, haydigiy.com internet sitesi ve Haydigiy mobil uygulaması (birlikte "Platform") üzerinden Üyelik Sözleşmesi’ni kabul ederek üye olmanız ve alışveriş yapmanız halinde işlenen kişisel verileriniz hakkında KVKK’nın 10. maddesi uyarınca sizi bilgilendirmek için hazırlanmıştır.',
  },
  { type: 'heading', text: '2. Veri sorumlusu' },
  { type: 'bullet', text: 'Unvan: Haydigiy E Ticaret Tekstil Sanayi ve Ticaret Limited Şirketi' },
  {
    type: 'bullet',
    text: 'Adres: Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde',
  },
  { type: 'bullet', text: 'Telefon: 0850 259 04 49' },
  { type: 'bullet', text: 'E-posta: kvkk@haydigiy.com' },
  { type: 'bullet', text: 'KEP: haydigiy@hs01.kep.tr' },
  { type: 'bullet', text: 'MERSİS No: 0460103536600001' },
  { type: 'bullet', text: 'Ticaret Sicil No: 5763, Niğde Ticaret ve Sanayi Odası' },
  { type: 'heading', text: '3. Hangi kişisel verilerinizi işliyoruz?' },
  {
    type: 'bullet',
    text: 'Kimlik bilgileriniz: adınız, soyadınız; eklemeniz halinde doğum tarihiniz ve cinsiyetiniz; fatura düzenlenmesi için gerekmesi halinde T.C. kimlik numaranız veya vergi kimlik numaranız.',
  },
  {
    type: 'bullet',
    text: 'İletişim bilgileriniz: telefon numaranız, e-posta adresiniz, teslimat ve fatura adresleriniz.',
  },
  {
    type: 'bullet',
    text: 'Müşteri işlem bilgileriniz: sipariş, fatura, ödeme, iptal, iade ve değişim bilgileriniz; sepet ve favori listeniz; ürünlere yaptığınız yorum, puan ve sorular ile bunlara eklediğiniz fotoğraflar; talep, şikâyet ve geri bildirimleriniz; müşteri hizmetleriyle yaptığınız yazışmalar.',
  },
  {
    type: 'bullet',
    text: 'Finansal bilgileriniz: iade bedelinin banka hesabınıza ödenmesini seçmeniz halinde IBAN ve hesap sahibi bilgileriniz. Ödeme kartı bilgileriniz Haydigiy tarafından görüntülenmez ve saklanmaz; ödemeler anlaşmalı banka ve ödeme kuruluşlarının altyapısında gerçekleşir.',
  },
  {
    type: 'bullet',
    text: 'İşlem güvenliği bilgileriniz: şifreniz (şifrelenmiş olarak), doğrulama kodu kayıtları, IP adresiniz, cihaz ve tarayıcı bilgileriniz, oturum ve erişim kayıtlarınız.',
  },
  {
    type: 'bullet',
    text: 'Pazarlama bilgileriniz: çerezler ve benzeri teknolojilerle elde edilen gezinme ve tercih bilgileriniz, kampanya etkileşimleriniz; açık rızanızın bulunması halinde segment ve profil bilgileriniz.',
  },
  { type: 'bullet', text: 'İşitsel kayıtlarınız: çağrı merkezimizle görüşmeniz halinde ses kaydınız.' },
  {
    type: 'bullet',
    text: 'Hukuki işlem bilgileriniz: yetkili kişi, kurum ve kuruluşlarla yazışmalardaki bilgiler, dava ve icra dosyalarındaki bilgiler.',
  },
  { type: 'heading', text: '4. Kişisel verilerinizin toplanma yöntemi, işlenme amaçları ve hukuki sebepleri' },
  {
    type: 'paragraph',
    text: 'Kişisel verileriniz; Platform üzerinden elektronik ortamda, çerezler ve benzeri teknolojilerle otomatik yollarla; müşteri hizmetleri, WhatsApp, e-posta ve telefon kanallarıyla iletişime geçtiğinizde ilgili kanal aracılığıyla; resmi yazı, tebligat veya posta yoluyla iletilmesi halinde ise fiziki ortamda toplanır ve aşağıdaki amaçlarla işlenir.',
  },
  { type: 'heading', text: '4.1. Üyelik ve hesap işlemleri' },
  {
    type: 'bullet',
    text: 'Üyelik sözleşmesinin kurulması ve ifası, üyelik hesabının oluşturulması, yönetilmesi ve kapatılması,',
  },
  {
    type: 'bullet',
    text: 'Telefon numaranızın ve e-posta adresinizin doğrulanması, hesabınıza güvenli girişin sağlanması,',
  },
  { type: 'bullet', text: 'Platform üzerinden alışveriş yapabilmenizin sağlanması,' },
  { type: 'bullet', text: 'Şirketin tabi olduğu mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi.' },
  {
    type: 'paragraph',
    text: 'Hukuki sebepler: Sözleşmenin kurulması veya ifası için gerekli olması, Şirketin hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması, kanunlarda açıkça öngörülmesi.',
  },
  { type: 'heading', text: '4.2. Sipariş, ödeme, teslimat ve iade süreçleri' },
  { type: 'bullet', text: 'Siparişinizin alınması, hazırlanması ve size ya da belirttiğiniz alıcıya teslim edilmesi,' },
  {
    type: 'bullet',
    text: 'Mesafeli satış sözleşmesinin kurulması ve ifası, ödemenin alınması ve faturanın düzenlenmesi,',
  },
  { type: 'bullet', text: 'İptal, iade ve değişim taleplerinizin yürütülmesi, iade bedelinin ödenmesi,' },
  {
    type: 'bullet',
    text: 'Sipariş ve kargo durumuna ilişkin SMS, e-posta, WhatsApp ve uygulama bildirimi yoluyla bilgilendirme yapılması.',
  },
  {
    type: 'paragraph',
    text: 'Hukuki sebepler: Sözleşmenin kurulması veya ifası için gerekli olması, Şirketin hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması.',
  },
  { type: 'heading', text: '4.3. Müşteri hizmetleri ve deneyimin iyileştirilmesi' },
  {
    type: 'bullet',
    text: 'Talep, şikâyet, öneri ve geri bildirimlerinizin alınması, değerlendirilmesi ve yanıtlanması,',
  },
  { type: 'bullet', text: 'Satış sonrası destek hizmetlerinin yürütülmesi,' },
  {
    type: 'bullet',
    text: 'Platform kullanımının analiz edilmesi, hizmet kalitesinin ve kullanıcı deneyiminin geliştirilmesi,',
  },
  { type: 'bullet', text: 'Ürün yorumlarının ve soru-cevapların Platform’da yayınlanması.' },
  {
    type: 'paragraph',
    text: 'Hukuki sebepler: Sözleşmenin kurulması veya ifası için gerekli olması, Şirketin meşru menfaatleri için veri işlenmesinin zorunlu olması.',
  },
  { type: 'heading', text: '4.4. Bilgi güvenliği, finans ve denetim süreçleri' },
  {
    type: 'bullet',
    text: 'Bilgi güvenliği süreçlerinin yürütülmesi, şüpheli işlemlerin incelenmesi ve dolandırıcılığın önlenmesi,',
  },
  { type: 'bullet', text: 'Finans, muhasebe ve faturalandırma süreçlerinin yürütülmesi ve denetimi,' },
  { type: 'bullet', text: 'Risk tespiti ve analizlerinin yapılması.' },
  {
    type: 'paragraph',
    text: 'Hukuki sebepler: Şirketin hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması, sözleşmenin ifası için gerekli olması, Şirketin meşru menfaatleri için veri işlenmesinin zorunlu olması.',
  },
  { type: 'heading', text: '4.5. Hukuki süreçler' },
  {
    type: 'bullet',
    text: 'Hukuk ve dava işlerinin yürütülmesi, ilgili kişi başvurularının incelenmesi ve yanıtlanması,',
  },
  { type: 'bullet', text: 'Yetkili kişi, kurum ve kuruluşlara bilgi verilmesi,' },
  { type: 'bullet', text: 'Bir uyuşmazlık halinde hakların kullanılması ve korunması.' },
  {
    type: 'paragraph',
    text: 'Hukuki sebepler: Bir hakkın tesisi, kullanılması veya korunması için veri işlenmesinin zorunlu olması, Şirketin hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması, kanunlarda açıkça öngörülmesi.',
  },
  { type: 'heading', text: '4.6. Açık rızanıza dayalı süreçler' },
  { type: 'bullet', text: 'Size özel avantajlı tekliflerin sunulması ve ürün önerilerinin kişiselleştirilmesi,' },
  { type: 'bullet', text: 'Pazarlama, reklam ve tanıtım faaliyetlerinin yürütülmesi,' },
  { type: 'bullet', text: 'Onay verdiğiniz kanallar üzerinden ticari elektronik ileti gönderilmesi.' },
  {
    type: 'paragraph',
    text: 'Hukuki sebep: Açık rızanızın bulunması. Verdiğiniz rızayı dilediğiniz zaman "9. Başvuru yöntemleri" bölümündeki yöntemlerle geri alabilirsiniz; ticari elektronik ileti tercihlerinizi ayrıca Hesabım > Duyuru Tercihlerim sayfasından değiştirebilirsiniz.',
  },
  { type: 'heading', text: '5. Kişisel verilerinizi kimlere ve hangi amaçlarla aktarıyoruz?' },
  {
    type: 'paragraph',
    text: 'Kişisel verilerinizi "bilme gereği" ve "kullanma gereği" ilkelerine uygun olarak, yalnızca gerektiği kadarını ve gerekli teknik ve idari tedbirleri alarak aşağıdaki alıcılarla paylaşırız:',
  },
  { type: 'bullet', text: 'Kargo ve lojistik firmaları: siparişlerin teslimi ve iadelerin alınması,' },
  { type: 'bullet', text: 'Bankalar ve ödeme kuruluşları: ödemelerin alınması ve iade bedellerinin ödenmesi,' },
  {
    type: 'bullet',
    text: 'Bilişim, barındırma, yazılım, SMS, e-posta, bildirim ve çağrı merkezi hizmeti aldığımız hizmet sağlayıcılar: Platform’un çalışması ve sizinle iletişim kurulması,',
  },
  {
    type: 'bullet',
    text: 'E-fatura/e-arşiv entegratörü, mali müşavir, bağımsız denetim ve hukuk danışmanları: hukuki ve mali yükümlülüklerin yerine getirilmesi,',
  },
  { type: 'bullet', text: 'Grup şirketlerimiz: finans, muhasebe ve operasyon süreçlerinin yürütülmesi,' },
  {
    type: 'bullet',
    text: 'Pazarlama, reklam ve analiz hizmeti aldığımız iş ortakları: açık rızanızın bulunması halinde, 4.6. maddedeki amaçlarla,',
  },
  {
    type: 'bullet',
    text: 'Yetkili kamu kurum ve kuruluşları ile yargı mercileri: talep edilmesi ve mevzuatın gerektirmesi halinde.',
  },
  {
    type: 'paragraph',
    text: 'Yurt içi aktarımlar KVKK’nın 8. maddesindeki şartlara dayanılarak yapılır. Hizmet aldığımız bazı bilişim, analiz ve reklam hizmet sağlayıcılarının sunucuları yurt dışında bulunduğundan, kişisel verileriniz KVKK’nın 9. maddesinde ve ilgili yönetmelikte öngörülen şartlara ve usullere uygun olarak yurt dışına aktarılabilir.',
  },
  { type: 'heading', text: '6. Kişisel verilerinizi nasıl koruyoruz?' },
  { type: 'bullet', text: 'Platform ile cihazınız arasındaki veri trafiği SSL/TLS ile şifrelenir.' },
  { type: 'bullet', text: 'Şifreniz açık metin olarak değil, şifrelenmiş olarak saklanır.' },
  { type: 'bullet', text: 'Kişisel verilere yalnızca görevi gereği yetkilendirilmiş çalışanlar erişebilir.' },
  {
    type: 'bullet',
    text: 'Sistemlerimiz düzenli olarak güvenlik testlerinden geçirilir, riskler analiz edilir ve gerekli önlemler alınır.',
  },
  { type: 'heading', text: '7. Kişisel verilerinizi ne kadar süre saklıyoruz?' },
  {
    type: 'paragraph',
    text: 'Kişisel verilerinizi işlenme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen saklama süreleri boyunca (örneğin fatura ve muhasebe kayıtları için Vergi Usul Kanunu ve Türk Ticaret Kanunu uyarınca 10 yıl) saklarız. Bu sürelerin sonunda kişisel verileriniz silinir, yok edilir veya anonim hale getirilir.',
  },
  { type: 'heading', text: '8. KVKK’nın 11. maddesi kapsamındaki haklarınız' },
  { type: 'bullet', text: 'Kişisel verilerinizin işlenip işlenmediğini öğrenme,' },
  { type: 'bullet', text: 'İşlenmişse buna ilişkin bilgi talep etme,' },
  { type: 'bullet', text: 'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,' },
  { type: 'bullet', text: 'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,' },
  { type: 'bullet', text: 'Eksik veya yanlış işlenmişse düzeltilmesini isteme,' },
  { type: 'bullet', text: 'KVKK’da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme,' },
  {
    type: 'bullet',
    text: 'Düzeltme, silme ve yok etme işlemlerinin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,',
  },
  {
    type: 'bullet',
    text: 'Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,',
  },
  {
    type: 'bullet',
    text: 'Kanuna aykırı işlenmesi nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme.',
  },
  { type: 'heading', text: '9. Başvuru yöntemleri' },
  {
    type: 'paragraph',
    text: 'Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’de belirtilen bilgileri içeren bir dilekçeyle aşağıdaki yöntemlerden biriyle iletebilirsiniz:',
  },
  {
    type: 'bullet',
    text: 'Şahsen yazılı başvuru veya noter aracılığıyla: Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde',
  },
  {
    type: 'bullet',
    text: 'Güvenli elektronik imza ya da mobil imza ile imzalanmış kayıtlı elektronik posta (KEP): haydigiy@hs01.kep.tr',
  },
  {
    type: 'bullet',
    text: 'Şirketimize daha önce bildirdiğiniz ve sistemimizde kayıtlı e-posta adresinizden: kvkk@haydigiy.com',
  },
  {
    type: 'paragraph',
    text: 'Başvurunuzun zarfına veya e-postanın konu kısmına "Kişisel Verilerin Korunması Kanunu Bilgi Talebi" yazmanızı rica ederiz. Şahsen yapılan başvurularda kimliği tevsik edici belge ibraz edilmesi gerekir.',
  },
  {
    type: 'paragraph',
    text: 'Başvurularınız en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu’nca belirlenen tarifedeki ücret talep edilebilir.',
  },
  { type: 'heading', text: '10. Aydınlatma Metni hakkında' },
  {
    type: 'paragraph',
    text: 'Şirket, bu Aydınlatma Metni’ni mevzuatta veya uygulamalarında yapılacak değişiklikler doğrultusunda güncelleme hakkını saklı tutar.',
  },
  { type: 'paragraph', text: 'Son güncelleme: 18.11.2026' },
];
