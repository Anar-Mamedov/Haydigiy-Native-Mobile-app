import {
  createInsiderTracker,
  REVIEW_SUBMITTED_EVENT,
  USER_LOGIN_EVENT,
  USER_LOGOUT_EVENT,
  toE164TurkishPhone,
} from './insider-tracker';
import {
  InsiderEventBuilder,
  InsiderIdentifierSdk,
  InsiderProductSdk,
  InsiderSdk,
  InsiderUserSdk,
} from '../types/insider.types';
import { InsiderProductInput } from '../utils/insider-product.mapper';
import {
  RecommendationAttributionStore,
  RecommendationClick,
} from './insider-recommendation-attribution';
import { User } from '@/types/auth.types';

type ProductMockCall = {
  args: [string, string, string[], string, number, string];
  product: jest.Mocked<InsiderProductSdk>;
};

function createProductMock(): jest.Mocked<InsiderProductSdk> {
  const product = {
    setSize: jest.fn(),
    setSalePrice: jest.fn(),
    setQuantity: jest.fn(),
    setStock: jest.fn(),
    setBrand: jest.fn(),
    setColor: jest.fn(),
    setProductURL: jest.fn(),
  } as unknown as jest.Mocked<InsiderProductSdk>;
  Object.values(product).forEach((fn) => {
    if (jest.isMockFunction(fn)) fn.mockReturnValue(product);
  });
  return product;
}

function createEventBuilderMock(): jest.Mocked<InsiderEventBuilder> {
  const builder = {
    addParameterWithString: jest.fn(),
    addParameterWithInt: jest.fn(),
    addParameterWithDouble: jest.fn(),
    addParameterWithBoolean: jest.fn(),
    addParameterWithDate: jest.fn(),
    addParameterWithStringArray: jest.fn(),
    addParameterWithNumericArray: jest.fn(),
    build: jest.fn(),
  } as unknown as jest.Mocked<InsiderEventBuilder>;
  Object.values(builder).forEach((fn) => {
    if (jest.isMockFunction(fn)) fn.mockReturnValue(builder);
  });
  builder.build.mockReturnValue(undefined);
  return builder;
}

function createUserMock(): jest.Mocked<InsiderUserSdk> {
  const user = {
    setName: jest.fn(),
    setSurname: jest.fn(),
    setEmail: jest.fn(),
    setPhoneNumber: jest.fn(),
    setLanguage: jest.fn(),
    setLocale: jest.fn(),
    setEmailOptin: jest.fn(),
    setSMSOptin: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    setCustomAttributeWithString: jest.fn(),
    setCustomAttributeWithInt: jest.fn(),
    setCustomAttributeWithBoolean: jest.fn(),
    unsetCustomAttribute: jest.fn(),
  } as unknown as jest.Mocked<InsiderUserSdk>;
  Object.values(user).forEach((fn) => {
    if (jest.isMockFunction(fn)) fn.mockReturnValue(user);
  });
  return user;
}

/**
 * Gerçek SDK identifier'ları String bekler ve başka tipte geleni sessizce
 * düşürür; mock aynı sözleşmeyi uygular, aksi halde tip kayması testten kaçar.
 */
class IdentifierMock implements InsiderIdentifierSdk {
  emails: string[] = [];
  phones: string[] = [];
  userIds: string[] = [];

  addEmail(email: string): this {
    if (typeof email === 'string') this.emails.push(email);
    return this;
  }

  addPhoneNumber(phone: string): this {
    if (typeof phone === 'string') this.phones.push(phone);
    return this;
  }

  addUserID(userId: string): this {
    if (typeof userId === 'string') this.userIds.push(userId);
    return this;
  }

  addCustomIdentifier(): this {
    return this;
  }
}

