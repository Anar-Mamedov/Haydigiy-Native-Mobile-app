import { IconButton } from '@/components/ui/icon-button';
import { Eye, EyeOff } from '@/components/ui/icons';

const TOGGLE_ICON_SIZE = 20;

export interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

/** Şifre alanının sağındaki göster/gizle butonu; `IconButton` sayesinde dokunma alanı 48dp. */
export function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <IconButton accessibilityLabel={visible ? 'Şifreyi gizle' : 'Şifreyi göster'} onPress={onToggle}>
      <Icon color="$color10" size={TOGGLE_ICON_SIZE} />
    </IconButton>
  );
}
