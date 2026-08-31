/* eslint-disable @typescript-eslint/no-require-imports */
import { NativeModules, Platform } from 'react-native';
import { isInsiderNativeSdkAvailable } from './insider-client';
import {
  InsiderIdentifierConstructor,
  InsiderProductSdk,
  InsiderSdk,
} from '../types/insider.types';
import {
  InsiderProductInput,
  getInsiderProductMatchKeys,
  isValidInsiderProductInput,
} from '../utils/insider-product.mapper';
import {
  RecommendationAttributionStore,
  recommendationAttributionStore,
} from './insider-recommendation-attribution';
import { User } from '@/types/auth.types';
import { extractTurkishNationalNumber, isValidTurkishMobile } from '@/utils/turkish-phone';
import { INSIDER_LANGUAGE, INSIDER_LOCALE } from '../utils/insider-locale';

/**
 * Custom event tetiklendiğinde Insider'ın beklediği ad: yalnızca küçük Latin
 * harfleri ve alt çizgi ("yorum_yapıldı" SDK tarafından reddedilir).
 */
export const REVIEW_SUBMITTED_EVENT = 'yorum_yapildi';
export const USER_LOGIN_EVENT = 'user_login';
export const USER_LOGOUT_EVENT = 'user_logout';

export interface ReviewSubmittedInput {
  productId: string;
  rating: number;
}

/**
 * Giriş yöntemi: `password` = şifre ile giriş, `otp` = sms/e-posta kodu,
 * `register` = kayıt akışının sonunda otomatik açılan oturum.
 */
export type InsiderLoginMethod = 'password' | 'otp' | 'register';

/** `user` = kullanıcının kendi çıkışı, `session_expired` = oturumun süresinin dolması. */
export type InsiderLogoutReason = 'user' | 'session_expired';

/**
 * Domain-facing Insider analytics API. Screens and data hooks call these
 * methods with plain snapshots; SDK loading, product-object construction and
 * error isolation stay behind this boundary.
 */
export interface InsiderTracker {
  trackHomePageView(): void;
  trackListingPageView(taxonomy: string[]): void;
  trackProductDetailView(product: InsiderProductInput): void;
  trackCartView(items: InsiderProductInput[]): void;
  trackWishlistView(items: InsiderProductInput[]): void;
  trackAddToCart(product: InsiderProductInput): void;
  trackRemoveFromCart(productId: string): void;
  trackCartCleared(): void;
  trackAddToWishlist(product: InsiderProductInput): void;
  trackRemoveFromWishlist(productId: string): void;
  trackPurchase(saleId: string, items: InsiderProductInput[]): void;
  trackSignUp(): void;
  trackUserLogin(method?: InsiderLoginMethod): void;
  trackUserLogout(reason: InsiderLogoutReason): void;
  trackReviewSubmitted(input: ReviewSubmittedInput): void;
  /**
   * Smart Recommender tıklaması. Aynı oturumda ürün için bu çağrı yapılmadan
   * sepete ekleme ve satın alma istatistikleri panele öneriye bağlanmaz.
   */
  trackRecommendationClick(recommendationId: number, product: InsiderProductInput): void;
  /**
   * Öneri tıklama hafızasını kalıcı kopyadan geri yükler. Uygulama açılışında bir kez
   * çağrılmalı; 3D Secure sırasında süreç öldürülürse satın alma eventi aksi halde
   * tıklamayla eşleşemez.
   */
  restoreRecommendationAttribution(): Promise<void>;
  identifyUser(user: User): void;
  /**
   * Dil/locale attribute'unu oturum durumundan bağımsız tanımlar. Smart Recommender
   * ön koşulu olduğu için misafir ziyaretçilerde de tanımlı olmalı.
   */
  applyDefaultLocale(): void;
  clearUser(): void;
}

