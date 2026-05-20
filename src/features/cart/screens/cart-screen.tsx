import { useRouter } from 'expo-router';
import { H2, Paragraph, YStack } from 'tamagui';
import { AppButton, AppScreen, EmptyState } from '@/components/ui';
import { CartItemCard } from '@/features/cart/components/cart-item-card';
import { CartSummaryCard } from '@/features/cart/components/cart-summary-card';
import { useCartStore } from '@/features/cart/store/use-cart-store';

export function CartScreen() {
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <AppScreen>
      <YStack gap="$2">
        <H2>Cart</H2>
        <Paragraph color="$color10">
          Persistent cart state is backed by Zustand and MMKV.
        </Paragraph>
      </YStack>

      {items.length === 0 ? (
        <EmptyState
          actionLabel="Browse products"
          description="Add a few products to verify persistence and checkout wiring."
          onActionPress={() => router.push('/(tabs)')}
          title="Your cart is empty"
        />
      ) : (
        <YStack gap="$3">
          <CartSummaryCard />
          {items.map((item) => (
            <CartItemCard
              item={item}
              key={item.productId}
              onDecrease={() => setQuantity(item.productId, item.quantity - 1)}
              onIncrease={() => setQuantity(item.productId, item.quantity + 1)}
              onRemove={() => removeItem(item.productId)}
            />
          ))}
          <AppButton onPress={() => router.push('/checkout')}>Continue to checkout</AppButton>
          <AppButton onPress={clearCart}>Clear cart</AppButton>
        </YStack>
      )}
    </AppScreen>
  );
}
