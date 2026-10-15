import { Text, type GetProps } from 'tamagui';

export type InlineTextLinkProps = Omit<GetProps<typeof Text>, 'onPress' | 'children'> & {
  children: string;
  onPress: () => void;
};

/**
 * Bir paragrafın içinde akan, basılabilir metin bağlantısı (ör. "Aydınlatma
 * Metni"). Bir `Paragraph` içine yerleştirilir; vurgu rengi ve alt çizgi
 * bileşenin kendisinde tanımlı olduğundan iki temada da link olarak okunur ve
 * ekran okuyuculara `link` rolüyle duyurulur.
 *
 * Boyut tanımı olmayan çekirdek `Text` kullanılır: yazı boyutu ve satır yüksekliği
 * çevreleyen paragraftan miras alınır. `Paragraph` kendi varsayılan boyutunu
 * (`$true`) uyguladığı için link çevresindeki metinden büyük görünürdü.
 */
export function InlineTextLink({ children, onPress, ...props }: InlineTextLinkProps) {
  return (
    <Text
      accessibilityLabel={children}
      accessibilityRole="link"
      color="$brand"
      fontWeight="700"
      onPress={onPress}
      textDecorationLine="underline"
      {...props}
    >
      {children}
    </Text>
  );
}