interface InsiderTrackerDependencies {
  isNativeSdkAvailable: () => boolean;
  loadSdk: () => InsiderSdk;
  loadIdentifierConstructor: () => InsiderIdentifierConstructor;
  onError: (message: string, error: unknown) => void;
  /** Tek satırlık, PII taşımayan teşhis günlüğü; cihazda zincir doğrulanabilsin diye. */
  onDiagnostic: (message: string) => void;
  recommendationAttribution: RecommendationAttributionStore;
}

const defaultDependencies: InsiderTrackerDependencies = {
  isNativeSdkAvailable: () => isInsiderNativeSdkAvailable(Platform.OS, NativeModules),
  loadSdk: () => require('react-native-insider').default as InsiderSdk,
  loadIdentifierConstructor: () =>
    require('react-native-insider/src/InsiderIdentifier').default as InsiderIdentifierConstructor,
  onError: (message, error) => console.warn(message, error),
  onDiagnostic: (message) => console.info(message),
  recommendationAttribution: recommendationAttributionStore,
};

/**
 * Insider identifier'ları String bekler ve farklı tipte gelen değeri sessizce
 * düşürür (`react-native-insider/src/InsiderIdentifier.js` → `checkParameters`
 * yalnızca `console.warn` atar). Backend `user.id`'yi JSON number olarak
 * döndürdüğü için `User.id: string` sözleşmesi runtime'da tutmaz ve CRM kimliği
 * hiç gönderilmez; bu yüzden değer sınırda normalize edilir.
 *
 * @see https://academy.insiderone.com/docs/react-native-user-object
 */
