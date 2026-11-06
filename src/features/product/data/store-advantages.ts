import type { ComponentType } from 'react';
import { ArrowLeft, Package, ShieldCheck, ShoppingCart, type AppIconProps } from '@/components/ui/icons';

export type StoreAdvantageIcon = ComponentType<AppIconProps>;

export type StoreAdvantage = {
  /** Small uppercase caption above the advantage. */
  caption: string;
  title: string;
  icon: StoreAdvantageIcon;
};

/**
 * The advantages band of the web footer (`frontend/src/components/layout/StoreAdvantagesBand.tsx`),
 * same texts and order. Keep both lists in sync until the texts come from the backend.
 */
export const STORE_ADVANTAGES: readonly StoreAdvantage[] = [
  { caption: 'Siparişleriniz', title: '24 Saatte Kargoda', icon: Package },
  { caption: 'İade', title: '14 Gün Koşulsuz İade', icon: ArrowLeft },
  { caption: 'Ödeme', title: 'Kapıda Ödeme Kolaylığı', icon: ShoppingCart },
  { caption: 'Güvenlik', title: '%100 Güvenli Ödeme Sayfası', icon: ShieldCheck },
];
