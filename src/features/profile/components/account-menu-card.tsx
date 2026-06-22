import { ReactNode } from 'react';
import { Paragraph, Separator, YStack } from 'tamagui';
import { SectionCard } from '@/components/ui';
import { ProfileMenuRow } from './profile-menu-row';

export type AccountMenuItem = {
  icon: ReactNode;
  label: string;
  onPress: () => void;
};

type AccountMenuCardProps = {
  /** Optional section heading; omit for a single untitled row card. */
  title?: string;
  items: AccountMenuItem[];
};

/**
 * Card listing navigable account rows mirroring the web "Hesabım" list. An
 * optional heading lets the same card render both the titled account section and
 * the standalone help row.
 */
export function AccountMenuCard({ title, items }: AccountMenuCardProps) {
  return (
    <SectionCard elevated>
      <YStack gap="$1">
        {title ? (
          <>
            <Paragraph color="$color" fontSize={18} fontWeight="700">
              {title}
            </Paragraph>
            <Separator borderColor="$borderColor" marginBottom="$1" marginTop="$2" />
          </>
        ) : null}
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
