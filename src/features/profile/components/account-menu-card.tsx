import { ReactNode } from 'react';
import { Paragraph, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { ProfileMenuRow } from './profile-menu-row';

export type AccountMenuItem = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

type AccountMenuCardProps = {
  title: string;
  items: AccountMenuItem[];
};

/**
 * Titled card listing navigable account rows. Reused for "Size Özel" and
 * "Hesabım & Yardım" so the two sections stay structurally identical.
 */
export function AccountMenuCard({ title, items }: AccountMenuCardProps) {
  return (
    <SectionCard>
      <YStack gap="$1">
        <Paragraph color="$color" fontSize={17} fontWeight="700" marginBottom="$1">
          {title}
        </Paragraph>
        {items.map((item) => (
          <ProfileMenuRow
            icon={item.icon}
            key={item.label}
            label={item.label}
            onPress={item.onPress}
          />
        ))}
      </YStack>
    </SectionCard>
  );
}
