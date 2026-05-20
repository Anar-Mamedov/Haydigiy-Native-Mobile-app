import { appStorage } from '@/lib/storage/mmkv';
import {
  calculateCartItemCount,
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
});
