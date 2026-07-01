import type { ComponentProps } from 'react';
import { Sheet } from 'tamagui';

type AppSheetOverlayProps = ComponentProps<typeof Sheet.Overlay>;

/**
 * Shared scrim rendered behind every bottom sheet. Centralizes the backdrop
 * color (the `$overlay` theme color) and fade animation so individual sheets do
 * not hard-code their own overlay styling.
 */
export function AppSheetOverlay(props: AppSheetOverlayProps) {
  return (
    <Sheet.Overlay
      backgroundColor="$overlay"
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
      {...props}
    />
  );
}