function createSdkHarness() {
  const productCalls: ProductMockCall[] = [];
  const eventBuilder = createEventBuilderMock();
  const insiderUser = createUserMock();
  const identifiers: IdentifierMock[] = [];

  const sdk = {
    init: jest.fn(),
    registerWithQuietPermission: jest.fn(),
    setActiveForegroundPushView: jest.fn(),
    handleUniversalLink: jest.fn(),
    handleURL: jest.fn(),
    tagEvent: jest.fn(() => eventBuilder),
    getCurrentUser: jest.fn(() => insiderUser),
    createNewProduct: jest.fn((...args: ProductMockCall['args']) => {
      const product = createProductMock();
      productCalls.push({ args, product });
      return product;
    }),
    visitHomePage: jest.fn(),
    visitListingPage: jest.fn(),
    visitProductDetailPage: jest.fn(),
    visitCartPage: jest.fn(),
    visitWishlistPage: jest.fn(),
    itemAddedToCart: jest.fn(),
    itemRemovedFromCart: jest.fn(),
    cartCleared: jest.fn(),
    itemAddedToWishlist: jest.fn(),
    itemRemovedFromWishlist: jest.fn(),
    itemPurchased: jest.fn(),
    signUpConfirmation: jest.fn(),
    getSmartRecommendation: jest.fn(),
    getSmartRecommendationWithProduct: jest.fn(),
    getSmartRecommendationWithProductIDs: jest.fn(),
    clickSmartRecommendationProduct: jest.fn(),
  } as unknown as jest.Mocked<InsiderSdk>;

  const recommendationAttribution = createAttributionDouble();
  const onDiagnostic = jest.fn();

  const tracker = createInsiderTracker({
    isNativeSdkAvailable: () => true,
    loadSdk: () => sdk,
    loadIdentifierConstructor: () =>
      class extends IdentifierMock {
        constructor() {
          super();
          identifiers.push(this);
        }
      },
    onError: jest.fn(),
    onDiagnostic,
    recommendationAttribution,
  });

  return {
    tracker,
    sdk,
    productCalls,
    eventBuilder,
    insiderUser,
    identifiers,
    onDiagnostic,
    recommendationAttribution,
  };
}

/**
 * Bellekte çalışan öneri tıklama hafızası; gerçek mağaza gibi davranır ama
 * MMKV'ye dokunmaz.
 */
function createAttributionDouble(): RecommendationAttributionStore {
  let clicks: RecommendationClick[] = [];

  return {
    clear: () => {
      clicks = [];
    },
    remember: (click) => {
      clicks = clicks.filter((existing) => existing.productId !== click.productId);
      clicks.push({ ...click, clickedAt: 0 });
    },
    resolve: (keys) => {
      const candidates = keys.filter((key): key is string => Boolean(key));
      return (
        [...clicks]
          .reverse()
          .find((click) => click.matchKeys.some((key) => candidates.includes(key))) ?? null
      );
    },
    restore: async () => {},
  };
}

function createInput(overrides: Partial<InsiderProductInput> = {}): InsiderProductInput {
  return {
    id: '42',
    name: 'Mavi Elbise',
    taxonomy: ['Elbise'],
    imageUrl: 'https://cdn.example.com/42.jpg',
    price: 199.9,
    currency: 'TRY',
    ...overrides,
  };
}

const testUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Ayşe',
  surname: 'Yılmaz',
  phoneNumber: '5321234567',
};

