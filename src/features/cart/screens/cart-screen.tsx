import { useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScrollView, Spinner, YStack } from 'tamagui';
import { AppScreen, ConfirmDialog, EmptyState } from '@/components/ui';
import { CartBanner } from '@/features/cart/components/cart-banner';
import { CartHeader } from '@/features/cart/components/cart-header';
import { CartItemCard } from '@/features/cart/components/cart-item-card';
import { CartRemoveItemDialog } from '@/features/cart/components/cart-remove-item-dialog';
import { CartRemovedItemsDialog } from '@/features/cart/components/cart-removed-items-dialog';
import { CartSummaryBar } from '@/features/cart/components/cart-summary-bar';
import { FreeShippingCampaignCard } from '@/features/cart/components/free-shipping-campaign-card';
import { ShippingEstimateInfo } from '@/features/shipping/components/shipping-estimate-info';
import { useCartController } from '@/features/cart/hooks/use-cart-controller';
import { getCartLineKey } from '@/features/cart/utils/cart-line';
import { InsiderRecommendationSection } from '@/features/insider/components/insider-recommendation-section';
import { useTrackCartPageView } from '@/features/insider/hooks/use-insider-page-tracking';

export function CartScreen() {
  const router = useRouter();
  const controller = useCartController();
  const { items, syncCart } = controller;

  // Insider "sepet görüntüleme": fires with the synced lines once per visit.
  useTrackCartPageView(
    items,
    !controller.isLoading && !controller.isSyncing && !controller.isError,
  );

  // Re-sync the account cart every time the screen gains focus so it always shows
  // a spinner on entry and reflects the latest server-side state (e.g. items added
  // from the web or just added to the cart).
  useFocusEffect(
    useCallback(() => {
      syncCart();
    }, [syncCart]),
  );

  const header = (
    <CartHeader
      canClear={items.length > 0}
      itemCount={controller.itemCount}
      onBack={controller.goBack}
      onClear={controller.requestClear}
    />
  );

  const removedDialog = (
    <CartRemovedItemsDialog
      message={controller.removedMessage}
      onClose={controller.dismissRemovedMessage}
      open={controller.removedMessage !== null}
    />
  );

  if (controller.isLoading || controller.isSyncing) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack alignItems="center" flex={1} justifyContent="center">
          <Spinner color="$brand" size="large" />
        </YStack>
      </AppScreen>
    );
  }

  if (controller.isError) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <YStack flex={1} justifyContent="center" padding="$4">
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Sepet bilgileri yüklenirken bir hata oluştu."
            onActionPress={() => syncCart()}
            primary
            title="Bir Hata Oluştu"
          />
        </YStack>
      </AppScreen>
    );
  }

  if (items.length === 0) {
    return (
      <AppScreen gap={0} header={header} padding={0} scrollable={false}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, gap: 16 }}>
          <CartBanner />
          <YStack flex={1} justifyContent="center">
            <EmptyState
              actionLabel="Alışverişe Başla"
              description="Sepetinizde henüz ürün bulunmamaktadır."
              onActionPress={() => router.push('/')}
              primary
              title="Sepetiniz Boş"
            />
          </YStack>
        </ScrollView>
        {removedDialog}
      </AppScreen>
    );
  }

  return (
    <AppScreen gap={0} header={header} padding={0} scrollable={false}>
      <YStack backgroundColor="$backgroundHover" flex={1}>
        <ScrollView
          contentContainerStyle={{ padding: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <CartBanner />
          <ShippingEstimateInfo estimate={controller.shippingEstimate} />
          <FreeShippingCampaignCard campaigns={controller.campaigns} subtotal={controller.subtotal} />

          {items.map((item) => (
            <CartItemCard
              deliveryMessage={controller.shippingEstimate?.message}
              item={item}
              key={getCartLineKey(item)}
              onPressBundleComponent={(component) => controller.openProductBySlug(component.slug)}
              onPressProduct={() => controller.openProduct(item)}
              onQuantityChange={(quantity) => controller.changeQuantity(item, quantity)}
              onRemovePress={() => controller.requestRemove(item)}
              updating={controller.updatingLineKey === getCartLineKey(item)}
            />
          ))}

          <InsiderRecommendationSection
            productIds={items.map((item) => item.productId)}
            slot="cart"
          />
        </ScrollView>

        <CartSummaryBar
          discount={0}
          expanded={controller.isSummaryExpanded}
          isCheckingOut={controller.isCheckingOut}
          itemCount={controller.itemCount}
          onCheckout={controller.checkout}
          onToggle={controller.toggleSummary}
          subtotal={controller.subtotal}
          total={controller.total}
        />
      </YStack>

      <CartRemoveItemDialog
        onOpenChange={(open) => {
          if (!open) controller.closeRemoveDialog();
        }}
        onRemove={controller.confirmRemove}
        onRemoveAndFavorite={controller.confirmRemoveAndFavorite}
        open={controller.removeTarget !== null}
      />

      <ConfirmDialog
        cancelLabel="Vazgeç"
        confirmLabel="Evet, Temizle"
        description="Sepetteki tüm ürünler silinecek. Bu işlem geri alınamaz."
        destructive
        onConfirm={controller.confirmClear}
        onOpenChange={controller.setIsClearDialogOpen}
        open={controller.isClearDialogOpen}
        title="Sepeti Temizlemek İstediğinize Emin Misiniz?"
      />

      {removedDialog}
    </AppScreen>
  );
}
