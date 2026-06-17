import { appStorage } from '@/lib/storage/mmkv';
import {
  calculateCartItemCount,
  calculateCartSavings,
  calculateCartSubtotal,
  createCartStoreInitialState,
  useCartStore,
} from '@/features/cart/store/use-cart-store';
import { Product } from '@/types/product.types';

const productFixture: Product = {
  brand: 'Test Brand',
  category: 'Test Category',
  currency: 'TRY',
  description: 'Test product description',
  id: 'product-1',
  imageUrl: 'https://example.com/product.png',
  price: 500,
  rating: 4.5,
  reviewCount: 10,
  sellerName: 'Test Seller',
  shippingLabel: 'Ships today',
  slug: 'test-product',
  title: 'Test Product',
};

const discountedSizedFixture: Product = {
  ...productFixture,
  id: 'product-2',
  slug: 'discounted-product',
  price: 400,
  originalPrice: 500,
  variants: [
    { id: '201', name: 'M', quantity: 2, price: 400, hasStock: true },
    { id: '202', name: 'L', quantity: 0, price: 400, hasStock: false },
  ],
};

describe('useCartStore', () => {
  beforeEach(() => {
    appStorage.clearAll();
    useCartStore.setState({
      ...createCartStoreInitialState(),
      addItem: useCartStore.getState().addItem,
      clearCart: useCartStore.getState().clearCart,
      removeItem: useCartStore.getState().removeItem,
      setQuantity: useCartStore.getState().setQuantity,
    });
  });

  it('adds the same product by increasing quantity instead of duplicating the line item', () => {
    useCartStore.getState().addItem(productFixture);
    useCartStore.getState().addItem(productFixture);

    const { items } = useCartStore.getState();

    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(2);
    expect(calculateCartItemCount(items)).toBe(2);
    expect(calculateCartSubtotal(items)).toBe(1000);
  });

  it('removes a product when quantity is set to zero', () => {
    useCartStore.getState().addItem(productFixture);
    useCartStore.getState().setQuantity(productFixture.id, 0);

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('captures slug, original price and variant stock when mapping a product', () => {
    useCartStore.getState().addItem(discountedSizedFixture, 'M');

    const item = useCartStore.getState().items[0];

    expect(item).toMatchObject({
      slug: 'discounted-product',
      originalPrice: 500,
      unitPrice: 400,
      size: 'M',
      stock: 2,
    });
  });

  it('exposes savings from the pre-discount original subtotal', () => {
    useCartStore.getState().addItem(discountedSizedFixture, 'M');
    useCartStore.getState().setQuantity(discountedSizedFixture.id, 2, 'M');

    const { items } = useCartStore.getState();
    expect(calculateCartSubtotal(items)).toBe(800);
    expect(calculateCartSavings(items)).toBe(200);
  });

  it('clamps quantity to the available variant stock', () => {
    useCartStore.getState().addItem(discountedSizedFixture, 'M');
    useCartStore.getState().setQuantity(discountedSizedFixture.id, 9, 'M');

    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
  });

  it('does not set an original price when the product is not discounted', () => {
    useCartStore.getState().addItem(productFixture);

    expect(useCartStore.getState().items[0]?.originalPrice).toBeUndefined();
  });
});
