import { Platform, type TextInputProps } from 'react-native';

export type TextFieldLabelOptions = {
  /** Ekran okuyucunun alanı tanıtacağı ad. */
  label: string;
  /** Alanın ekranda görünen etiketinin `id`'si (native'de `nativeID`). */
  labelId?: string;
  /** Alanın ekranda görünen ipucu metni. */
  placeholder?: string;
  /** Testlerde platform seçmek için; varsayılanı çalışılan platform. */
  platform?: typeof Platform.OS;
};

export type TextFieldLabelProps = Pick<TextInputProps, 'accessibilityLabel' | 'accessibilityLabelledBy'>;

/**
 * Metin giriş alanının ekran okuyucu adını platforma uygun prop'larla verir.
 *
 * iOS'ta ad `accessibilityLabel` ile verilir. Android'de aynı prop EditText'in
 * `contentDescription`'ı olur; Play lansman öncesi raporunun "Düzenlenebilir öğe etiketi"
 * kontrolü bunu uyarı olarak işaretler, çünkü TalkBack yazılan metin yerine bu açıklamayı
 * okuyabilir. Android'de alanı görünen etiketi (`labeledBy`) ya da placeholder (EditText
 * ipucu) adlandırır; ikisi de yoksa son çare olarak etiket yine `accessibilityLabel` olur.
 */
export function getTextFieldLabelProps({
  label,
  labelId,
  placeholder,
  platform = Platform.OS,
}: TextFieldLabelOptions): TextFieldLabelProps {
  if (platform !== 'android') {
    return { accessibilityLabel: label };
  }

  if (labelId) {
    return { accessibilityLabelledBy: labelId };
  }

  return placeholder ? {} : { accessibilityLabel: label };
}
