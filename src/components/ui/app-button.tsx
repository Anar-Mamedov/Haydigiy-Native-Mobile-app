import { forwardRef, ReactNode } from 'react';
import { Button, GetProps, Paragraph, useTheme, XStack } from 'tamagui';

export type AppButtonProps = GetProps<typeof Button> & {
  children?: ReactNode;
  /** Text/icon color. Applied to the button content rather than forwarded to Button. */
  color?: string;
};

export const AppButton = forwardRef<any, AppButtonProps>(function AppButton(
  { children, icon, iconAfter, color, ...buttonProps },
  ref,
) {
  const theme = useTheme();
  // Resolve theme tokens (e.g. "$red10") to a concrete color so the value works
  // in the plain `style`/icon `color` props, which don't resolve tokens themselves.
  // Without this the text falls back to black and becomes unreadable in dark mode.
  const textColor = color
    ? color.startsWith('$')
      ? theme[color.slice(1)]?.val ?? theme.color.val
      : color
    : theme.color.val;

  const renderIcon = (iconNode: AppButtonProps['icon']) => {
    if (!iconNode) {
      return null;
    }

    if (typeof iconNode === 'function') {
      const IconComponent = iconNode;
      return <IconComponent color={textColor} size={18} />;
    }

    return iconNode;
  };

  return (
    <Button
      backgroundColor="$backgroundFocus"
      borderColor="$borderColor"
      borderRadius="$6"
      borderWidth={1}
      pressStyle={{
        backgroundColor: '$backgroundPress',
        borderColor: '$borderColorPress',
      }}
      ref={ref}
      size="$4"
      {...buttonProps}
    >
      <XStack alignItems="center" gap="$2" justifyContent="center">
        {renderIcon(icon)}
        {typeof children === 'string' ? (
          <Paragraph fontWeight="600" numberOfLines={1} style={{ color: textColor }}>
            {children}
          </Paragraph>
        ) : (
          children
        )}
        {renderIcon(iconAfter)}
      </XStack>
    </Button>
  );
});
