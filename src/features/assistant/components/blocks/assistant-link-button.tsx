import type { ComponentType } from 'react';
import { XStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import {
  ArrowUpRight,
  CircleHelp,
  FileText,
  Grid,
  KeyRound,
  Link2,
  LogIn,
  MapPin,
  Package,
  Undo2,
  UserRound,
  XCircle,
  type AppIconProps,
} from '@/components/ui/icons';
import { MIN_TOUCH_TARGET } from '@/components/ui/icon-button';
import type { AssistantLinkButtonBlock } from '@/types/assistant.types';
import { useAssistantLinkPress } from '../../hooks/use-assistant-link-press';

/** `kind` YALNIZ simge içindir; yönlendirme her zaman `href`'tedir (README §6.6). */
const KIND_ICONS: Record<string, ComponentType<AppIconProps>> = {
  giris: LogIn,
  liste: Grid,
  hesap: UserRound,
  adres: MapPin,
  sifre: KeyRound,
  yardim: CircleHelp,
  siparis: Package,
  fatura: FileText,
  iade: Undo2,
  iptal: XCircle,
};

const ICON_SIZE = 20;

/** Sitedeki sayfanın uygulamadaki karşılığına götüren belirgin düğme (etiket AYNEN basılır). */
export function AssistantLinkButton({ block }: { block: AssistantLinkButtonBlock }) {
  const onPress = useAssistantLinkPress();
  const Icon = KIND_ICONS[block.kind] ?? Link2;

  return (
    <XStack
      accessibilityLabel={block.label}
      accessibilityRole="link"
      alignItems="center"
      backgroundColor="$assistantLinkButton"
      borderRadius="$5"
      gap="$2.5"
      minHeight={MIN_TOUCH_TARGET}
      onPress={() => onPress(block)}
      paddingHorizontal="$3.5"
      paddingVertical="$2.5"
      pressStyle={{ opacity: 0.85 }}
      testID={`assistant-link-${block.id}`}
    >
      <Icon color="white" size={ICON_SIZE} />
      <Paragraph color="white" flex={1} fontSize={15} fontWeight="700">
        {block.label}
      </Paragraph>
      <ArrowUpRight color="white" size={ICON_SIZE} />
    </XStack>
  );
}
