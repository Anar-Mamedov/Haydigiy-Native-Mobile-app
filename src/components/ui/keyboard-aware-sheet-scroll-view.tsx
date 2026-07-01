import { PropsWithChildren } from 'react';
import type { ComponentProps } from 'react';
import { KeyboardAwareFormScrollView } from '@/components/ui/keyboard-aware-form-scroll-view';

type KeyboardAwareSheetScrollViewProps = PropsWithChildren<
  Omit<ComponentProps<typeof KeyboardAwareFormScrollView>, 'children'>
>;

/**
 * Shared bottom-sheet form scroller that keeps focused inputs above the native
 * keyboard on repeated focus/show/hide cycles.
 */
export function KeyboardAwareSheetScrollView({
  bottomOffset = 24,
  children,
  ...props
}: KeyboardAwareSheetScrollViewProps) {
  return (
    <KeyboardAwareFormScrollView
      bottomOffset={bottomOffset}
      {...props}
    >
      {children}
    </KeyboardAwareFormScrollView>
  );
}
