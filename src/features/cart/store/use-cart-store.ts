import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/zustand-storage';
import { CartLineItem } from '@/types/cart.types';
import { Product } from '@/types/product.types';

type CartState = {
  addItem: (product: Product) => void;
  clearCart: () => void;
  items: CartLineItem[];
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
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

function mapProductToCartItem(product: Product): CartLineItem {
  return {
    imageUrl: product.imageUrl,
    productId: product.id,
    quantity: 1,
    sellerName: product.sellerName,
    title: product.title,
    unitPrice: product.price,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      ...createCartStoreInitialState(),
      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.productId === product.id);

          if (!existingItem) {
            return {
              items: [...state.items, mapProductToCartItem(product)],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          };
        });
      },
      clearCart: () => {
        set(createCartStoreInitialState());
      },
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      setQuantity: (productId, quantity) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.productId !== productId)
              : state.items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
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