describe('insider tracker', () => {
  it('stays a silent no-op when the native SDK is unavailable', () => {
    const loadSdk = jest.fn();
    const tracker = createInsiderTracker({
      isNativeSdkAvailable: () => false,
      loadSdk,
      loadIdentifierConstructor: jest.fn(),
      onError: jest.fn(),
      onDiagnostic: jest.fn(),
      recommendationAttribution: createAttributionDouble(),
    });

    tracker.trackHomePageView();
    tracker.trackAddToCart(createInput());
    tracker.identifyUser(testUser);

    expect(loadSdk).not.toHaveBeenCalled();
  });

  it('reports SDK failures through onError instead of throwing', () => {
    const onError = jest.fn();
    const tracker = createInsiderTracker({
      isNativeSdkAvailable: () => true,
      loadSdk: () =>
        ({
          visitHomePage: () => {
            throw new Error('native crash');
          },
        }) as unknown as InsiderSdk,
      loadIdentifierConstructor: jest.fn(),
      onError,
      onDiagnostic: jest.fn(),
      recommendationAttribution: createAttributionDouble(),
    });

    expect(() => tracker.trackHomePageView()).not.toThrow();
    expect(onError).toHaveBeenCalledWith(expect.stringContaining('ana sayfa'), expect.any(Error));
  });

  it('sends the home page visit', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackHomePageView();
    expect(sdk.visitHomePage).toHaveBeenCalledTimes(1);
  });

  it('sends the listing page visit with a cleaned taxonomy', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackListingPageView([' Kadın ', '', 'Elbise']);
    expect(sdk.visitListingPage).toHaveBeenCalledWith(['Kadın', 'Elbise']);
  });

  it('skips the listing page visit when the taxonomy is empty', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackListingPageView(['', '  ']);
    expect(sdk.visitListingPage).not.toHaveBeenCalled();
  });

  it('sends the product detail visit with a fully built product object', () => {
    const { tracker, sdk, productCalls } = createSdkHarness();
    tracker.trackProductDetailView(
      createInput({ salePrice: 149.9, size: 'M', quantity: 1, brand: 'HaydiGiy' }),
    );

    expect(sdk.createNewProduct).toHaveBeenCalledWith(
      '42',
      'Mavi Elbise',
      ['Elbise'],
      'https://cdn.example.com/42.jpg',
      199.9,
      'TRY',
    );
    const { product } = productCalls[0];
    expect(product.setSalePrice).toHaveBeenCalledWith(149.9);
    expect(product.setSize).toHaveBeenCalledWith('M');
    expect(product.setQuantity).toHaveBeenCalledWith(1);
    expect(product.setBrand).toHaveBeenCalledWith('HaydiGiy');
    expect(sdk.visitProductDetailPage).toHaveBeenCalledWith(product);
  });

  // Insider ekibinin talebi: kampanya kurulumunu kolaylaştırmak için ürün
  // objesinde `color` parametresi bulunsun.
  it('sets the color attribute on the product object when the snapshot has one', () => {
    const { tracker, productCalls } = createSdkHarness();
    tracker.trackProductDetailView(createInput({ color: 'Mavi' }));

    expect(productCalls[0].product.setColor).toHaveBeenCalledWith('Mavi');
  });

  it('omits the color attribute when the product has no colour information', () => {
    const { tracker, productCalls } = createSdkHarness();
    tracker.trackProductDetailView(createInput());

    expect(productCalls[0].product.setColor).not.toHaveBeenCalled();
  });

  it('carries the color through to purchase events', () => {
    const { tracker, productCalls } = createSdkHarness();
    tracker.trackPurchase('HG-1001', [createInput({ color: 'Siyah', quantity: 1 })]);

    expect(productCalls[0].product.setColor).toHaveBeenCalledWith('Siyah');
  });

  it('sends the cart view with every valid line and skips empty carts', () => {
    const { tracker, sdk } = createSdkHarness();

    tracker.trackCartView([]);
    expect(sdk.visitCartPage).not.toHaveBeenCalled();

    tracker.trackCartView([createInput(), createInput({ id: '', name: '' })]);
    expect(sdk.visitCartPage).toHaveBeenCalledTimes(1);
    expect(sdk.visitCartPage.mock.calls[0][0]).toHaveLength(1);
  });

  it('sends the wishlist view with the mapped products', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackWishlistView([createInput(), createInput({ id: '43' })]);
    expect(sdk.visitWishlistPage).toHaveBeenCalledTimes(1);
    expect(sdk.visitWishlistPage.mock.calls[0][0]).toHaveLength(2);
  });

  it('sends add/remove/clear cart events', () => {
    const { tracker, sdk } = createSdkHarness();

    tracker.trackAddToCart(createInput());
    expect(sdk.itemAddedToCart).toHaveBeenCalledTimes(1);

    tracker.trackRemoveFromCart('42');
    expect(sdk.itemRemovedFromCart).toHaveBeenCalledWith('42');

    tracker.trackCartCleared();
    expect(sdk.cartCleared).toHaveBeenCalledTimes(1);
  });

  it('ignores invalid add-to-cart snapshots', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackAddToCart(createInput({ price: 0 }));
    expect(sdk.itemAddedToCart).not.toHaveBeenCalled();
  });

  it('sends add/remove wishlist events', () => {
    const { tracker, sdk } = createSdkHarness();

    tracker.trackAddToWishlist(createInput());
    expect(sdk.itemAddedToWishlist).toHaveBeenCalledTimes(1);

    tracker.trackRemoveFromWishlist('42');
    expect(sdk.itemRemovedFromWishlist).toHaveBeenCalledWith('42');
  });

  it('sends one purchase event per order line with the shared sale id', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackPurchase('HG-1001', [
      createInput({ quantity: 2 }),
      createInput({ id: '43', quantity: 1 }),
      createInput({ id: '', name: '' }),
    ]);

    expect(sdk.itemPurchased).toHaveBeenCalledTimes(2);
    expect(sdk.itemPurchased.mock.calls[0][0]).toBe('HG-1001');
    expect(sdk.itemPurchased.mock.calls[1][0]).toBe('HG-1001');
  });

  it('skips the purchase when the sale id is missing', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackPurchase('  ', [createInput()]);
    expect(sdk.itemPurchased).not.toHaveBeenCalled();
  });

  it('sends the sign-up confirmation', () => {
    const { tracker, sdk } = createSdkHarness();
    tracker.trackSignUp();
    expect(sdk.signUpConfirmation).toHaveBeenCalledTimes(1);
  });

  it('sends user_login with the logged_in boolean and the login method', () => {
    const { tracker, sdk, eventBuilder } = createSdkHarness();
    tracker.trackUserLogin('password');

    expect(sdk.tagEvent).toHaveBeenCalledWith(USER_LOGIN_EVENT);
    expect(USER_LOGIN_EVENT).toMatch(/^[a-z_]+$/);
    expect(eventBuilder.addParameterWithBoolean).toHaveBeenCalledWith('logged_in', true);
    expect(eventBuilder.addParameterWithString).toHaveBeenCalledWith('login_method', 'password');
    expect(eventBuilder.build).toHaveBeenCalledTimes(1);
  });

  it('omits login_method when the caller does not know it', () => {
    const { tracker, eventBuilder } = createSdkHarness();
    tracker.trackUserLogin();

    expect(eventBuilder.addParameterWithBoolean).toHaveBeenCalledWith('logged_in', true);
    expect(eventBuilder.addParameterWithString).not.toHaveBeenCalled();
    expect(eventBuilder.build).toHaveBeenCalledTimes(1);
  });

  it('sends user_logout with the logged_in boolean and the logout reason', () => {
    const { tracker, sdk, eventBuilder } = createSdkHarness();
    tracker.trackUserLogout('session_expired');

    expect(sdk.tagEvent).toHaveBeenCalledWith(USER_LOGOUT_EVENT);
    expect(USER_LOGOUT_EVENT).toMatch(/^[a-z_]+$/);
    expect(eventBuilder.addParameterWithBoolean).toHaveBeenCalledWith('logged_in', false);
    expect(eventBuilder.addParameterWithString).toHaveBeenCalledWith(
      'logout_reason',
      'session_expired',
    );
    expect(eventBuilder.build).toHaveBeenCalledTimes(1);
  });

  it('sends yorum_yapildi as a lowercase custom event with typed parameters', () => {
    const { tracker, sdk, eventBuilder } = createSdkHarness();
    tracker.trackReviewSubmitted({ productId: '42', rating: 4.6 });

    expect(sdk.tagEvent).toHaveBeenCalledWith(REVIEW_SUBMITTED_EVENT);
    expect(REVIEW_SUBMITTED_EVENT).toMatch(/^[a-z_]+$/);
    expect(eventBuilder.addParameterWithString).toHaveBeenCalledWith('product_id', '42');
    expect(eventBuilder.addParameterWithInt).toHaveBeenCalledWith('rating', 5);
    expect(eventBuilder.build).toHaveBeenCalledTimes(1);
  });

  it('sets user attributes and logs in with e-mail, phone and user id identifiers', () => {
    const { tracker, insiderUser, identifiers } = createSdkHarness();
    tracker.identifyUser(testUser);

    expect(insiderUser.setName).toHaveBeenCalledWith('Ayşe');
    expect(insiderUser.setSurname).toHaveBeenCalledWith('Yılmaz');
    expect(insiderUser.setEmail).toHaveBeenCalledWith('user@example.com');
    expect(insiderUser.setPhoneNumber).toHaveBeenCalledWith('+905321234567');
    expect(insiderUser.setLanguage).toHaveBeenCalledWith('tr');

    expect(identifiers).toHaveLength(1);
    expect(identifiers[0].userIds).toEqual(['user-1']);
    expect(identifiers[0].emails).toEqual(['user@example.com']);
    expect(identifiers[0].phones).toEqual(['+905321234567']);
    expect(insiderUser.login).toHaveBeenCalledWith(identifiers[0]);
  });

  // Regresyon: backend `user.id`'yi JSON number döndürüyor. SDK String olmayan
  // identifier'ı sessizce düşürdüğü için CRM kimliği hiç gitmiyor ve eventler
  // kullanıcının profiliyle eşleşmiyordu.
  it('still sends the CRM user id when the backend returns it as a number', () => {
    const { tracker, identifiers } = createSdkHarness();
    tracker.identifyUser({ ...testUser, id: 12345 as unknown as string });

    expect(identifiers[0].userIds).toEqual(['12345']);
  });

  it('identifies the user before writing attributes so they cannot land on another profile', () => {
    const { tracker, insiderUser } = createSdkHarness();
    const order: string[] = [];
    insiderUser.login.mockImplementation(() => {
      order.push('login');
      return insiderUser;
    });
    insiderUser.setName.mockImplementation(() => {
      order.push('setName');
      return insiderUser;
    });
    insiderUser.setEmail.mockImplementation(() => {
      order.push('setEmail');
      return insiderUser;
    });

    tracker.identifyUser(testUser);

    expect(order[0]).toBe('login');
    expect(order).toContain('setName');
    expect(order).toContain('setEmail');
  });

  it('skips invalid e-mail and phone attributes but still logs in with the user id', () => {
    const { tracker, insiderUser, identifiers } = createSdkHarness();
    tracker.identifyUser({ id: 'user-2', email: '', name: 'Ali', phoneNumber: '123' });

    expect(insiderUser.setEmail).not.toHaveBeenCalled();
    expect(insiderUser.setPhoneNumber).not.toHaveBeenCalled();
    expect(identifiers[0].userIds).toEqual(['user-2']);
    expect(identifiers[0].emails).toEqual([]);
    expect(identifiers[0].phones).toEqual([]);
  });

  it('does not log in without a single usable identifier', () => {
    const { tracker, insiderUser, identifiers } = createSdkHarness();
    tracker.identifyUser({ id: '', email: '', name: 'Ali' });

    expect(identifiers).toHaveLength(0);
    expect(insiderUser.login).not.toHaveBeenCalled();
    expect(insiderUser.setName).toHaveBeenCalledWith('Ali');
  });

  it('logs the Insider user out when the session ends', () => {
    const { tracker, insiderUser } = createSdkHarness();
    tracker.clearUser();
    expect(insiderUser.logout).toHaveBeenCalledTimes(1);
  });

  /**
   * Smart Recommender: sepete ekleme ve satın alma istatistikleri, aynı oturumda
   * ürün için önce tıklama çağrısının yapılmış olmasına bağlı.
   */
  it('logs a recommendation click with the same product id used elsewhere', () => {
    const { tracker, sdk, productCalls } = createSdkHarness();

    tracker.trackRecommendationClick(9, createInput({ id: '1361384' }));

    expect(productCalls[0].args[0]).toBe('1361384');
    expect(sdk.clickSmartRecommendationProduct).toHaveBeenCalledWith(9, productCalls[0].product);
  });

  it('skips the recommendation click for an unusable product', () => {
    const { tracker, sdk } = createSdkHarness();

    tracker.trackRecommendationClick(9, createInput({ id: '', price: 0 }));

    expect(sdk.clickSmartRecommendationProduct).not.toHaveBeenCalled();
  });

  /** Locale, Smart Recommender'ın ön koşulu; misafir ziyaretçide de tanımlı olmalı. */
  it('sets language and locale without a signed-in user', () => {
    const { tracker, insiderUser } = createSdkHarness();

    tracker.applyDefaultLocale();

    expect(insiderUser.setLanguage).toHaveBeenCalledWith('tr');
    expect(insiderUser.setLocale).toHaveBeenCalledWith('tr_TR');
    expect(insiderUser.login).not.toHaveBeenCalled();
  });
});

