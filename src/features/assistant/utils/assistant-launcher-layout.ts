/**
 * Sağ-alt "Haydi Asistan" düğmesinin ölçüleri (mobil web düğmesiyle aynı, frontend `AssistantLauncher.tsx`
 * <768 px): 56 px koyu daire içinde 44 px turuncu daire. Köşe boşluğu `space` token'ı.
 */
export const ASSISTANT_LAUNCHER_SIZE = 56;
export const ASSISTANT_LAUNCHER_AVATAR_SIZE = 44;
export const ASSISTANT_LAUNCHER_INSET_TOKEN = '$4';

/** Asistan düğmesi ile üstüne yığılan düğme arasındaki boşluk (web `useAboveAssistantPosition`). */
const STACK_GAP = 8;

export type CornerPosition = { bottom: number; right: number };

/**
 * Sağ-alt köşede asistanla aynı sütunda duran yüzen düğmenin (ör. "Sayfanın başına dön") konumu:
 * asistan görünürken onun üstüne çıkar ve ortası asistan dairesiyle hizalanır, görünmezken köşeye iner.
 * `inset`, asistanın kenar boşluğu; her iki düğme de aynı alanın (sekme içeriği) köşesine yerleşir.
 */
export function resolveAboveAssistantLauncherPosition({
  inset,
  launcherVisible,
  size,
}: {
  inset: number;
  launcherVisible: boolean;
  size: number;
}): CornerPosition {
  if (!launcherVisible) return { bottom: inset, right: inset };
  return {
    bottom: inset + ASSISTANT_LAUNCHER_SIZE + STACK_GAP,
    right: inset + (ASSISTANT_LAUNCHER_SIZE - size) / 2,
  };
}
