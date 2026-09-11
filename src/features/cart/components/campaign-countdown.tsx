import { XStack } from 'tamagui';
import { Clock } from '@/components/ui/icons';
import { Paragraph, type ParagraphProps } from '@/components/ui/app-paragraph';
import { useCampaignTimeLeft } from '@/features/cart/hooks/use-campaign-time-left';
import type { CampaignTimeLeft } from '@/features/cart/hooks/use-campaign-time-left';

type CampaignCountdownProps = {
  /** Kampanya bitiş tarihi; boşsa sayaç hiç render edilmez. */
  endDate: string | null | undefined;
  label?: string;
};

type CampaignCountdownTextProps = {
  endDate: string | null | undefined;
  /** Sayacın bulunduğu yüzeye göre kontrastı koruyan tema rengi. */
  color?: ParagraphProps['color'];
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** Sayacın erişilebilirlik etiketi; ekran okuyucu rozetleri tek tek okumasın. */
function toAccessibilityLabel(timeLeft: CampaignTimeLeft) {
  const parts = [
    timeLeft.days > 0 ? `${timeLeft.days} gün` : null,
    `${timeLeft.hours} saat`,
    `${timeLeft.minutes} dakika`,
    `${timeLeft.seconds} saniye`,
  ].filter(Boolean);

  return `Kampanya bitişine ${parts.join(' ')} kaldı`;
}

function CountdownChip({ label }: { label: string }) {
  return (
    <XStack
      alignItems="center"
      backgroundColor="$brand"
      borderRadius="$2"
      justifyContent="center"
      opacity={0.92}
      paddingHorizontal="$1.5"
      paddingVertical="$0.5"
    >
      <Paragraph color="white" fontSize={11} fontWeight="800">
        {label}
      </Paragraph>
    </XStack>
  );
}

/**
 * Kampanya kartlarındaki etiketli geri sayım. Kalan süreyi marka renkli
 * rozetlerle gösterir; süresi dolmuş ya da bitiş tarihi olmayan kampanyada
 * hiçbir şey çizmez.
 */
export function CampaignCountdown({ endDate, label = 'Kampanya bitiş:' }: CampaignCountdownProps) {
  const timeLeft = useCampaignTimeLeft(endDate);
  if (timeLeft.expired) return null;

  return (
    <XStack
      accessibilityLabel={toAccessibilityLabel(timeLeft)}
      alignItems="center"
      gap="$1.5"
      marginTop="$2"
    >
      <Clock color="$brand" size={14} />
      <Paragraph color="$color10" fontSize={12}>
        {label}
      </Paragraph>
      <XStack alignItems="center" gap="$1">
        {timeLeft.days > 0 ? <CountdownChip label={`${timeLeft.days}g`} /> : null}
        <CountdownChip label={`${pad(timeLeft.hours)}s`} />
        <CountdownChip label={`${pad(timeLeft.minutes)}d`} />
        <CountdownChip label={`${pad(timeLeft.seconds)}sn`} />
      </XStack>
    </XStack>
  );
}

/**
 * Dar yüzeyler için tek satırlık geri sayım (kargo satırındaki "Ücretsiz"
 * rozetinin altı gibi). Rozetli sürüm bu genişliğe sığmadığı için aynı süreyi
 * düz metin olarak yazar.
 */
export function CampaignCountdownText({ endDate, color = '$green10' }: CampaignCountdownTextProps) {
  const timeLeft = useCampaignTimeLeft(endDate);
  if (timeLeft.expired) return null;

  const days = timeLeft.days > 0 ? `${timeLeft.days}g ` : '';

  return (
    <Paragraph
      accessibilityLabel={toAccessibilityLabel(timeLeft)}
      color={color}
      fontSize={11}
      fontWeight="700"
    >
      {`${days}${pad(timeLeft.hours)}s:${pad(timeLeft.minutes)}d:${pad(timeLeft.seconds)}sn`}
    </Paragraph>
  );
}