/**
 * Insider, Smart Recommender'ın Add to Cart ve Revenue istatistiklerini yalnızca
 * tıklamada kullanılan ürün kimliğiyle eşleştirir; kimlik tutmazsa event panele
 * hiç düşmez.
 *
 * @see https://academy.insiderone.com/docs/react-native-smart-recommender#logger-for-statistics
 */
describe('smart recommender statistics chain', () => {
  const recommendedInput = () =>
    createInput({
      id: 'P-12345',
      productUrl: 'https://haydigiy.com/product/mavi-elbise-12345',
    });

  const cartInput = () =>
    createInput({
      id: '12345',
      productUrl: 'https://haydigiy.com/product/mavi-elbise-12345',
      quantity: 1,
    });

  it('remembers the clicked product so a later add-to-cart carries the same id', () => {
    const { tracker, sdk, productCalls } = createSdkHarness();

    tracker.trackRecommendationClick(1, recommendedInput());
    tracker.trackAddToCart(cartInput());

    expect(sdk.itemAddedToCart).toHaveBeenCalledTimes(1);
    // Sepetteki kimlik backend'den '12345' geliyor; event tıklamadaki 'P-12345' ile gider.
    const addToCartProduct = productCalls[productCalls.length - 1];
    expect(addToCartProduct.args[0]).toBe('P-12345');
  });

  it('carries the clicked id into the purchase event as well', () => {
    const { tracker, sdk, productCalls } = createSdkHarness();

    tracker.trackRecommendationClick(1, recommendedInput());
    tracker.trackPurchase('SALE-1', [cartInput()]);

    expect(sdk.itemPurchased).toHaveBeenCalledTimes(1);
    expect(productCalls[productCalls.length - 1].args[0]).toBe('P-12345');
  });

  it('leaves products that were never clicked untouched', () => {
    const { tracker, productCalls } = createSdkHarness();

    tracker.trackRecommendationClick(1, recommendedInput());
    tracker.trackAddToCart(createInput({ id: '99999' }));

    expect(productCalls[productCalls.length - 1].args[0]).toBe('99999');
  });

  it('does not remember a click the SDK never received', () => {
    const { tracker, sdk, productCalls, recommendationAttribution } = createSdkHarness();
    (sdk.clickSmartRecommendationProduct as jest.Mock).mockImplementation(() => {
      throw new Error('native crash');
    });

    tracker.trackRecommendationClick(1, recommendedInput());

    expect(recommendationAttribution.resolve(['mavi-elbise-12345'])).toBeNull();

    tracker.trackAddToCart(cartInput());
    expect(productCalls[productCalls.length - 1].args[0]).toBe('12345');
  });

  it('logs a dropped click instead of failing silently', () => {
    const { tracker, sdk, onDiagnostic } = createSdkHarness();

    tracker.trackRecommendationClick(1, createInput({ id: '12345', price: 0 }));

    expect(sdk.clickSmartRecommendationProduct).not.toHaveBeenCalled();
    expect(onDiagnostic).toHaveBeenCalledWith(expect.stringContaining('öneri tıklaması atlandı'));
  });

  it('logs the click that was sent so the chain can be verified on a device', () => {
    const { tracker, onDiagnostic } = createSdkHarness();

    tracker.trackRecommendationClick(4, recommendedInput());

    expect(onDiagnostic).toHaveBeenCalledWith(
      expect.stringContaining('öneri tıklaması gönderildi · kampanya=4 · kimlik=P-12345'),
    );
  });

  it('restores the persisted click memory through the tracker boundary', async () => {
    const { tracker, recommendationAttribution } = createSdkHarness();
    const restore = jest.spyOn(recommendationAttribution, 'restore');

    await tracker.restoreRecommendationAttribution();

    expect(restore).toHaveBeenCalledTimes(1);
  });
});

describe('toE164TurkishPhone', () => {
  it.each([
    ['5321234567', '+905321234567'],
    ['05321234567', '+905321234567'],
    ['+905321234567', '+905321234567'],
    ['0532 123 45 67', '+905321234567'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(toE164TurkishPhone(input)).toBe(expected);
  });

  it.each([[''], ['123'], [undefined], ['1234567890']])('rejects invalid input %s', (input) => {
    expect(toE164TurkishPhone(input as string | undefined)).toBeNull();
  });
});
