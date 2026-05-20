import { H2, Paragraph, YStack } from 'tamagui';
import { AppScreen, EmptyState } from '@/components/ui';
import { CartSummaryCard } from '@/features/cart/components/cart-summary-card';
import { useCartStore } from '@/features/cart/store/use-cart-store';
import { CheckoutContactForm } from '@/features/checkout/components/checkout-contact-form';

export function CheckoutScreen() {
  const items = useCartStore((state) => state.items);

  return (
    <AppScreen>
      <YStack gap="$2">
        <H2>Checkout</H2>
        <Paragraph color="$color10">
          This route is ready for payment WebView or native SDK integration on top of validated
          form state.
        </Paragraph>
      </YStack>

      {items.length === 0 ? (
        <EmptyState
          description="Add products to the cart before verifying the checkout flow."
          title="Checkout needs cart items"
        />
      ) : (
        <YStack gap="$3">
          <CartSummaryCard />
          <CheckoutContactForm />
        </YStack>
      )}
    </AppScreen>
  );
}
