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
import { AssistantArrowCircle, AssistantIconTile } from '../assistant-surfaces';

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

const ICON_SIZE = 18;
const LINK_BUTTON_MIN_HEIGHT = 52;

/**
 * Sitedeki sayfanın uygulamadaki karşılığına götüren belirgin düğme (etiket AYNEN basılır).
 * Web `0aae36636`: açık zemin, turuncu simge kutusu ve sağda ok halkası.
 */
export function AssistantLinkButton({ block }: { block: AssistantLinkButtonBlock }) {
  const onPress = useAssistantLinkPress();
  const Icon = KIND_ICONS[block.kind] ?? Link2;

  return (
    <XStack
      accessibilityLabel={block.label}
      accessibilityRole="link"
      alignItems="center"
      backgroundColor="$background"
      borderColor="$assistantAccentTintBorder"
      borderRadius="$6"
      borderWidth={1}
      gap="$3"
      minHeight={Math.max(MIN_TOUCH_TARGET, LINK_BUTTON_MIN_HEIGHT)}
      onPress={() => onPress(block)}
      paddingHorizontal="$3"
      paddingVertical="$2.5"
      pressStyle={{ backgroundColor: '$color3' }}
      testID={`assistant-link-${block.id}`}
    >
      <AssistantIconTile>
        <Icon color="white" size={ICON_SIZE} />
      </AssistantIconTile>
      <Paragraph color="$brandTintText" flex={1} fontSize={14} fontWeight="800">
        {block.label}
      </Paragraph>
      <AssistantArrowCircle>
        <ArrowUpRight color="$brandTintText" size={16} />
      </AssistantArrowCircle>
    </XStack>
  );
}
