import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

type CartState = {
  addItem: (product: Product, size?: string) => void;
  clearCart: () => void;
  items: CartLineItem[];
  removeItem: (productId: string, size?: string) => void;
  setQuantity: (productId: string, quantity: number, size?: string) => void;
};

export function calculateCartItemCount(items: CartLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateCartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function createCartStoreInitialState() {
  return {
    items: [] as CartLineItem[],
  };
}

function mapProductToCartItem(product: Product, size?: string): CartLineItem {
  return {
    imageUrl: product.imageUrl,
    productId: product.id,
    quantity: 1,
    sellerName: product.sellerName,
    title: product.title,
    unitPrice: product.price,
    size,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      ...createCartStoreInitialState(),
      addItem: (product, size) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id && item.size === size,
          );

          if (!existingItem) {
            return {
              items: [...state.items, mapProductToCartItem(product, size)],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        });
      },
      clearCart: () => {
        set(createCartStoreInitialState());
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size),
          ),
        }));
      },
      setQuantity: (productId, quantity, size) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) => !(item.productId === productId && item.size === size),
                )
              : state.items.map((item) =>
                  item.productId === productId && item.size === size
                    ? { ...item, quantity }
                    : item,
                ),
        }));
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
