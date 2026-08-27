import { useState } from 'react';
import { Linking, Pressable } from 'react-native';
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from '@/components/ui/icons';
import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { SectionCard } from '@/components/ui';
import { WHATSAPP_SUPPORT_PHONE_DISPLAY, buildWhatsappUrl } from '@/utils/whatsapp';

const CUSTOMER_SERVICE_PHONE = '08502590449';
const CUSTOMER_SERVICE_PHONE_DISPLAY = '+90 850 259 0 449';
const WHATSAPP_PHONE_DISPLAY = WHATSAPP_SUPPORT_PHONE_DISPLAY;
const WHATSAPP_MESSAGE = 'Merhaba';
const CUSTOMER_SERVICE_EMAIL = 'info@haydigiy.com';
const COMPANY_ADDRESS =
  'Kale Mah. Şehit Emin Özmen Sk. Hacı İhsan Akdoğan İş Merkezi C Blok Altı No: 127 Merkez, Niğde';

function openUrl(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

type ContactRowProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

function ContactRow({ icon, title, subtitle, onPress }: ContactRowProps) {
  const content = (
    <XStack
      alignItems="center"
      borderColor="$borderColor"
      borderRadius="$3"
      borderWidth={1}
      gap="$3"
      padding="$3"
    >
      <XStack alignItems="center" justifyContent="center" width={24}>
        {icon}
      </XStack>
      <YStack flex={1}>
        <Paragraph color="$color" fontSize={14}>
          {title}
        </Paragraph>
        {subtitle ? (
          <Paragraph color="$color10" fontSize={12}>
            {subtitle}
          </Paragraph>
        ) : null}
      </YStack>
    </XStack>
  );

  if (!onPress) return content;
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {content}
    </Pressable>
  );
}

/** "Bize Ulaşın" expandable card with phone, WhatsApp, e-mail and address. */
export function AccountContactCard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <SectionCard elevated>
      <YStack gap="$2">
        <Pressable
          accessibilityLabel="Bize Ulaşın"
          accessibilityRole="button"
          onPress={() => setExpanded((prev) => !prev)}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <XStack alignItems="center" gap="$3" paddingVertical="$1">
            <XStack alignItems="center" justifyContent="center" width={24}>
              <Headphones color="$color10" size={20} />
            </XStack>
            <Paragraph color="$color" flex={1} fontSize={14} fontWeight="500">
              Bize Ulaşın
            </Paragraph>
            {expanded ? (
              <ChevronUp color="$color9" size={20} />
            ) : (
              <ChevronDown color="$color9" size={20} />
            )}
          </XStack>
        </Pressable>

        {expanded ? (
          <YStack gap="$2">
            <ContactRow
              icon={<Phone color="$color10" size={20} />}
              onPress={() => openUrl(`tel:${CUSTOMER_SERVICE_PHONE}`)}
              subtitle="Müşteri Temsilcisi"
              title={CUSTOMER_SERVICE_PHONE_DISPLAY}
            />
            <ContactRow
              icon={<MessageCircle color="$green10" size={20} />}
              onPress={() =>
                openUrl(buildWhatsappUrl(WHATSAPP_MESSAGE))
              }
              subtitle={WHATSAPP_PHONE_DISPLAY}
              title="WhatsApp"
            />
            <ContactRow
              icon={<Mail color="$color10" size={20} />}
              onPress={() => openUrl(`mailto:${CUSTOMER_SERVICE_EMAIL}`)}
              title={CUSTOMER_SERVICE_EMAIL}
            />
            <ContactRow icon={<MapPin color="$color10" size={20} />} title={COMPANY_ADDRESS} />
          </YStack>
        ) : null}
      </YStack>
    </SectionCard>
  );
}
