import { forwardRef, ReactNode } from 'react';
import { Button, GetProps, Paragraph, useTheme, XStack } from 'tamagui';

export type AppButtonProps = GetProps<typeof Button> & {
  children?: ReactNode;
};

export const AppButton = forwardRef<any, AppButtonProps>(function AppButton(
  { children, icon, iconAfter, ...buttonProps },
  ref,
) {
  const theme = useTheme();
  const textColor = theme.color.val;

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
          <Paragraph fontWeight="700" numberOfLines={1} style={{ color: textColor }}>
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
