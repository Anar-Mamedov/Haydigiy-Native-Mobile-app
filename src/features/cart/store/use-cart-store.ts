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
  setItems: (items: CartLineItem[]) => void;
  setQuantity: (productId: string, quantity: number, size?: string) => void;
};

export function calculateCartItemCount(items: CartLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateCartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/**
 * Total of the pre-discount prices. Combined with {@link calculateCartSubtotal}
 * this yields the amount saved, mirroring the web cart's struck-through pricing.
 */
export function calculateCartOriginalSubtotal(items: CartLineItem[]) {
  return items.reduce(
    (sum, item) => sum + item.quantity * (item.originalPrice ?? item.unitPrice),
    0,
  );
}

export function calculateCartSavings(items: CartLineItem[]) {
  return Math.max(calculateCartOriginalSubtotal(items) - calculateCartSubtotal(items), 0);
}

export function createCartStoreInitialState() {
  return {
    items: [] as CartLineItem[],
  };
}

/** Remaining stock for the chosen variant, or the product total when unsized. */
function resolveStock(product: Product, size?: string): number | undefined {
  if (size) {
    const variant = product.variants?.find((candidate) => candidate.name === size);
    if (variant) {
      return variant.quantity;
    }
  }
  return product.totalQuantity;
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
    color: product.color,
    slug: product.slug,
    originalPrice:
      product.originalPrice && product.originalPrice > product.price
        ? product.originalPrice
        : undefined,
    stock: resolveStock(product, size),
  };
}

/** Clamp a requested quantity to the [1, stock] range when stock is known. */
function clampQuantity(quantity: number, stock?: number): number {
  if (typeof stock === 'number' && stock > 0) {
    return Math.min(quantity, stock);
  }
  return quantity;
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
      setItems: (items) => {
        set({ items });
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
                    ? { ...item, quantity: clampQuantity(quantity, item.stock) }
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
