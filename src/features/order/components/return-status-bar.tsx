import { XStack, YStack } from 'tamagui';
import { Paragraph } from '@/components/ui/app-paragraph';
import { Check } from '@/components/ui/icons';
import { getReturnProgress } from '../utils/return-status';

/** İade ilerleme çubuğu (İade Beklemede → … → Ödeme İadesi Yapıldı), web paritesi. */
export function ReturnStatusBar({ status }: { status: number | null | undefined }) {
  const progress = getReturnProgress(status);
  if (!progress) return null;

  const activeColor = progress.isError ? '$red10' : '$brand';

  return (
    <XStack paddingHorizontal="$1" paddingVertical="$2" testID="return-status-bar">
      {progress.steps.map((label, index) => {
        const isCompleted = progress.completed[index];
        const isCurrent = index === progress.currentIndex;
        const reached = isCompleted || isCurrent;
        const lastIndex = progress.steps.length - 1;

        return (
          <YStack alignItems="center" flex={1} gap="$1.5" key={label}>
            <XStack alignItems="center" width="100%">
              <YStack
                backgroundColor={index === 0 ? 'transparent' : isCompleted ? activeColor : '$borderColor'}
                flex={1}
                height={2}
              />
              <XStack
                alignItems="center"
                backgroundColor={isCompleted ? activeColor : '$background'}
                borderColor={reached ? activeColor : '$borderColor'}
                borderRadius={100}
                borderWidth={1}
                height={18}
                justifyContent="center"
                width={18}
              >
                {isCompleted ? (
                  <Check color="white" size={11} />
                ) : (
                  <YStack
                    backgroundColor={reached ? activeColor : '$color8'}
                    borderRadius={100}
                    height={6}
                    width={6}
                  />
                )}
              </XStack>
              <YStack
                backgroundColor={
                  index === lastIndex ? 'transparent' : index < progress.currentIndex ? activeColor : '$borderColor'
                }
                flex={1}
                height={2}
              />
            </XStack>
            <Paragraph
              color={reached ? '$color' : '$color9'}
              fontSize={9}
              fontWeight={reached ? '700' : '500'}
              lineHeight={11}
              numberOfLines={3}
              textAlign="center"
            >
              {label}
            </Paragraph>
          </YStack>
        );
      })}
    </XStack>
  );
}
