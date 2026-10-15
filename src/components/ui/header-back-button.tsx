import { ComponentType } from 'react';
import { type AppIconProps, ArrowLeft } from '@/components/ui/icons';
import { IconButton } from '@/components/ui/icon-button';

const BACK_ICON_SIZE = 24;

type HeaderBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
  /** Ok yerine başka bir geri ikonu kullanan başlıklar için (ör. ChevronLeft). */
  Icon?: ComponentType<AppIconProps>;
};

/** Ekran başlıklarındaki geri butonu: 48dp dokunma alanı, "Geri dön" etiketi, temaya uyan ikon. */
export function HeaderBackButton({ accessibilityLabel = 'Geri dön', Icon = ArrowLeft, onPress }: HeaderBackButtonProps) {
  return (
    <IconButton accessibilityLabel={accessibilityLabel} onPress={onPress}>
      <Icon color="$color" size={BACK_ICON_SIZE} />
    </IconButton>
  );
}
