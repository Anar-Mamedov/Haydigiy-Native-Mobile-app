import {
  createInsiderTracker,
  REVIEW_SUBMITTED_EVENT,
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

class IdentifierMock implements InsiderIdentifierSdk {
  emails: string[] = [];
  phones: string[] = [];
  userIds: string[] = [];

  addEmail(email: string): this {
    this.emails.push(email);
    return this;
  }

  addPhoneNumber(phone: string): this {
    this.phones.push(phone);
    return this;
  }

  addUserID(userId: string): this {
    this.userIds.push(userId);
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
  } as unknown as jest.Mocked<InsiderSdk>;

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
  });

  return { tracker, sdk, productCalls, eventBuilder, insiderUser, identifiers };
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

  it('skips invalid e-mail and phone attributes but still logs in with the user id', () => {
    const { tracker, insiderUser, identifiers } = createSdkHarness();
    tracker.identifyUser({ id: 'user-2', email: '', name: 'Ali', phoneNumber: '123' });

    expect(insiderUser.setEmail).not.toHaveBeenCalled();
    expect(insiderUser.setPhoneNumber).not.toHaveBeenCalled();
    expect(identifiers[0].userIds).toEqual(['user-2']);
    expect(identifiers[0].emails).toEqual([]);
    expect(identifiers[0].phones).toEqual([]);
  });

  it('logs the Insider user out when the session ends', () => {
    const { tracker, insiderUser } = createSdkHarness();
    tracker.clearUser();
    expect(insiderUser.logout).toHaveBeenCalledTimes(1);
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
