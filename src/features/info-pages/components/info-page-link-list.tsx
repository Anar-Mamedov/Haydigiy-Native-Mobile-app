import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Separator, XStack, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui/section-card';
import { Paragraph } from '@/components/ui/app-paragraph';
import { ChevronRight } from '@/components/ui/icons';
import { InfoPageLink } from '../data/info-page.types';
import { infoPageRoute } from '../routes';

type InfoPageLinkListProps = {
  title: string;
  links: InfoPageLink[];
};

/**
 * Bilgi sayfalarına giden başlıklı bağlantı listesi. Ana sayfa alt bilgisi ve
 * yardım ekranı aynı bileşeni kullanır; hangi sayfaların listeleneceğini
 * çağıran belirler.
 */
export function InfoPageLinkList({ title, links }: InfoPageLinkListProps) {
  const router = useRouter();

  if (links.length === 0) return null;

  return (
    <SectionCard>
      <YStack>
        <Paragraph accessibilityRole="header" color="$color" fontSize={15} fontWeight="700">
          {title}
        </Paragraph>
        <Separator borderColor="$borderColor" marginTop="$3" />
        {links.map((link, index) => (
          <Pressable
            accessibilityLabel={link.label}
            accessibilityRole="link"
            key={link.slug}
            onPress={() => router.push(infoPageRoute(link.slug))}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <XStack
              alignItems="center"
              borderColor="$borderColor"
              borderTopWidth={index === 0 ? 0 : 1}
              gap="$2"
              minHeight={44}
              paddingVertical="$2.5"
            >
              <Paragraph color="$color" flex={1} fontSize={14}>
                {link.label}
              </Paragraph>
              <ChevronRight color="$color10" size={16} />
            </XStack>
          </Pressable>
        ))}
      </YStack>
    </SectionCard>
  );
}
