import { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-controller';

type KeyboardAwareFormScrollViewProps = PropsWithChildren<
  Omit<KeyboardAwareScrollViewProps, 'children' | 'contentContainerStyle'> & {
    contentContainerStyle?: StyleProp<ViewStyle>;
  }
>;

/**
 * Shared form scroller that keeps focused inputs visible above the native
 * keyboard without adding bounce/overscroll when the content already fits.
 */
export function KeyboardAwareFormScrollView({
  alwaysBounceVertical = false,
  bounces = false,
  bottomOffset = 24,
  children,
  contentContainerStyle,
  extraKeyboardSpace,
  keyboardShouldPersistTaps = 'handled',
  overScrollMode = 'never',
  showsVerticalScrollIndicator = false,
  ...props
}: KeyboardAwareFormScrollViewProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <KeyboardAwareScrollView
      alwaysBounceVertical={alwaysBounceVertical}
      bounces={bounces}
      bottomOffset={bottomOffset}
      contentContainerStyle={[{ paddingBottom: bottomInset }, contentContainerStyle]}
      extraKeyboardSpace={extraKeyboardSpace ?? bottomInset}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      overScrollMode={overScrollMode}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
