export type InsiderPayload = Record<string, unknown>;

export type InsiderCallback = (type: number, payload: InsiderPayload) => void;

/** Chainable custom-event builder returned by `RNInsider.tagEvent()`. */
export interface InsiderEventBuilder {
  addParameterWithString(key: string, value: string): this;
  addParameterWithInt(key: string, value: number): this;
  addParameterWithDouble(key: string, value: number): this;
  addParameterWithBoolean(key: string, value: boolean): this;
  addParameterWithDate(key: string, value: Date): this;
  addParameterWithStringArray(key: string, value: string[]): this;
  addParameterWithNumericArray(key: string, value: number[]): this;
  build(): void;
}

/** Identifier bag passed to `InsiderUser.login()` (e-mail, E164 phone, CRM id). */
export interface InsiderIdentifierSdk {
  addEmail(email: string): this;
  addPhoneNumber(phoneNumber: string): this;
  addUserID(userID: string): this;
  addCustomIdentifier(key: string, value: string): this;
}

/** Current-user handle returned by `RNInsider.getCurrentUser()`. */
export interface InsiderUserSdk {
  setName(value: string): this;
  setSurname(value: string): this;
  setEmail(value: string): this;
  setPhoneNumber(value: string): this;
  setLanguage(value: string): this;
  setLocale(value: string): this;
  setEmailOptin(value: boolean): this;
  setSMSOptin(value: boolean): this;
  login(identifiers: InsiderIdentifierSdk): this;
  logout(): this;
  setCustomAttributeWithString(key: string, value: string): this;
  setCustomAttributeWithInt(key: string, value: number): this;
  setCustomAttributeWithBoolean(key: string, value: boolean): this;
  unsetCustomAttribute(key: string): this;
}

/** Product handle returned by `RNInsider.createNewProduct()`. */
export interface InsiderProductSdk {
  setSize(size: string): this;
  setSalePrice(salePrice: number): this;
  setQuantity(quantity: number): this;
  setStock(stock: number): this;
  setBrand(brand: string): this;
  setColor(color: string): this;
  setProductURL(productURL: string): this;
}

export type InsiderCustomParameters = Record<
  string,
  string | number | boolean | Date | number[] | string[]
>;

export interface InsiderSdk {
  init(
    partnerName: string,
    appGroup: string,
    callback: (type: number, payload: InsiderPayload) => void,
  ): void;
  registerWithQuietPermission(enabled: boolean): void;
  setActiveForegroundPushView(): void;
  handleUniversalLink(url: string): void;
  handleURL(url: string): void;
  tagEvent(name: string): InsiderEventBuilder;
  getCurrentUser(): InsiderUserSdk | null | undefined;
  createNewProduct(
    productID: string,
    name: string,
    taxonomy: string[],
    imageURL: string,
    price: number,
    currency: string,
  ): InsiderProductSdk;
  visitHomePage(customParameters?: InsiderCustomParameters): void;
  visitListingPage(taxonomy: string[], customParameters?: InsiderCustomParameters): void;
  visitProductDetailPage(
    product: InsiderProductSdk,
    customParameters?: InsiderCustomParameters,
  ): void;
  visitCartPage(products: InsiderProductSdk[], customParameters?: InsiderCustomParameters): void;
  visitWishlistPage(
    products: InsiderProductSdk[],
    customParameters?: InsiderCustomParameters,
  ): void;
  itemAddedToCart(product: InsiderProductSdk, customParameters?: InsiderCustomParameters): void;
  itemRemovedFromCart(productID: string, customParameters?: InsiderCustomParameters): void;
  cartCleared(customParameters?: InsiderCustomParameters): void;
  itemAddedToWishlist(product: InsiderProductSdk, customParameters?: InsiderCustomParameters): void;
  itemRemovedFromWishlist(
    productID: string,
    customParameters?: InsiderCustomParameters,
  ): void;
  itemPurchased(
    uniqueSaleID: string,
    product: InsiderProductSdk,
    customParameters?: InsiderCustomParameters,
  ): void;
  signUpConfirmation(customParameters?: InsiderCustomParameters): void;
}

/** Constructor of the identifier bag (`react-native-insider/src/InsiderIdentifier`). */
export type InsiderIdentifierConstructor = new () => InsiderIdentifierSdk;

export interface InsiderClient {
  initialize(callback: InsiderCallback): boolean;
  clearCallback(callback: InsiderCallback): void;
  handleIncomingUrl(url: string): void;
}

export type InsiderPushAction =
  | { type: 'internal'; url: string }
  | { type: 'external'; url: string }
  | null;
