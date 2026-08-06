import { Eye, EyeOff } from '@/components/ui/icons';
import { Button } from 'tamagui';

export interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

export function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  return (
    <Button
      accessibilityLabel={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
      accessibilityRole="button"
      chromeless
      circular
      icon={visible ? <EyeOff color="$color10" /> : <Eye color="$color10" />}
      iconSize="$7"
      onPress={onToggle}
      pressStyle={{ opacity: 0.6 }}
      size="$4"
    />
  );
}
