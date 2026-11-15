import { CartLineItem } from '@/types/cart.types';
import { groupCartGifts } from './group-cart-gifts';

const line = (overrides: Partial<CartLineItem>): CartLineItem => ({
  imageUrl: '',
  productId: '1',
  quantity: 1,
  sellerName: '',
  title: 'Ürün',
  unitPrice: 100,
  itemType: 'product',
  ...overrides,
});

const DRESS = line({ title: 'Elbise', variantId: '11', cartItemId: '901' });
const BUNDLE = line({ title: 'Paket', itemType: 'bundle', bundleGroupId: 'b-1' });
const giftOf = (parentLineKey: string | undefined, cartItemId: string) =>
  line({ title: 'Çorap', variantId: '31', cartItemId, unitPrice: 0, isGift: true, parentLineKey });

const shape = (groups: ReturnType<typeof groupCartGifts>) =>
  groups.map(({ item, gifts }) => [item.title, gifts.map((gift) => gift.cartItemId)]);

describe('groupCartGifts', () => {
  it('moves a gift under the paid line the backend pointed to', () => {
    expect(shape(groupCartGifts([giftOf('cart:901', '950'), DRESS]))).toEqual([['Elbise', ['950']]]);
  });

  it('attaches gifts to a bundle line by its bundle key', () => {
    expect(shape(groupCartGifts([BUNDLE, giftOf('bundle:b-1', '951')]))).toEqual([['Paket', ['951']]]);
  });

  it('keeps several gifts of the same line together, in cart order', () => {
    expect(shape(groupCartGifts([DRESS, giftOf('cart:901', '950'), giftOf('cart:901', '952')]))).toEqual([
      ['Elbise', ['950', '952']],
    ]);
  });

  it('leaves a gift on its own card when its parent is not in the cart or no key came', () => {
    const groups = groupCartGifts([DRESS, giftOf('cart:404', '953'), giftOf(undefined, '954')]);

    expect(shape(groups)).toEqual([
      ['Elbise', []],
      ['Çorap', []],
      ['Çorap', []],
    ]);
  });

  it('never attaches to another gift or treats a paid line with a key as a gift', () => {
    const paidWithKey = line({ title: 'Gömlek', variantId: '12', cartItemId: '902', parentLineKey: 'cart:901' });
    const groups = groupCartGifts([DRESS, paidWithKey, giftOf('cart:950', '955'), giftOf('cart:901', '950')]);

    expect(shape(groups)).toEqual([
      ['Elbise', ['950']],
      ['Gömlek', []],
      ['Çorap', []],
    ]);
  });
});
