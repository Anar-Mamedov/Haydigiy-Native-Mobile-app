import type { ConsentPreferences } from '../types/consent.types';

/**
 * Metinler web'deki CookiePolicy bileşeninden birebir alınmıştır; iki kanalda
 * aynı KVKK aydınlatmasının görünmesi için burada da değiştirilmedi.
 */
export const CONSENT_BANNER_TITLE = 'SANA ÖZEL BİR DENEYİM İÇİN ÇALIŞIYORUZ';

export const CONSENT_BANNER_BODY =
  'İnternet sayfamızda çerezler yoluyla kişisel veri işlenmekte olup gerekli çerezler bilgi toplumu hizmetlerinin sunulması amacıyla kullanılmaktadır, diğer çerezler açık rıza vermeniz halinde, sizlere yönelik reklam/pazarlama faaliyetlerinin yapılması, sitemizin daha işlevsel kılınması ve kişiselleştirme (gizlilik tercihiniz hariç olmak üzere diğer tercihlerinizin siteye tekrar girdiğinizde hatırlanmasını sağlamak) amaçlarıyla sınırlı olarak kullanılacaktır. Çerezlere dair tercihlerinizi panel vasıtasıyla yönetmeniz mümkündür.';

export const ESSENTIAL_CONSENT_SECTION = {
  badge: 'Her Zaman Etkin',
  body: 'Bu çerezler kullanıcı hesabı oluşturmanıza, giriş yapmanıza ve platformda gezinti yapmanıza olanak sağlar. Kalıcı çerezler tarayıcı veya uygulamayı kapattıktan sonra bilgisayarınızda veya mobil cihazınızda kalır ve platforma döndüğünüzde sizi tanımak için kullanılır. Bu çerezler güvenlik ve doğrulama gibi amaçlar için kullanılmakta olup, herhangi bir pazarlama amacı doğrultusunda kullanılmaz.',
  title: 'Gerekli/Zorunlu Çerezler',
} as const;

export const OPTIONAL_CONSENT_SECTIONS: {
  body: string;
  key: keyof ConsentPreferences;
  title: string;
}[] = [
  {
    body: 'İş ortaklarımız tarafından ilgi alanlarınıza göre profilinizin çıkarılması ve size ilgili reklamlar göstermek amacıyla kullanılmaktadır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun\'un 5\'inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir. Üçüncü taraf çerez kullanılmakta olduğundan yurt dışına aktarım söz konusudur.',
    key: 'marketing',
    title: 'Reklam ve Pazarlama Çerezleri',
  },
  {
    body: 'Tercihlerinizin (dil, bölge, görüntüleme ayarları gibi) hatırlanmasını sağlayarak uygulamayı size göre kişiselleştirmek için kullanılır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun\'un 5\'inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir.',
    key: 'functional',
    title: 'İşlevsel Çerezler',
  },
  {
    body: 'Uygulamamızın genel çalışmasını geliştirmek için ziyaretçilerin uygulamayı (görüntülenen sayfalar, ziyaretin ortalama süresi, vs.) nasıl kullandığı hakkında bilgi toplamak, uygulamanın gerektiği gibi çalışıp çalışmadığını denetlemek ve alınan hataları tespit etmek için kullanılır. Bu çerezler aracılığıyla toplanan kişisel verileriniz, Kanun\'un 5\'inci maddesinin (1) numaralı fıkrası kapsamında açık rızanızın alınması suretiyle işlenmektedir.',
    key: 'analytics',
    title: 'Performans ve Analiz Çerezleri',
  },
];
