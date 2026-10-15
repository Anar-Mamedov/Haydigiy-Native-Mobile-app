import { type ColorTokens } from 'tamagui';
import { TextActionButton } from '@/components/ui/text-action-button';

type HeaderTextButtonProps = {
  label: string;
  onPress: () => void;
  color: ColorTokens;
  accessibilityLabel?: string;
};

/**
 * Başlık çubuğunun sağındaki yazılı aksiyon ("Sepeti Temizle", "Temizle"). Yazı küçük kalır ama
 * dokunma alanı 48dp yüksekliğindedir. Devre dışı hâli yoktur: yapılacak bir şey yoksa çağıran
 * butonu hiç çizmez; soluklaştırılmış yazı ekran okuyucuda etkinmiş gibi duyulur ve kontrast
 * taramasına takılır.
 */
export function HeaderTextButton({ accessibilityLabel, color, label, onPress }: HeaderTextButtonProps) {
  return (
    <TextActionButton
      accessibilityLabel={accessibilityLabel}
      color={color}
      label={label}
      onPress={onPress}
      paddingHorizontal={4}
    />
  );
}