export function toInsiderIdentifierValue(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

/** Kayıtlı telefonlar ulusal formatta (5XXXXXXXXX); Insider E164 bekler. */
export function toE164TurkishPhone(phone: string | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;

  const national = extractTurkishNationalNumber(trimmed);
  if (!isValidTurkishMobile(national)) return null;
  return `+90${national}`;
}

export function createInsiderTracker(
  dependencies: InsiderTrackerDependencies = defaultDependencies,
): InsiderTracker {
  let sdk: InsiderSdk | null = null;

  const getSdk = (): InsiderSdk | null => {
    if (sdk) return sdk;
    if (!dependencies.isNativeSdkAvailable()) return null;
    sdk = dependencies.loadSdk();
    return sdk;
  };

  /**
   * Analytics asla uygulama akışını kırmamalı: SDK yoksa sessiz no-op, hata
   * durumunda logla ve devam et.
   */
  const run = (label: string, action: (activeSdk: InsiderSdk) => void): boolean => {
    try {
      const activeSdk = getSdk();
      if (!activeSdk) return false;
      action(activeSdk);
      return true;
    } catch (error) {
      dependencies.onError(`[Insider] ${label} gönderilemedi.`, error);
      return false;
    }
  };

  /**
   * Ürün daha önce bir öneri sliderından tıklandıysa event'i **tıklamadaki** kimlikle
   * gönderir. Insider, Add to Cart ve Revenue istatistiklerini yalnızca kimlik
   * eşleştiğinde öneri kampanyasına bağlar; feed `item_id` ile backend ürün kimliği
   * ayrışırsa event panele hiç düşmez.
   */
  const withRecommendationId = (input: InsiderProductInput): InsiderProductInput => {
    const click = dependencies.recommendationAttribution.resolve(
      getInsiderProductMatchKeys(input),
    );
    if (!click || click.productId === input.id) return input;

    dependencies.onDiagnostic(
      `[Insider] öneri eşleşmesi · kampanya=${click.recommendationId} · ` +
        `kimlik ${input.id} → ${click.productId}`,
    );
    return { ...input, id: click.productId };
  };

  const buildProduct = (
    activeSdk: InsiderSdk,
    input: InsiderProductInput,
  ): InsiderProductSdk => {
    const product = activeSdk.createNewProduct(
      input.id,
      input.name,
      input.taxonomy,
      input.imageUrl,
      input.price,
      input.currency,
    );
    if (typeof input.salePrice === 'number') product.setSalePrice(input.salePrice);
    if (typeof input.quantity === 'number' && input.quantity > 0) {
      product.setQuantity(input.quantity);
    }
    if (typeof input.stock === 'number' && input.stock >= 0) product.setStock(input.stock);
    if (input.size) product.setSize(input.size);
    if (input.color) product.setColor(input.color);
    if (input.brand) product.setBrand(input.brand);
    if (input.productUrl) product.setProductURL(input.productUrl);
    return product;
  };

  const buildValidProducts = (
    activeSdk: InsiderSdk,
    items: InsiderProductInput[],
  ): InsiderProductSdk[] =>
    items
      .filter(isValidInsiderProductInput)
      .map((item) => buildProduct(activeSdk, item));

  return {
    trackHomePageView() {
      run('ana sayfa ziyareti', (activeSdk) => {
        activeSdk.visitHomePage();
      });
    },

    trackListingPageView(taxonomy) {
      const cleaned = taxonomy.map((entry) => entry.trim()).filter(Boolean);
      if (cleaned.length === 0) return;
      run('kategori görüntüleme', (activeSdk) => {
        activeSdk.visitListingPage(cleaned);
      });
    },

    trackProductDetailView(product) {
      if (!isValidInsiderProductInput(product)) return;
      run('ürün detay görüntüleme', (activeSdk) => {
        activeSdk.visitProductDetailPage(buildProduct(activeSdk, product));
      });
    },

    trackCartView(items) {
      run('sepet görüntüleme', (activeSdk) => {
        const products = buildValidProducts(activeSdk, items);
        if (products.length === 0) return;
        activeSdk.visitCartPage(products);
      });
    },

    trackWishlistView(items) {
      run('favori listesi görüntüleme', (activeSdk) => {
        const products = buildValidProducts(activeSdk, items);
        if (products.length === 0) return;
        activeSdk.visitWishlistPage(products);
      });
    },

    trackAddToCart(product) {
      if (!isValidInsiderProductInput(product)) return;
      const attributed = withRecommendationId(product);
      run('sepete ekleme', (activeSdk) => {
        activeSdk.itemAddedToCart(buildProduct(activeSdk, attributed));
      });
    },

    trackRemoveFromCart(productId) {
      if (!productId.trim()) return;
      run('sepetten çıkarma', (activeSdk) => {
        activeSdk.itemRemovedFromCart(productId);
      });
    },

    trackCartCleared() {
      run('sepet temizleme', (activeSdk) => {
        activeSdk.cartCleared();
      });
    },

    trackAddToWishlist(product) {
      if (!isValidInsiderProductInput(product)) return;
      run('favoriye ekleme', (activeSdk) => {
        activeSdk.itemAddedToWishlist(buildProduct(activeSdk, product));
      });
    },

    trackRemoveFromWishlist(productId) {
      if (!productId.trim()) return;
      run('favoriden çıkarma', (activeSdk) => {
        activeSdk.itemRemovedFromWishlist(productId);
      });
    },

    trackPurchase(saleId, items) {
      if (!saleId.trim()) return;
      const attributed = items.filter(isValidInsiderProductInput).map(withRecommendationId);
      run('satın alma', (activeSdk) => {
        attributed.forEach((item) => {
          activeSdk.itemPurchased(saleId, buildProduct(activeSdk, item));
        });
      });
    },

    trackSignUp() {
      run('kayıt olma', (activeSdk) => {
        activeSdk.signUpConfirmation();
      });
    },

    /**
     * `identifyUser` çağrıldıktan sonra tetiklenmeli; event o anda tanımlı olan
     * profile yazılır. `logged_in` Insider'ın segmentasyon için istediği boolean.
     */
    trackUserLogin(method) {
      run('giriş eventi', (activeSdk) => {
        const event = activeSdk
          .tagEvent(USER_LOGIN_EVENT)
          .addParameterWithBoolean('logged_in', true);
        // Yöntem bilinmiyorsa parametreyi hiç göndermiyoruz; uydurma değer segmenti bozar.
        if (method) event.addParameterWithString('login_method', method);
        event.build();
      });
    },

    /**
     * `clearUser` çağrılmadan ÖNCE tetiklenmeli; aksi halde kullanıcı çoktan
     * anonimleşmiş olur ve event kimliksiz profile düşer.
     */
    trackUserLogout(reason) {
      run('çıkış eventi', (activeSdk) => {
        activeSdk
          .tagEvent(USER_LOGOUT_EVENT)
          .addParameterWithBoolean('logged_in', false)
          .addParameterWithString('logout_reason', reason)
          .build();
      });
    },

    trackReviewSubmitted(input) {
      if (!input.productId.trim()) return;
      run('yorum yapıldı', (activeSdk) => {
        activeSdk
          .tagEvent(REVIEW_SUBMITTED_EVENT)
          .addParameterWithString('product_id', input.productId)
          .addParameterWithInt('rating', Math.round(input.rating))
          .build();
      });
    },

    trackRecommendationClick(recommendationId, product) {
      // Sessiz düşen tıklama, o ürünün sepete ekleme ve gelir istatistiğini de
      // götürür; bu yüzden atlanan çağrı log'a yazılır.
      if (!isValidInsiderProductInput(product)) {
        dependencies.onDiagnostic(
          `[Insider] öneri tıklaması atlandı (eksik ürün alanı) · kampanya=${recommendationId} · ` +
            `kimlik=${product.id || '-'}`,
        );
        return;
      }

      const sent = run('öneri tıklaması', (activeSdk) => {
        activeSdk.clickSmartRecommendationProduct(recommendationId, buildProduct(activeSdk, product));
      });
      if (!sent) return;

      // Kimliği ancak tıklama gerçekten gittiyse hatırla; aksi halde sonraki
      // sepete ekleme olmayan bir tıklamaya bağlanmış gibi görünürdü.
      dependencies.recommendationAttribution.remember({
        matchKeys: getInsiderProductMatchKeys(product),
        productId: product.id,
        recommendationId,
      });
      dependencies.onDiagnostic(
        `[Insider] öneri tıklaması gönderildi · kampanya=${recommendationId} · kimlik=${product.id}`,
      );
    },

    restoreRecommendationAttribution() {
      return dependencies.recommendationAttribution.restore();
    },

    applyDefaultLocale() {
      run('dil/locale tanımlama', (activeSdk) => {
        const currentUser = activeSdk.getCurrentUser();
        if (!currentUser) return;
        currentUser.setLanguage(INSIDER_LANGUAGE);
        currentUser.setLocale(INSIDER_LOCALE);
      });
    },

    identifyUser(user) {
      run('kullanıcı bilgisi güncelleme', (activeSdk) => {
        const currentUser = activeSdk.getCurrentUser();
        if (!currentUser) return;

        const userId = toInsiderIdentifierValue(user.id);
        const email = user.email?.includes('@') ? user.email.trim() : null;
        const phone = toE164TurkishPhone(user.phoneNumber);

        // Sıra kritik: attribute'lar o an aktif olan Insider profiline yazılır.
        // Kimlik önce bildirilmezse isim/e-posta/telefon hâlâ anonim (ya da
        // cihazda daha önce tanıtılmış başka bir) profile düşer.
        if (userId || email || phone) {
          const IdentifierConstructor = dependencies.loadIdentifierConstructor();
          const identifiers = new IdentifierConstructor();
          if (userId) identifiers.addUserID(userId);
          if (email) identifiers.addEmail(email);
          if (phone) identifiers.addPhoneNumber(phone);
          currentUser.login(identifiers);
        }

        if (user.name) currentUser.setName(user.name);
        if (user.surname) currentUser.setSurname(user.surname);
        currentUser.setLanguage(INSIDER_LANGUAGE);
        currentUser.setLocale(INSIDER_LOCALE);
        if (email) currentUser.setEmail(email);
        if (phone) currentUser.setPhoneNumber(phone);
      });
    },

    clearUser() {
      run('oturum kapatma', (activeSdk) => {
        activeSdk.getCurrentUser()?.logout();
      });
    },
  };
}

export const insiderTracker = createInsiderTracker();
