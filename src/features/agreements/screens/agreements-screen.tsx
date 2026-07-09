import { useState } from 'react';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { AccordionSection, AppScreen, ScreenHeader } from '@/components/ui';
import { AGREEMENTS } from '../data/agreements';
import { AgreementContent } from '../components/agreement-content';

/**
 * "Sözleşmeler" — accordion of the company's legal texts (cookie policy, KVKK,
 * terms of use, framework agreement, disclosure). Static content; mirrors the
 * web accordion where each section toggles independently.
 */
export function AgreementsScreen() {
  const router = useRouter();
  const [openId, setOpenId] = useState<Record<string, boolean>>({});

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const toggle = (id: string) => setOpenId((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <AppScreen header={<ScreenHeader onBack={handleBack} title="Sözleşmeler" />}>
      <YStack gap="$3">
        {AGREEMENTS.map((agreement) => (
          <AccordionSection
            expanded={Boolean(openId[agreement.id])}
            key={agreement.id}
            onToggle={() => toggle(agreement.id)}
            title={agreement.title}
          >
            <AgreementContent blocks={agreement.blocks} />
          </AccordionSection>
        ))}
      </YStack>
    </AppScreen>
  );
}
